const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passout:{type:Number}
});

// Passport-local-mongoose adds password hash + authenticate() methods
userSchema.plugin(passportLocalMongoose);



module.exports = mongoose.model("User", userSchema);
