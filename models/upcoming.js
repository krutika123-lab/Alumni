// models/eventModel.js
const mongoose = require("mongoose");

const upcomingSc = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    clubName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    date: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    fees: {
      type: Number,
      default: 0, // free if not given
      min: 0,
    },
        image: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("upcoming", upcomingSc);
