const mongoose = require('mongoose');
const MONGOURL = 'mongodb://127.0.0.1:27017/alumni';
const sampleAlumni = require("../init/data.js");
const Alumni = require("../models/alumni.js");

async function main() {
  try {
    await mongoose.connect(MONGOURL);
    console.log("✅ MongoDB connected");

    // Check if data is array or object
    if (Array.isArray(sampleAlumni)) {
      await Alumni.insertMany(sampleAlumni);
    } else if (sampleAlumni.data) {
      await Alumni.insertMany(sampleAlumni.data);
    } else {
      throw new Error("⚠️ sampleAlumni format is invalid");
    }

    console.log("✅ Sample data inserted");
  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    await mongoose.connection.close();
  }
}

main();
