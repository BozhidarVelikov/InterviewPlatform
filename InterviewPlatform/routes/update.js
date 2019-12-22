const express = require("express");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

const auth = require("../middlewares/auth.js");

let sql = "";

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
// @Route POST /user/update
// Update corresponding user details, based on updateID.
// @Access Private
.post("/", auth, function(req, res) {
  var updateID = req.body.id;
  var email = req.body.email;
  switch(updateID) {
    // Change name
    case 1:
      var fName = req.body.firstName;
      var lName = req.body.lastName;

      if(fName != undefined && lName != undefined) {
	    sql = "UPDATE Users SET fisrt_name = \"" + fName + "\", last_name = \"" + lName + "\" "
	          + "WHERE email = \"" + email + "\"";
	    con.query(sql, function(err, result) {
	      if (err) throw err;

	      let tag = Math.floor(Math.random() * 999) + 1000;
		    sql = "SELECT tag FROM Users WHERE fisrt_name = \"" + fName + "\" AND last_name = \"" + lName + "\"";  
          con.query(sql, function (err, result) {
            if (err) throw err;
            while(true) {
              flag = true;
           	  for (var i in result) {
                if(result[i].tag == tag) {
                  tag = Math.floor(Math.random() * 999) + 1000;
                  flag = false;
                }
              }
          	  if(flag) {
                break;
              }
            }
            sql = "UPDATE Users SET tag = \"" + tag + "\" WHERE email = \"" + email + "\"";
            con.query(sql, function(err, result) {
            	if(err) throw err;
            	res.json({msg:"Done!", tag: tag});
            })
	      });
  	    });
  	  } else {
  	  	res.json("Something happened. Please, contact support!");
  	  }
      break;
    // Change email
    case 2:
      var newEmail = req.body.newEmail;
      sql = "SELECT id FROM Users WHERE email = \"" + newEmail + "\"";
      con.query(sql, function(err, result) {
      	if(err) throw err;
      	if(result && result.length) {
      		res.json({msg:"Email exists!"});
      	} else {
      	  sql = "UPDATE Users SET email = \"" + newEmail + "\" WHERE email = \"" + email + "\"";
	      con.query(sql, function(err, result) {
	        if (err) throw err;
	        res.json({msg:"Done!"});
	      });
      	}
      });
      break;
    // Change password
    case 3:
      var password = req.body.password;
      var salt = bcrypt.genSaltSync(10);
      var hash = bcrypt.hashSync(password, salt);
      sql = "UPDATE Users SET password = \"" + hash + "\" WHERE email = \"" + email + "\"";
      con.query(sql, function(err, result) {
        if (err) throw err;
        res.json({msg:"Done!"});
      });
      break;
    // Add 4th case allowing the user to change the employer state.
    default:
      res.json({msg:"Something happened. Please, contact support!"});
      break;
  }
});

module.exports = router;