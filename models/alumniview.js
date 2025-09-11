const mongoose = require("mongoose");

const alumniSchema = new mongoose.Schema({
  section: {
    type: String,
    enum: ["interview", "mtech", "offcampus"],
    required: true,
  },
  name: { type: String, required: true,unique:true },
  description: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("AAlumniview", alumniSchema);
