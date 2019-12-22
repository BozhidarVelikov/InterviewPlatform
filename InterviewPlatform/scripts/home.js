let details = {
	name:localStorage.username,
	firstName:localStorage.firstName,
	lastName:localStorage.lastName,
	tag:localStorage.tag,
	employer: localStorage.employer
}

sendRequest("POST", "/user/interviews", details).then(responseOne => {

	if(responseOne.interviews) {
		var positions = new Array();
		var positionNames = new Array();
		var rooms = new Array();
		var position = 0;
		var counter = 1;
		for(var i in responseOne.interviews) {
			if(positionNames.includes(responseOne.interviews[i].position)) {
				var room = {
					id: counter,
					name: responseOne.interviews[i].name,
					date: responseOne.interviews[i].date
				}
				counter++;
				rooms.push(room);
			} else {
				positionNames.push(responseOne.interviews[i].position);
				if(position != 0) {
					positions.push(position);
				}
				counter = 1;
				rooms = new Array();
				var room = {
					id: counter,
					name: responseOne.interviews[i].name,
					date: responseOne.interviews[i].date
				}
				counter++;
				rooms.push(room);
				position = {
					name: responseOne.interviews[i].position,
					rooms: rooms
				}
			}
			if(i == responseOne.interviews.length - 1){
				positions.push(position);
			}
		}
		var context = {
			positions: positions
		};
	} else {
		var context = {
			positions: []
		};
	}

	var interviewsDiv = document.getElementById("interviews");
	
	var source = document.getElementById("interviews-template").innerHTML;
	var template = Handlebars.compile(source);
	var html = template(context);

	interviewsDiv.innerHTML = html;
		
	if(localStorage.employer == 1) {
		// Send second request for reviews
		sendRequest("POST", "/user/reviews", details).then(responseTwo => {
			if(responseTwo.reviews) {
				var positions = new Array();
				var positionNames = new Array();
				var candidates = new Array();
				var position = 0;
				var counter = 1;
				for(var i in responseTwo.reviews) {
					if(positionNames.includes(responseTwo.reviews[i].position)) {
						var candidate = {
							id: counter,
							name: responseTwo.reviews[i].name,
							review: responseTwo.reviews[i].review
						}
						counter++;
						candidates.push(candidate);
					} else {
						positionNames.push(responseTwo.reviews[i].position);
						if(position != 0) {
							positions.push(position);
						}
						counter = 1;
						candidates = new Array();
						var candidate = {
							id: counter,
							name: responseTwo.reviews[i].name,
							review: responseTwo.reviews[i].review
						}
						counter++;
						candidates.push(candidate);
						position = {
							name: responseTwo.reviews[i].position,
							candidates: candidates
						}
					}
					if(i == responseTwo.reviews.length - 1){
						positions.push(position);
					}
				}

				var context = {
					positions: positions
				};						
				
			} else {
				var context = {
					positions: []
				};
			}

			var reviewsDiv = document.getElementById("reviews");
		
			var source = document.getElementById("reviews-template").innerHTML;
			var template = Handlebars.compile(source);
			var html = template(context);

			reviewsDiv.innerHTML = html;
		})
		.catch(errorTwo => {
			console.log(errorTwo);
		});
	} else {
		document.getElementById("reviewsCard").style.display = "none";
	}
})
.catch(errorOne => {
	console.log(errorOne);
});

function deleteInterview(name, date) {
	details = {
		employer:localStorage.username,
		candidate:name,
		date:date
	}
	sendRequest("POST", "/user/delete-interview", details).then(response =>{
		if(response.msg == "Done!") {
			location.reload();
		} else {
			alert("Something happened. Please, try again later.");
		}
	})
	.catch(error => {
		console.log(error);
	});
}

function enterRoom(name) {
	localStorage.participant = name;
	window.location.href = "interview.html";
}