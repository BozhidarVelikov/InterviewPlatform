document.getElementById("results-card").style.display = "none";

function search(e) {
	var resultsNode = document.getElementById("results");
	while (resultsNode.lastChild) {
	    resultsNode.removeChild(resultsNode.lastChild);
	}

	document.getElementById("results-card").style.display = "none";
	
	var text = document.getElementById("name").value.trim();

	if(text != "") {
		document.getElementById("results-card").style.display = "block";

		text = text.split(" ");
		var details = {
			firstName: text[0],
			lastName: text[1]
		};
		if(text.length < 3) {
			sendRequest("POST", "/names", details)
			.then(res => {
				if(res.names) {
					names = res.names;
					for(var i in names) {
						var currentName = names[i].firstName + " " + names[i].lastName + " #" + names[i].tag;
						var div = document.createElement("li");
						div.className = "list-group-item pointer dropdown-item";
						div.id = currentName;
						div.innerHTML = currentName;
						// div.style.width = "100%";
						div.style.display = "block";
						div.setAttribute( "onclick", "select(\"" + currentName + "\");");
						document.getElementById("results").appendChild(div);
					}
				} else {
					document.getElementById("results-card").style.display = "none";
				}
			})
			.catch(err => {
				console.log(err);
			});
		}
	}
}

function select(name) {
	document.getElementById("results-card").style.display = "none";
	document.getElementById("name").value = name;
}

function createRoom() {
	var firstParticipant = localStorage.username;
	var secondParticipant = document.getElementById("name").value;
	var day = document.getElementById("day").value;
	var month = document.getElementById("month").value;
	var year = document.getElementById("year").value;
	var hour = document.getElementById("hour").value;
	var minutes = document.getElementById("minutes").value;
	var position = document.getElementById("position").value;
	switch(month) {
	  	case "Jan":
	  		month = 1;
	  		break;
	  	case "Feb":
	  		month = 2;
	  		break;
	  	case "Mar":
	  		month = 3;
	  		break;
	  	case "Apr":
	  		month = 4;
	  		break;
	  	case "May":
	  		month = 5;
	  		break;
	  	case "Jun":
	  		month = 6;
	  		break;
	  	case "Jul":
	  		month = 7;
	  		break;
	  	case "Aug":
	  		month = 8;
	  		break;
	  	case "Sep":
	  		month = 9;
	  		break;
	  	case "Oct":
	  		month = 10;
	  		break;
	  	case "Nov":
	  		month = 11;
	  		break;
	  	case "Dec":
	  		month = 12;
	  		break;
	}
	var details = {
		username: firstParticipant,
		companion: secondParticipant,
		date: year + "-" + month + "-" + day + " " + hour + ":" + minutes,
		position: position
	}
	sendRequest("POST", "/user/create-room", details)
	.then(res => {
		console.log(res.msg);
	})
	.catch(err => {
		console.log(err);
	});

}