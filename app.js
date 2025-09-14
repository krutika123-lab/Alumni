// app.js
require("dotenv").config();

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const bodyParser = require("body-parser");
const fs = require("fs");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const multer = require("multer");
const User = require("./models/user.js");
const AAlumni = require("./models/alumni.js");
const Donation=require("./models/donation.js");
const EEvent = require("./models/studentEvent.js");
const AAlumniview= require("./models/alumniview.js");
const PORT = process.env.PORT || 3000;

/* ----------------------- MongoDB ----------------------- */

const MONGOURL = process.env.DB_URL;

async function main() {
  try {
    await mongoose.connect(MONGOURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB Connected");
  } catch (err) {
    console.error(" MongoDB connection error:", err.message);
  }
}

main();

/* ----------------------- Express Core ----------------------- */
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(cookieParser("secretcode"));
app.use(express.static(path.join(__dirname, "public")));

/* Ensure uploads directory exists */
const uploadsDir = path.join(__dirname, "public", "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });

/* ----------------------- Sessions / Auth ----------------------- */
const sessionOptions = {
  secret:process.env.secretsession ,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
};
app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

/* ----------------------- Multer (file uploads) ----------------------- */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });


/* ----------------------- Auth guard ----------------------- */
const isLoggedIn = (req, res, next) => {
  const loggedIn = req.isAuthenticated && req.isAuthenticated();
  if (loggedIn) return next();

  // If it's an AJAX/JSON request, return JSON instead of HTML redirect
  const wantsJSON =
    req.xhr ||
    req.get("x-requested-with") === "XMLHttpRequest" ||
    (req.get("accept") || "").includes("application/json") ||
    (req.headers["content-type"] || "").includes("application/json");

  if (wantsJSON) {
    return res.status(401).json({ success: false, error: "LOGIN_REQUIRED" });
  }

  req.flash("error", "You must be logged in!");
  return res.redirect("/alumni/login");
};

/* ----------------------- Routes ----------------------- */

// signup
app.get("/", (req, res) => res.render("pages/allogin"));
app.post("/", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email });
    await User.register(user, password);
    req.flash("success", "Signup successful! Please login.");
    res.redirect("/alumni/login");
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/");
  }
});

app.get("/alumni/signup", (req, res) => res.render("pages/signup"));
app.post("/alumni/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email });
    await User.register(user, password);
    req.flash("success", "Signup successful! Please login.");
    res.redirect("/alumni/login");
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/");
  }
});
// login
app.get("/alumni/login", (req, res) => res.render("pages/login"));
app.post(
  "/alumni/login",
  passport.authenticate("local", {
    failureRedirect: "/alumni/login",
    failureFlash: true,
  }),
  (req, res) => {
    // ✅ Add flash with username
    req.flash("success", `Welcome to CCOEW Nagpur Alumni Portal, ${req.user.username}!`);
    res.redirect("/alumni/home");
  }
);

// protected pages
app.get("/alumni/home", isLoggedIn, (req, res) =>{
  req.flash("success","Welcome!!");
   res.render("pages/home")
  });
app.get("/alumni/about", isLoggedIn, (req, res) => res.render("pages/about"));
app.get("/alumni/benfits", isLoggedIn, (req, res) =>
  res.render("pages/benfits")
);
app.get("/alumni/career", isLoggedIn, (req, res) =>
  res.render("pages/career")
);
app.get("/alumni/events", isLoggedIn, (req, res) =>
  res.render("pages/events")
);
app.get("/alumni/faqs", isLoggedIn, (req, res) => res.render("pages/faqs"));

app.get("/alumni/post", isLoggedIn, async (req, res) => {
  const aalumni = await AAlumni.find({});
  res.render("pages/post", { aalumni });
});

// create a new alumni post
app.post("/alumni/post", isLoggedIn, upload.single("image"), async (req, res) => {
  let { name, company, email, experience, skills,passout } = req.body;
  const image = req.file
    ? `/uploads/${req.file.filename}`
    : "https://via.placeholder.com/150";

  if (skills) {
    skills = skills.split(",").map((s) => s.trim()).filter(Boolean);
  } else {
    skills = [];
  }

  const doc = new AAlumni({ name, company, email, experience, skills,passout, image });
  await doc.save();

  req.flash("success", "New Alumni Post Created!");
  res.redirect("/alumni/post");
});
// Edit form (only author can access)
app.get("/alumni/post/:id/edit", isLoggedIn, async (req, res) => {
  const post = await AAlumni.findById(req.params.id);
  if (!post) {
    req.flash("error", "Post not found.");
    return res.redirect("/alumni/post");
  }
  // ✅ check ownership (by email matching logged-in user email)
  if (post.email !== req.user.email) {
    req.flash("error", "You can only edit your own post!");
    return res.redirect("/alumni/post");
  }
  res.render("pages/editPost", { post });
});

