const { MongoTailableCursorError } = require("mongodb");
const mongoose=require("mongoose");
const passportLocalMongoose=require("passport-local-mongoose");

const User=new mongoose.Schema({
   username:{
    type:String,
    required:true
  },
  email:{
    type:String,
  },
  password:{
    type:String,
    required:true
  }
})
User.plugin(passportLocalMongoose);
module.exports=mongoose.model('User',User);