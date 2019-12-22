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
// @Route POST /user/delete-interview
// Delete the interview the user has selected.
// @Access Private
.post('/', auth, function(req, res) {
  var employer = req.body.employer;
  employer = employer.split(" ");
  employer[2] = employer[2].replace("#", "");

  var candidate = req.body.candidate;
  candidate = candidate.split(" ");
  candidate[2] = candidate[2].replace("#", "");

  var date = req.body.date;
  var employerID;
  var candidateID;

  sql = "SELECT id FROM Users WHERE fisrt_name = \"" + employer[0] + "\" AND last_name = \"" + employer[1] + "\" AND tag = \"" + employer[2] + "\"";
  con.query(sql, function(err, result) {
    if(err) throw err;

    for(var i in result) {
      employerID = result[i].id;
    }

    sql = "SELECT id FROM Users WHERE fisrt_name = \"" + candidate[0] + "\" AND last_name = \"" + candidate[1] + "\" AND tag = \"" + candidate[2] + "\"";
    con.query(sql, function(err, result) {
      if(err) throw err;

      for(var i in result) {
        candidateID = result[i].id;
      }

      // Transform date(this shouldn't be like this).
      date = (req.body.date).toString();
      date = date.replace("T", " ");
      date = date.replace("Z", "");
      date = date.replace(".000", "");
      date = date.split(", ");
      var time = date[1].substring(0, date[1].length - 3);
      time = time.split(":");
      if(date[1].substring(date[1].length - 2, date[1].length) == "PM") {
      	time[0] = (parseInt(time[0], 10) + 12).toString();
      }
      var date = date[0];
      date = date.split("/")
      date = new Date(Date.UTC(date[2], date[0] - 1, date[1], time[0], time[1], time[2])).toJSON();
      date = date.replace("T", " ");
      date = date.replace("Z", "");
      date = date.replace(".000", "");

      sql = "DELETE FROM Rooms WHERE fisrt_participant = \"" + employerID + "\" AND second_participant = \"" + candidateID + "\" AND due_date = \"" + date + "\"";
      con.query(sql, function(err, result) {
        if(err) throw err;
        sql = "DELETE FROM Rooms WHERE fisrt_participant = \"" + candidateID + "\" AND second_participant = \"" + employerID + "\" AND due_date = \"" + date + "\"";
        con.query(sql, function(err, result) {
          if(err) throw err;
          res.json({msg: "Done!"});
        });
      });   
    });
  });
});

module.exports = router;