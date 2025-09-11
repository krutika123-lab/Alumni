// models/studentEvent.js
const mongoose = require("mongoose");

const StudentEventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 140 },
    studentName: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    link: { type: String, required: true, trim: true }, // ✅ renamed from linkk
    date: { type: Date, required: true },               // ✅ renamed from day
    time: { type: String, required: true, trim: true, maxlength: 160 },
    image: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StudentEvent", StudentEventSchema);
