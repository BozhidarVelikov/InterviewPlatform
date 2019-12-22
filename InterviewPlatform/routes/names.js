const express = require("express");
const jwt = require('jsonwebtoken');
const router = express.Router();

let sql = "";
//const auth = require("../middlewares/auth.js");

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
// Returns all names that contain a certain substring. Used by the search for
// the create room and create review pages.
// @Access Public
.post("/", function(req, res) {
  var fisrt_name = req.body.firstName;
  var last_name = "";
  if(req.body.lastName) {
  	last_name = req.body.lastName;
  }

  if(last_name == "") {
  	sql = "SELECT fisrt_name, last_name, tag FROM Users WHERE fisrt_name LIKE \"" + fisrt_name + "%\"";
  	con.query(sql, function(err, result) {
  		if(err) throw err;
  		var names = new Array();
  		if(result && result.length) {
  			for(var i in result) {
  				var name = {
  					firstName: result[i].fisrt_name, 
  					lastName: result[i].last_name,
  					tag: result[i].tag
  				};
  				names.push(name);
  			}
  			res.json({names:names});
  		} else {
  			res.json({msg:"No results!"});
  		}
  	})
  } else {
  	sql = "SELECT fisrt_name, last_name, tag FROM Users WHERE fisrt_name LIKE \"" + fisrt_name + "%\" AND last_name LIKE \"" + last_name + "%\"";
  	con.query(sql, function(err, result) {
  		if(err) throw err;
  		var names = new Array();
  		if(result && result.length) {
  			for(var i in result) {
  				var name = {
  					firstName: result[i].fisrt_name, 
  					lastName: result[i].last_name,
  					tag: result[i].tag
  				};
  				names.push(name);
  			}
  			res.json({names:names});
  		} else {
  			res.json({msg:"No results!"});
  		}
  	})
  }
});

module.exports = router;