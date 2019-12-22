const express = require("express");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

let sql = "";
// const auth = require("../middlewares/auth.js");

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
// @Route POST /user/register
// Register a user. 
// @Access Public
.post("/", function(req, res) {
  const body = req.body;
  const fName = body.firstName;
  const lName = body.lastName;
  const email = body.email;
  const password = body.password;
  var employer = 0;

  if(body.employer == 1) {
    employer = 1;
  }

  // Validation for empty inputs
  if(fName == "" || lName == "" || email == "" || password == "") {
    res.status(400).json({msg:"All fields are mandatory!"});
  } else {
    sql = "SELECT email FROM Users WHERE email = \"" + email + "\"";
    con.query(sql, function (err, result) {
      if (err) throw err;
    
      if(result && result.length) {
       res.json({msg: "There is already a user with that email!"});
      } else {      
        let tag = Math.floor(Math.random() * 999) + 1000;
        let salt = bcrypt.genSaltSync(10);
        let hash = bcrypt.hashSync(password, salt);

        // Create a unique tag between 1000 and 1999 for everyone with the same name
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
          sql = "INSERT INTO Users(fisrt_name, last_name, tag, email, password, employer) VALUES "
                + "(\"" + fName + "\", \"" + lName + "\", \"" + tag + "\", \"" + email + "\", \"" + hash + "\", \""  + employer + "\")";
         con.query(sql, function (err, result) {
            if (err) throw err;
            res.json({msg: "You have been successfully registered!"});
          });
        });      
      }
    });
	}
});

module.exports = router;