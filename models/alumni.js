// models/alumni.js
const mongoose = require("mongoose");

const alumniSchema = new mongoose.Schema({
  name: { type: String, required: true },
  company: { type: String, required: true },
  email: { type: String, required: true },
  experience: { type: String },
  skills: { type: [String] },
  image: { type: String, default: "https://news.temple.edu/sites/news/files/shutterstock_531382432-scaled_0.jpg" }
});

module.exports = mongoose.model("Alumni", alumniSchema);
