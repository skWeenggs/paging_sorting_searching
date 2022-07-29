const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  
  name: String,
  email: String,
  contact_no: String,
  message: String,
  status: String,
  gender: String,
  city: String,
});

const User = mongoose.model("users", userSchema);

module.exports = User;
