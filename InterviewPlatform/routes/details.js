const express = require("express");
const jwt = require('jsonwebtoken');
const router = express.Router();

let sql = "";
const auth = require("../middlewares/auth.js");

// Database server
var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Bozhidar_1999",
  database: "Interview_Platfrom"
});

con.connect(function(err) {
  if (err) throw err;
 console.log("mySQL Connected!");
});

router
// @Route POST /user/reviews
// Get all the reviews which the current user has created.
// @Access Private
.post('/', auth, function(req, res) {
  sql = "SELECT * FROM Users WHERE id = \"" + req.body.user.id + "\"";
  con.query(sql, function(err, result) {
    var firstName;
    var lastName;
    var tag;
    var username;
    var employer;
    var email;

    for(var i in result){
      firstName = result[i].fisrt_name;
      lastName = result[i].last_name;
      tag = result[i].tag;
      username = firstName + " " + lastName + " #" + tag;
      employer = result[i].employer;
      email = result[i].email;
    }

    var message ={
      firstName:firstName,
      lastName:lastName,
      tag:tag,
      username:username,
      employer:employer,
      email:email
    };

    res.json(message);
  });
});

module.exports = router;