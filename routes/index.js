const express = require("express")
      router = express.Router(),
      middleware = require("../middleware");

router.get("/", function(req, res){
  res.render("home");
});

module.exports = router;
