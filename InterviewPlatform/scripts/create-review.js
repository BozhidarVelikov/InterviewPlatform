if(localStorage.employer == 0) {
	window.location.href = "home.html";
}

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

function createReview() {
	var firstParticipant = localStorage.username;
	var secondParticipant = document.getElementById("name").value;
	var position = document.getElementById("position").value;
	var review = document.getElementById("review").value;

	var details = {
		username: firstParticipant,
		companion: secondParticipant,
		position: position,
		review: review
	}

	sendRequest("POST", "/user/create-review", details)
	.then(res => {
		console.log(res.msg);
	})
	.catch(err => {
		console.log(err);
	});
}