const express = require("express");
const bodyParser = require('body-parser');
const cors = require("cors");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

const io = require('socket.io')(http);

const app = express();
const port = 3000;

const authRoute = require("./routes/auth.js");
const registerRoute = require("./routes/register.js");
const updateUserRoute = require("./routes/update.js");
const interviewsRoute = require("./routes/interviews.js");
const reviewsRoute = require("./routes/reviews.js");
const deleteInterviewRoute = require("./routes/delete-interview.js");
const createRoomRoute = require("./routes/create-room.js");
const createReviewRoute = require("./routes/create-review.js");
const namesRoute = require("./routes/names.js");
const detailsRoute = require("./routes/details.js");
const test = require("./routes/test.js");

let sql = "";

// Allow CORS to server
app.use(cors("*"));

// Body Parser middleware
app.use(bodyParser.json());


// const http = require("http");
const path = require("path");
const fs = require("fs");

app.get("/", express.static(path.join(__dirname, "./public")));

const multer = require("multer");

const handleError = (err, res) => {
  res
    .status(500)
    .contentType("text/plain")
    .end("Oops! Something went wrong!");
};

const upload = multer({
  dest: "../images/account-images"
});

app.post("/avatar", (req, res) => {
	const fileName = req.body.username.split(" ");
	fileName[2] = fileName[2].replace("#", "");
	const imageFilePath = 'images/account-images/' + fileName[0] + "-" + fileName[1] + "-" + fileName[2] + ".jpg";

	try {
  		if (fs.existsSync(imageFilePath)) {
    		res.json({msg:imageFilePath});
  		} else {
  			res.json({msg:"images/account-images/default.png"});
  		}
	} catch(err) {
  		console.error(err)
	}
});

app.post("/upload", upload.single("file"), (req, res) => {
    console.log("OK");
    if(req.file.path) {
	    const tempPath = req.file.path;
	    const fileName = req.body.username.split(" ");
		fileName[2] = fileName[2].replace("#", "");
	    const targetPath = path.join(__dirname, "images/account-images/" + fileName[0] + "-" + fileName[1] + "-" + fileName[2] + ".jpg");

	    if (path.extname(req.file.originalname).toLowerCase() === ".jpg") {
	      fs.rename(tempPath, targetPath, err => {
	        if (err) return handleError(err, res);
	        // res.end();
	        // fs.readFile("./account.html", null, function(error, data) {
	        // 	console.log(__dirname);
	        // 	if(error) throw error;
	        // 	res.writeHead(200, {"Content-Type":"text/html"})
	        // 	res.write(data);
	        // });
	        // res.sendFile(path.join(__dirname + '/account.html'));
	        res.redirect("http://www.bojidar.co.nf")
	      });
	    } else {
	      fs.unlink(tempPath, err => {
	        if (err) return handleError(err, res);

	        res.status(403).contentType("text/plain").end("Only .jpg files are allowed!");
      	  });
    	}
	}
});


app.use("/auth/login", authRoute);
app.use("/user/register", registerRoute);
app.use("/user/update", updateUserRoute);
app.use("/user/interviews", interviewsRoute);
app.use("/user/reviews", reviewsRoute);
app.use("/user/delete-interview", deleteInterviewRoute);
app.use("/user/create-room", createRoomRoute);
app.use("/user/create-review", createReviewRoute);
app.use("/names", namesRoute);
app.use("/user/details", detailsRoute);
app.use("/test", test);

app.use(express.static(__dirname + '/views'));
app.use(express.static(__dirname + '/scripts'));
app.use(express.static(__dirname + '/css'));
app.use(express.static(__dirname + '/bootstrap-4.3.1-dist'));
app.use(express.static(__dirname + '/src-noconflict'));

// Create Server
app.listen(port, () => console.log(`Server running on port ${port}!`));

// ----------------------------------------------------------------------------------------------------------------

// Room connect server
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });
const users = {}

const sendTo = (ws, message) => {
  ws.send(JSON.stringify(message));
};

wss.on('connection', ws => {

  ws.on('message', message => {
    let data = null;

    try {
      data = JSON.parse(message);
    } catch (error) {
      console.error('Invalid JSON', error);
      data = {};
    }

    switch (data.type) {
      case 'login':
        if (users[data.username]) {
          sendTo(ws, { type: 'login', success: false });
        } else {
          users[data.username] = ws;
          ws.username = data.username;
          sendTo(ws, { type: 'login', success: true });
        }
        break;
      case 'offer':
        if (users[data.otherUsername] != null) {
          ws.otherUsername = data.otherUsername;
          sendTo(users[data.otherUsername], {
            type: 'offer',
            offer: data.offer,
            username: ws.username
          });
        }
        break;
      case 'answer':
        if (users[data.otherUsername] != null) {
          ws.otherUsername = data.otherUsername;
          sendTo(users[data.otherUsername], {
            type: 'answer',
            answer: data.answer
          });
        }
        break;
      case 'candidate':
        if (users[data.otherUsername] != null) {
          sendTo(users[data.otherUsername], {
            type: 'candidate',
            candidate: data.candidate
          });
        }
        break;
      case 'close':
        if(users[data.otherUsername]){
          users[data.otherUsername].otherUsername = null;
        }
        if (users[data.otherUsername] != null) {
          sendTo(users[data.otherUsername], { type: 'close' });
        }
        break;
      case 'reconnect':
        if(users[data.username]){
          delete users[data.username];
        }
      case 'canvas':
        if (users[data.otherUsername] != null) {
          sendTo(users[data.otherUsername], {
            type: 'canvas',
            clickX: data.clickX,
            clickY: data.clickY,
            clickDrag: data.clickDrag,
            clickColor: data.clickColor,
            brushSize: data.brushSize,
            clickTool: data.clickTool
          });
        }
        break;

      case 'editor':
        if(users[data.otherUsername] != null) {
          sendTo(users[data.otherUsername], {
            type: 'editor',
            code: data.code
          });
        }
        break;

      case 'chat':
      	if(users[data.otherUsername] != null) {
      		console.log(data.chatMessage);
      	  sendTo(users[data.otherUsername], {
      	  	type: 'chat',
      	  	chatMessage: data.chatMessage
      	  });
      	}
      	break;

      default:
        sendTo(ws, {
          type: 'error',
          message: 'Command not found: ' + data.type
        });

        break;
    }
  });

  ws.on('close', () => {
    if (ws.username) {
      delete users[ws.username];

      try {
	    if (ws.otherUsername) {
	      users[ws.otherUsername].otherUsername = null;

	      if (users[ws.otherUsername] != null) {
	        sendTo(users[ws.otherUsername], { type: 'close' });
	      }
	    }
	  } catch(err) {

	  }
    }
  });
});
