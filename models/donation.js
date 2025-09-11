const mongoose = require("mongoose");

const DonationSchema = new mongoose.Schema(
  {
    studentName: { type: String, required: true, trim: true, maxlength: 100 }, // 👈 consistent naming
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    amount: { type: Number, required: true, min: 1 },
    contact: { type: String, required: true, trim: true, maxlength: 15 }, // 👈 store as string
    image: {
      type: String,
      trim: true,
      default: "https://news.temple.edu/sites/news/files/shutterstock_531382432-scaled_0.jpg"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Donation", DonationSchema);
