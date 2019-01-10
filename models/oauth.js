var mongoose = require("mongoose");

var oauthSchema = new mongoose.Schema({
    access_token: String,
    refresh_token: String,
    token_type: String,
    expires_in: Number
});

var oauth = mongoose.model('oauth', oauthSchema);

module.exports = oauth;
