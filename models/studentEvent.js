// models/studentEvent.js
const mongoose = require("mongoose");

const StudentEventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 140 },
    studentName: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    // Accept either uploaded file path (/uploads/xyz.jpg) or a public image URL
    image: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StudentEvent", StudentEventSchema);
