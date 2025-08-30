// app.js
require("dotenv").config();

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const multer = require("multer");
const nodemailer = require("nodemailer");

const User = require("./models/user.js");
const AAlumni = require("./models/alumni.js");

const PORT = process.env.PORT || 8080;

/* ----------------------- MongoDB ----------------------- */
mongoose
  .connect("mongodb://127.0.0.1:27017/alumni")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("Mongo error:", err));

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
  secret: "mysupercode",
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

/* ----------------------- Nodemailer (ONE transporter) ----------------------- */
/*
   Recommended (secure): Gmail with App Password
   .env:
     EMAIL_USER=yourgmail@gmail.com
     EMAIL_PASS=your_16char_app_password

   If you MUST use a corporate / self-signed SMTP,
   set these (dev only):
     SMTP_HOST=smtp.yourmailserver.com
     SMTP_PORT=465
     SMTP_SECURE=true
     SMTP_REJECT_UNAUTHORIZED=false
*/
const mailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 465,
  secure:
    process.env.SMTP_SECURE !== undefined
      ? process.env.SMTP_SECURE === "true"
      : true, // true for 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // Dev-friendly default to avoid "self-signed certificate" on some networks.
  // For production, set SMTP_REJECT_UNAUTHORIZED=true in .env
  tls: {
    rejectUnauthorized:
      process.env.SMTP_REJECT_UNAUTHORIZED !== undefined
        ? process.env.SMTP_REJECT_UNAUTHORIZED === "true"
        : false,
  },
});

// Optional: log if transporter has issues at startup
mailTransporter
  .verify()
  .then(() => console.log("Mail transporter is ready"))
  .catch((e) => console.error("Mail transporter error:", e.message));

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
app.get("/", (req, res) => res.render("pages/signup"));
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

// login
app.get("/alumni/login", (req, res) => res.render("pages/login"));
app.post(
  "/alumni/login",
  passport.authenticate("local", {
    failureRedirect: "/alumni/login",
    failureFlash: true,
  }),
  (req, res) => res.redirect("/alumni/home")
);

// logout
app.get("/alumni/logout", (req, res) => {
  req.logout(() => {
    req.flash("success", "Logged out successfully!");
    res.redirect("/alumni/login");
  });
});

// protected pages
app.get("/alumni/home", isLoggedIn, (req, res) => res.render("pages/home"));
app.get("/alumni/about", isLoggedIn, (req, res) => res.render("pages/about"));
app.get("/alumni/benefits", isLoggedIn, (req, res) =>
  res.render("pages/benefits")
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
  let { name, company, email, experience, skills } = req.body;
  const image = req.file
    ? `/uploads/${req.file.filename}`
    : "https://via.placeholder.com/150";

  if (skills) {
    skills = skills.split(",").map((s) => s.trim()).filter(Boolean);
  } else {
    skills = [];
  }

  const doc = new AAlumni({ name, company, email, experience, skills, image });
  await doc.save();

  req.flash("success", "New Alumni Post Created!");
  res.redirect("/alumni/post");
});

/* --------- Send Email (always JSON; uses single transporter) --------- */
app.post("/alumni/send-email", isLoggedIn, async (req, res) => {
  try {
    let { recipients, subject, message } = req.body;

    // Normalize recipients
    if (!Array.isArray(recipients)) {
      recipients = typeof recipients === "string"
        ? recipients.split(",").map(e => e.trim())
        : [];
    }
    recipients = recipients.filter(Boolean);

    if (!recipients.length) {
      return res.status(400).json({ success: false, error: "No recipients provided" });
    }

    await mailTransporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: recipients.join(","),
      subject: subject || "Alumni Connection",
      text: message || "",
    });

    return res.json({ success: true });
  } catch (err) {
    console.error("Email send error:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "MAIL_ERROR",
    });
  }
});

/* ----------------------- Misc ----------------------- */
app.get("/alumni/donation", isLoggedIn, (req, res) =>
  res.render("pages/donation")
);

app.listen(PORT, () => console.log("Server running on port", PORT));
