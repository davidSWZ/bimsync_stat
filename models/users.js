var mongoose = require("mongoose");

var userSchema = new mongoose.Schema({
  id: String,
  name: String,
  username:String,
  oauth: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "oauth"
  }
});

var user = mongoose.model("user", userSchema);

module.exports = user;