// Update post
app.put("/alumni/post/:id", isLoggedIn, upload.single("image"), async (req, res) => {
  const { id } = req.params;
  let post = await AAlumni.findById(id);
  if (!post) {
    req.flash("error", "Post not found.");
    return res.redirect("/alumni/post");
  }
  if (post.email !== req.user.email) {
    req.flash("error", "You can only edit your own post!");
    return res.redirect("/alumni/post");
  }

  let { name, company, email, experience, skills,passout } = req.body;
  if (skills) {
    skills = skills.split(",").map(s => s.trim()).filter(Boolean);
  } else {
    skills = [];
  }

  const image = req.file ? `/uploads/${req.file.filename}` : post.image;

  await AAlumni.findByIdAndUpdate(id, {
    name, company, email, experience, skills, image,passout
  });

  req.flash("success", "Post updated successfully!");
  res.redirect("/alumni/post");
});

// Delete post
app.delete("/alumni/post/:id", isLoggedIn, async (req, res) => {
  const post = await AAlumni.findById(req.params.id);
  if (!post) {
    req.flash("error", "Post not found.");
    return res.redirect("/alumni/post");
  }
  if (post.email !== req.user.email) {
    req.flash("error", "You can only delete your own post!");
    return res.redirect("/alumni/post");
  }

  await AAlumni.findByIdAndDelete(req.params.id);
  req.flash("success", "Post deleted successfully!");
  res.redirect("/alumni/post");
});


app.get("/alumni/alumniview", async (req, res) => {
  try {
    const aalumniview = await AAlumniview.find().sort({ createdAt: -1 });
    res.render("pages/alumniview", { posts: aalumniview });
  } catch (err) {
    req.flash("error","Dont Add Same UserName!!")
  }
});

// POST route
app.post("/alumni/alumniview", async (req, res) => {
  try {
    const { section, name, description } = req.body;
    const newPost = new AAlumniview({ section, name, description });
    await newPost.save();
    res.redirect("/alumni/alumniview");
  } catch (err) {
   req.flash("error","Faild to add Suggestion!!")
  }
});

// 📌 GET all donations
app.get("/alumni/donation", isLoggedIn, async (req, res) => {
  try {
    const donation = await Donation.find({}).sort({ createdAt: -1 }).lean();
    res.render("pages/donation", { donation });
  } catch (err) {
    console.error("Error fetching donations:", err);
    req.flash("error", "Failed to load donations");
    res.render("pages/donation", { donation: [] });
  }
});

// 📌 POST new donation request
app.post("/alumni/donation", isLoggedIn, upload.single("image"), async (req, res) => {
  try {
    const { studentName, description, amount, contact } = req.body;

    // If file uploaded, use its path. Else fallback placeholder.
    const image = req.file
      ? `/uploads/${req.file.filename}`
      : "https://via.placeholder.com/150";

    const donn = new Donation({
      studentName,
      description,
      amount,
      contact,
      image
    });

    await donn.save();

    req.flash("success", "New Donation Request Added!");
    res.redirect("/alumni/donation");
  } catch (err) {
    console.error("Error adding donation:", err);
    req.flash("error", "Failed to add donation");
    res.redirect("/alumni/donation");
  }
});

// 📌 DELETE donation request
app.delete("/alumni/donation/:id", isLoggedIn, async (req, res) => {
  try {
    await Donation.findByIdAndDelete(req.params.id);
    req.flash("success", "Donation request deleted successfully!");
    res.redirect("/alumni/donation");
  } catch (err) {
    console.error("Error deleting donation:", err);
    req.flash("error", "Failed to delete donation request.");
    res.redirect("/alumni/donation");
  }
});


// 📌 GET all events
app.get("/alumni/event", isLoggedIn, async (req, res) => {
  try {
    const eevent = await EEvent.find({}).sort({ createdAt: -1 }).lean();
    res.render("pages/event", { eevent });
  } catch (err) {
    console.error("Error fetching events:", err);
    res.render("pages/event", { eevent: [] });
  }
});

// 📌 POST new event
app.post("/alumni/event", isLoggedIn, upload.single("image"), async (req, res) => {
  try {
    const { title, studentName, description, date, time, link } = req.body;

    // ✅ choose uploaded file or fallback placeholder
    const image = req.file
      ? `/uploads/${req.file.filename}`
      : "https://via.placeholder.com/150";

    // ✅ save to DB
    await EEvent.create({ title, studentName, description, date, time, link, image });

    req.flash("success", "New Event Added!");
    res.redirect("/alumni/event");
  } catch (err) {
    console.error("Error adding event:", err);
    req.flash("error", "Error adding event");
    res.redirect("/alumni/event");
  }
});
app.get("/alumni/gallary",isLoggedIn,(req,res)=>{
  try{
  req.flash("success","Welcome to CCOEW,Nagpur alumni Gallary!! ");
  res.render("pages/gallary");
  }
  catch(err){
    req.flash("error","Gallary Not Found!!")
  }
})

app.listen(PORT, () => console.log(`✅ Server running on ${PORT}`));
;

