// models/alumni.js
const mongoose = require("mongoose");

const alumniSchema = new mongoose.Schema({
  name: { type: String, required: true },
  company: { type: String, required: true },
  email: { type: String, required: true,unique:true },
  experience: { type: String,required:true },
  skills: { type: [String],required:true },
  passout:{type:Number,required:true},
  image: { type: String, default: "https://news.temple.edu/sites/news/files/shutterstock_531382432-scaled_0.jpg",required:true}
});

module.exports = mongoose.model("Alumni", alumniSchema);
