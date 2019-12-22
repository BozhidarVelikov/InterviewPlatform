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
  sql = "SELECT id FROM Users WHERE fisrt_name = \"" + req.body.firstName + "\" AND last_name = \"" + req.body.lastName + "\" AND tag = \"" + req.body.tag + "\"" ;
  con.query(sql, function(err, result) {
    var userID;
    for(var i in result){
      userID = result[i].id;
    }
    sql = "SELECT (CONCAT(Users.fisrt_name,' ',Users.last_name,' #',Users.tag)) AS second_participant, Reviews.review, Reviews.position FROM Reviews INNER JOIN Users ON Reviews.candidate = Users.id WHERE Reviews.employer = \"" + userID + "\" ORDER BY Reviews.position, Users.fisrt_name, Users.last_name";
    con.query(sql, function(err, result) {
      if(result && result.length) {
        var reviews = new Array();
        for(var i in result){
          var review = {
            name: result[i].second_participant,
            review: result[i].review,
            position: result[i].position
          }
          reviews.push(review);
        }
        res.json({reviews: reviews});
      } else {
        res.json({msg:"You haven\'t reviewed anyone yet."});
      }
    });
  });
});

module.exports = router;