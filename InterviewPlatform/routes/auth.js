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
// @Route POST /auth/login
// Login a user 
// @Access Public
.post("/", function(req, res) {
  sql = "SELECT id, fisrt_name, last_name, tag, password, employer FROM Users WHERE email = \"" +  req.body.email + "\"";
  con.query(sql, function(err, result) {
    if(result && result.length) {
      var id;
      var hash;

      for(var i in result) {
        id = result[i].id;
        hash = result[i].password;
      }

      if(bcrypt.compareSync(req.body.password, hash)) {
        const payload = {
        	user: {
        		id: id
        	}
        };

        jwt.sign(
        	payload,
        	"bearer",
        	{ expiresIn: 360000 },
        	function (err, token) {
        		if(err) throw err;
        		res.json({token});
        	})
      } else {
        res.status(404).json({msg:"Wrong password!"});
      }
    } else {
      res.status(404).json({msg:"A user with this email does not exist!"});
    }
  })
});

module.exports = router;