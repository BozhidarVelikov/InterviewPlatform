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
// @Route POST /user/create-review
// Create a review for another user.
// @Access Private
.post('/', auth, function(req, res) {
	var fisrt_participant = req.body.username;
  fisrt_participant = fisrt_participant.split(" ");
  fisrt_participant[2] = fisrt_participant[2].substring(1, fisrt_participant[2].length);
  var second_participant = req.body.companion;
  second_participant = second_participant.split(" ");
  second_participant[2] = second_participant[2].substring(1, second_participant[2].length);
  sql = "SELECT id FROM Users WHERE fisrt_name = \"" + fisrt_participant[0] + "\" AND last_name = \"" + fisrt_participant[1] + "\" AND tag = \"" + fisrt_participant[2] + "\"";
  con.query(sql, function(err, result) {
  	if(err) throw err;
  	if(result && result.length) {
		  for(var i in result) {
		  	fisrt_participant = result[i].id;
		  }
		  sql = "SELECT id FROM Users WHERE fisrt_name = \"" + second_participant[0] + "\" AND last_name = \"" + second_participant[1] + "\" AND tag = \"" + second_participant[2] + "\"";
		  con.query(sql, function(err, result) {
		  	if(err) throw err;
		  	if(result && result.length) {
			  	for(var i in result) {
		  			second_participant = result[i].id;
		  	  }
		  	  var position = req.body.position;
		  	  var review = req.body.review;

		  	  sql = "INSERT INTO Reviews(employer, candidate, review, position) VALUES (\"" + fisrt_participant + "\", \"" + second_participant + "\", \"" + review + "\", \"" + position + "\")";
		  	  con.query(sql, function(err, result) {
		  	  	if(err) throw err;
		  	  	res.json({msg: "Done!"});
		  	  })
		  	} else {
		  		res.json({msg: "User does not exist!"})
		  	}
		  });
		} else {
			res.json({msg: "User not logged in!"})
		}
	});
});

module.exports = router;