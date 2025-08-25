const express=require("express");
const app=express();
const mongoose = require('mongoose');
const path=require("path");
const ejsMate=require("ejs-mate");
app.engine('ejs',ejsMate);
const methodOverRide=require("method-override");
app.use(methodOverRide("_method"))
app.use(express.urlencoded({extended : true}));
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"))
app.use(express.json());
app.use(express.static(path.join(__dirname,"/public")))
const data=("./data.js");
const alumnii=require("./models/alumni.js")
const user=require("./models/user.js")
const cookieParser=require("cookie-parser")
const session=require("express-session")
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const port=8080;
main().then((res)=>{
    console.log("mongodb is working")
})
.catch((err) => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/alumni');
}

const sessionOption={
    secret:"mysupercode",
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
    }
}
app.use(session(sessionOption));
//to implement passport local we reqired sessions
app.use(flash());//imp to write before any get post request.......
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(user.authenticate()) )

passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success=req.flash("success"),
    res.locals.error=req.flash("error"),
    console.log(res.locals.success);
    next();
});

app.listen(port,()=>{
    console.log("running efficiently")
})

app.get("/",(req,res)=>{
  res.render(__dirname+'/views/pages/signup.ejs');
})
app.post("/",async(req,res)=>{
   let {username,email,password} = req.body;
   const newuser=new user({username,email});
   const registered=await user.register(newuser,password);
   console.log(registered);
   req.flash("success","welcome");
   res.redirect("/alumni/home");

});
app.post("/alumni/login",passport.authenticate('local',{failureRedirect:'/login',failureflash:true}),async(req,res)=>{
   req.flash("success","Logged In Successfully!");
   res.redirect("/alumni/home");
})
app.get("/alumni/login",(req,res)=>{
  res.render(__dirname+'/views/pages/login.ejs');
})
app.get("/alumni/home",(req,res)=>{
  res.render(__dirname+'/views/pages/home.ejs',);
})
app.get("/alumni/about",(req,res)=>{
  res.render(__dirname+'/views/pages/about.ejs');
})
app.get("/alumni/benefits",(req,res)=>{
  res.render(__dirname+'/views/pages/benfits.ejs');
})
app.get("/alumni/career",(req,res)=>{
  res.render(__dirname+'/views/pages/career.ejs');
})
app.get("/alumni/events",(req,res)=>{
  res.render(__dirname+'/views/pages/events.ejs');
})
app.get("/alumni/faqs",(req,res)=>{
  res.render(__dirname+'/views/pages/faqs.ejs');
})
app.get("/alumni/post",(req,res)=>{
  res.render(__dirname+'/views/pages/post.ejs');
})
app.get("/alumni/donation",(req,res)=>{
  res.render(__dirname+'/views/pages/donation.ejs');
})








