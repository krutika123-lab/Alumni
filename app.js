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
const cookieParser=require("cookie-parser")
const session=require("express-session")
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const port=8080;

app.listen(port,()=>{
    console.log("running efficiently")
})

app.get("/",(req,res)=>{
  res.render(__dirname+'/views/pages/signup.ejs');
})
app.post("/",(req,res)=>{
  res.redirect("/alumni/home")
})
app.post("/alumni/login",(req,res)=>{
  res.redirect("/alumni/home")
})
app.get("/alumni/login",(req,res)=>{
  res.render(__dirname+'/views/pages/login.ejs');
})
app.get("/alumni/home",(req,res)=>{
  res.render(__dirname+'/views/pages/home.ejs');
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
app.get("/alumni/email",(req,res)=>{
  res.render(__dirname+'/views/pages/email.ejs');
})







