var chatHeader = localStorage.participant.split(" ");
document.getElementById("chat-header").innerHTML = chatHeader[0] + " " + chatHeader[1];

// Video and call
var video1 = document.getElementById('remote');
var video2 = document.getElementById('local');

var wsUri = "ws://localhost:8080";
var webSocket = null;

webSocket = new WebSocket(wsUri);
		
webSocket.onopen = function() {};
		
webSocket.onclose = function() {};
		
webSocket.onmessage = function(message) {
	var data = JSON.parse(message.data);

	switch (data.type) {
		case 'login':
			handleLogin(data.success);
			break;
		case 'offer':
			handleOffer(data.offer, data.username);
			break;
		case 'answer':
			handleAnswer(data.answer);
			break
		case 'candidate':
			handleCandidate(data.candidate);
			break
		case 'close':
			handleClose();
			break;
		case 'canvas':
			clickX = data.clickX;
			clickY = data.clickY;
			clickDrag = data.clickDrag;
			clickColor = data.clickColor;
			brushSize = data.brushSize;
			clickTool = data.clickTool;
			redraw();
			break;
		case 'editor':
			editor.setValue(data.code);
			editor.getSession().selection.clearSelection();
			break;
		case 'chat':
			var divWrapper = document.createElement("div");
			divWrapper.className = "div-wrapper-receive";

			var messageTextParagraph = document.createElement("p");
			messageTextParagraph.className = "message-paragraph";
			messageTextParagraph.innerHTML = data.chatMessage;
			console.log(data.chatMessage);

			var div = document.createElement("div");
			div.className = "message-receive my-grey-color";
			
			div.appendChild(messageTextParagraph);
			divWrapper.appendChild(div);
			document.getElementById("messages").appendChild(divWrapper);

			var messageBody = document.getElementById('messages');
			messageBody.scrollTop = messageBody.scrollHeight - messageBody.clientHeight;
			break;
	    default:
			break;
	}
 };
		
 webSocket.onerror = function() {};

let connection = null;
let name = null;
let otherUsername = null;

const sendMessage = message => {
	if (otherUsername) {
		message.otherUsername = otherUsername;
	}

	webSocket.send(JSON.stringify(message));
}

try {
	setTimeout(function() {
			sendMessage({
			type: 'login',
			username: localStorage.username
		});
	}, 2000);
} catch {
	alert("Please, press the reconnect button in a couple of seconds.");
}

document.querySelector('div#call').style.display = 'none';

const handleLogin = async success => {
	if (success === false) {
		alert('You are already logged in somewhere else');
		} else {
		document.querySelector('div#call').style.display = 'block';
	
		let localStream;
		try {
			localStream = await navigator.mediaDevices.getUserMedia({
				video: true,
				audio: true
			});
		} catch (error) {
			alert(`${error.name}`);
			console.error(error);
		};

		document.querySelector('video#local').srcObject = localStream;

		const configuration = {
			iceServers: [{ url: 'stun:stun2.1.google.com:19302' }]
		}

		connection = new RTCPeerConnection(configuration);

		connection.addStream(localStream);

		connection.onaddstream = event => {
			document.querySelector('video#remote').srcObject = event.stream;
		}

		connection.onicecandidate = event => {
			if (event.candidate) {
				sendMessage({
					type: 'candidate',
					candidate: event.candidate
				});
				}
		}
	}
}

document.querySelector('button#call').addEventListener('click', () => {
	otherUsername = localStorage.participant;
	if (otherUsername.length === 0) {
		alert('Enter a username 😉');
		return;
	}

	connection.createOffer(
		offer => {
			sendMessage({
				type: 'offer',
				offer: offer
			});

			connection.setLocalDescription(offer);
		},
	    	error => {
	      		alert('You are disconnected. Please, reconnect!');
	      		console.error(error);
	    	}
	  );
});

const handleOffer = (offer, username) => {
	otherUsername = username;
	connection.setRemoteDescription(new RTCSessionDescription(offer));
	connection.createAnswer(
		answer => {
			connection.setLocalDescription(answer)
			sendMessage({
				type: 'answer',
				answer: answer
			});
		},
		error => {
		      alert('Error when creating an answer');
		      console.error(error);
		}
	);
}

const handleAnswer = answer => {
		connection.setRemoteDescription(new RTCSessionDescription(answer));
}

const handleCandidate = candidate => {
		 connection.addIceCandidate(new RTCIceCandidate(candidate));
}

document.querySelector('button#close-call').addEventListener('click', () => {
	sendMessage({
		type: 'close'
	});
	handleClose();
});

const handleClose = () => {
	otherUsername = null;
	document.querySelector('video#remote').src = null;
	connection.close();
	connection.onicecandidate = null;
	connection.onaddstream = null;
}

document.querySelector('button#reconnect').addEventListener('click', () => {
	handleClose();
	sendMessage({
		type: 'reconnect',
		username: localStorage.username
	});
	sendMessage({
		type: 'login',
		username: localStorage.username
	});
});

// Canvas
var canvas = document.getElementById('canvas');
var canvasHolder = document.getElementById("canvas-holder");		
var context = canvas.getContext("2d");

if(!context)
	throw new Error("Cannot find canvas!");

var clickX = new Array();
var clickY = new Array();
var clickDrag = new Array();
var clickColor = new Array();
var brushSize = new Array();
var clickTool = new Array();

var currentColor = "#6c757d";
var currentBrushSize = 1;
var currentTool = "Marker";
var paint;

