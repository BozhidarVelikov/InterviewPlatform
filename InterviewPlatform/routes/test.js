const express = require("express");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

router
// @Route POST /user/test
// Login a user 
// @Access Public
.get("/", function(req, res) {
  console.log("Test");
});

module.exports = router;