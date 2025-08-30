// models/alumni.js
const mongoose = require("mongoose");

const alumniSchema = new mongoose.Schema({
  name: { type: String, required: true },
  company: { type: String, required: true },
  email: { type: String, required: true },
  experience: { type: String },
  skills: { type: [String] },
  image: { type: String, default: "https://via.placeholder.com/150" }
});

module.exports = mongoose.model("Alumni", alumniSchema);