$('#canvas').mousedown(function(e){	
	var mouseX = e.pageX - this.offsetLeft;
	var mouseY = e.pageY - this.offsetTop;

	paint = true;

	addClick(mouseX, mouseY);
	redraw();
});

$('#canvas').mousemove(function(e){	
	if(paint){			
		var mouseX = e.pageX - this.offsetLeft;
		var mouseY = e.pageY - this.offsetTop;
		
		addClick(mouseX, mouseY, true);
		redraw();
	}
});

$('#canvas').mouseup(function(e){
	paint = false;
});

$('#canvas').mouseleave(function(e){
	paint = false;
});

function addClick(x, y, dragging) {  
	clickX.push(x);
	clickY.push(y);
	clickDrag.push(dragging);
	clickColor.push(currentColor);
	brushSize.push(currentBrushSize);
	clickTool.push(currentTool);

	sendMessage({
		type: 'canvas',
		clickX: clickX,
		clickY: clickY,
		clickDrag: clickDrag,
		clickColor: clickColor,
		brushSize: brushSize,
		clickTool: clickTool
	});
}

function redraw(){	
	context.clearRect(0, 0, context.canvas.width, context.canvas.height);

	context.lineJoin = "round";
	
	for(var i=0; i < clickX.length; i++) {		
		context.beginPath();
		if(clickDrag[i] && i){				
			context.moveTo(clickX[i-1], clickY[i-1]);
		}else{				
			context.moveTo(clickX[i]-1, clickY[i]);
		}
		context.lineTo(clickX[i], clickY[i]);
		context.closePath();
		context.lineWidth = brushSize[i];
		if(clickTool[i] == "Eraser") {		
			context.strokeStyle = "#ffffff";
		} else  if(clickTool[i] == "Marker") {		
			context.strokeStyle = clickColor[i];
		}
		context.stroke();
	}
}

function clearCanvas() {	
	context.clearRect(0, 0, context.canvas.width, context.canvas.height);

	clickX = new Array();
	clickY = new Array();
	clickDrag = new Array();
	clickColor = new Array();
	brushSize = new Array();
	clickTool = new Array();

	sendMessage({
		type: 'canvas',
		clickX: clickX,
		clickY: clickY,
		clickDrag: clickDrag,
		clickColor: clickColor,
		brushSize: brushSize,
		clickTool: clickTool
	});
}

function changeColor(e) {		
	colorButton = document.getElementById('colorPicker');
	
	if(e == 1) {			
		setColor("btn-secondary");		
		currentColor = "#6c757d";
	}
	else if(e == 2) {			
		setColor("btn-primary");			
		currentColor = "#007bff";
	} else if(e == 3) {			
		setColor("btn-success");			
		currentColor = "#28a745";
	} else if(e == 4) {			
		setColor("btn-danger");				
		currentColor = "#dc3545";
	} else if(e == 5) {			
		setColor("btn-warning");				
		currentColor = "#ffc107";
	}
}

function setColor(e) {		
	var colors = ["btn-primary", "btn-secondary", "btn-success", "btn-danger", "btn-warning"];
	colorButton = document.getElementById('colorPicker');
	
	currentTool = "Marker";
	document.getElementById("toolPicker").innerHTML = "\nMarker\n";
	
	for(var i = 0; i < 5; i++) {				
		if(colors[i] == e) {					
			colorButton.classList.add(colors[i]);
		} else {				
			colorButton.classList.remove(colors[i]);
		}
	}
}

function changeSize(e) {		
	if(e == 1) {
		setSize(1);
	} else if(e == 2) {
		setSize(3);
	} else if(e == 3) {
		setSize(5);
	} else if(e == 4) {
		setSize(7);
	} else if(e == 5) {
		setSize(10);
	}
}

function setSize(e) {		
	currentBrushSize = e;
	document.getElementById("brushPicker").innerHTML = "\n" + e + " px\n";
}

function changeTool(e) {		
	if(e == 1) {			
		setTool("Marker");		
	} else if(e == 2) {			
		setTool("Eraser");
	}
}

function setTool(e) {			
	currentTool = e;
	document.getElementById("toolPicker").innerHTML = "\n" + e + "\n";
}

// Code editor
var editor = ace.edit("editor");
editor.setTheme("ace/theme/twilight");
editor.setFontSize("18px");
editor.session.setMode("ace/mode/java");

editor.container.addEventListener("keyup", sendEditor, true);

function sendEditor() {
	if(connection != null) {
		sendMessage({
			type: 'editor',
			code: editor.getValue()
		});
	}
}

function sendChatMessage(e) {
	e.preventDefault();
	var messageToSend = document.getElementById("userMessage").value;
	document.getElementById("userMessage").value = "";
	if(messageToSend != "" && connection != null) {
		sendMessage({
			type: 'chat',
			chatMessage: messageToSend
		});

		var divWrapper = document.createElement("div");
		divWrapper.className = "div-wrapper-send";

		var messageTextParagraph = document.createElement("p");
		messageTextParagraph.className = "message-paragraph";
		messageTextParagraph.innerHTML = messageToSend;

		var div = document.createElement("div");
		div.className = "message-send bg-primary text-light";

		div.appendChild(messageTextParagraph);
		divWrapper.appendChild(div);
		document.getElementById("messages").appendChild(divWrapper);

		var messageBody = document.getElementById('messages');
		messageBody.scrollTop = messageBody.scrollHeight - messageBody.clientHeight;
	}
}