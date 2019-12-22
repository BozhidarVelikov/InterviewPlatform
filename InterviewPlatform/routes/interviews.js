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
// @Route POST /user/interviews
// Get all the interviews which the current user participates in.
// @Access Private
.post('/', auth, function(req, res) {
  sql = "SELECT id FROM Users WHERE fisrt_name = \"" + req.body.firstName + "\" AND last_name = \"" + req.body.lastName + "\" AND tag = \"" + req.body.tag + "\"" ;
  con.query(sql, function(err, result) {
    var userID;
    for(var i in result){
      userID = result[i].id;
    }
    sql = "SELECT (CONCAT(Users.fisrt_name,' ',Users.last_name,' #',Users.tag)) AS second_participant, Rooms.due_date, Rooms.position FROM Rooms INNER JOIN Users ON Rooms.second_participant = Users.id WHERE Rooms.fisrt_participant = \"" + userID + "\" ORDER BY Rooms.position, Rooms.due_date";
    con.query(sql, function(err, result) {
      if(err) throw err;
      var interviews = new Array();
      if(result && result.length) {
        for(var i in result) {
          date = new Date(result[i].due_date).toLocaleString();

          var interview = {
            name: result[i].second_participant,
            date: date,
            position: result[i].position
          }
          interviews.push(interview);
        }
      }
      sql = "SELECT (CONCAT(Users.fisrt_name,' ',Users.last_name,' #',Users.tag)) AS second_participant, Rooms.due_date, Rooms.position FROM Rooms INNER JOIN Users ON Rooms.fisrt_participant = Users.id WHERE Rooms.second_participant = \"" + userID + "\" ORDER BY Rooms.position, Rooms.due_date";
      con.query(sql, function(err, result) {
        if(err) throw err;
        if(result && result.length) {
          for(var i in result) {
            date = new Date(result[i].due_date).toLocaleString();

            var interview = {
              name: result[i].second_participant,
              date: date,
              position: result[i].position
            }
            interviews.push(interview);
          }
        }
        res.json({interviews: interviews});
      });
    });
  });
});

module.exports = router;