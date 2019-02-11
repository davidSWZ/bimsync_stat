var mongoose = require("mongoose");

var userSchema = new mongoose.Schema({
  id: String,
  name: String,
  username:String,
  access_token: String,
  refresh_token: String
});

var user = mongoose.model("user", userSchema);

module.exports = user;
