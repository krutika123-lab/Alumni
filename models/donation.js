const mongoose = require("mongoose");

const donationperson = new mongoose.Schema({
  company: { type: String, required: true },
   description: { type: String, required: true },
    link: { type: String, required: true },
  amount: { type: Number ,required:true},

});

module.exports = mongoose.model("Donation", donationperson);
