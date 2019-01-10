var mongoose = rquire("mongoose");

var userSchema = new mongoose.Schema{
  id: String,
  name: String,
  username:String
}

var user = mongoose.model("user", userSchema);

module.exports = user;
