const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema(
  {
    Name: { type: String }, // make required if you need it
    PresentlyWorkingIn: { type: String, required: true },
    Post: { type: String, required: true },
    ProfileImage: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmVhY2glMjBob3VzZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
    },
    DateOfBirth: {
      type: Date,
      required: true,
      // trim doesn't apply to Date; removed
    },
    PassedOutYear: { type: Number, required: true },
    Email: { type: String },
    country: {
      type: String,      // <-- fixed
      required: true,
    },
    Bio: { type: String, required: true },
  },
  { timestamps: true }
);

// If your environment hot-reloads (e.g., Next.js), reuse model if it exists
const Alumni =
  mongoose.models.Alumni || mongoose.model("Alumni", listingSchema);

module.exports = Alumni;
