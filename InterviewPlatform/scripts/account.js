document.getElementById("inputFirstName").value = localStorage.firstName;
document.getElementById("inputLastName").value = localStorage.lastName;

document.getElementById("nameCell").innerHTML = localStorage.username;
document.getElementById("emailCell").innerHTML = localStorage.email;

document.getElementById("input-username").value = localStorage.username;
document.getElementById("input-username").style.display = "none";

function test() {
	console.log("AAAAA");
	// location.reload();
	
	setTimeout(window.location.href = "home.html", 5000);
}

var details = {
	username: localStorage.username
};

sendRequest("POST", "/avatar", details)
		.then(res => {
			console.log(res.msg);
			document.getElementById("avatar").src = res.msg;			
		})
		.catch(err => {
			console.log(err);
		});

function change(id) {
	if(id == 1) {
		var firstName = document.getElementById("inputFirstName").value;
		var lastName = document.getElementById("inputLastName").value;

		if(firstName == "") {
			if(document.getElementById("name-error") == null) {
				var div = document.createElement("div");
				div.className = "alert alert-danger";
				div.id = "name-error";
				div.innerHTML = "All fields are mandatory!";
				div.style.width = "100%";
				div.style.display = "block";

				document.getElementById("name-errors").appendChild(div);
				return;
			} 
		} else {
			var div = document.getElementById("name-error");
			if(div != null) {
				div.remove();
			}
		}						

		if(lastName == "") {
			if(document.getElementById("name-error") == null) {
				var div = document.createElement("div");
				div.className = "alert alert-danger";
				div.id = "name-error";
				div.innerHTML = "All fields are mandatory!";
				div.style.width = "100%";
				div.style.display = "block";

				document.getElementById("name-errors").appendChild(div);
				return;
			} 
		} else {
			var div = document.getElementById("name-error");
			if(div != null) {
				div.remove();
			}
		}

		details = {
			id: id,
			email: localStorage.email,
			firstName: firstName,
			lastName: lastName
		}

		sendRequest("POST", "/user/update", details)
		.then(res => {
			if(res.msg && res.msg != "Done!") {
				var div = document.createElement("div");
				div.className = "alert alert-danger";
				div.id = "name-error";
				div.innerHTML = res.msg;
				div.style.width = "100%";
				div.style.display = "block";

				document.getElementById("name-errors").appendChild(div);
				return;
			} else {
				var div = document.getElementById("name-error");
				if(div != null) {
					div.remove();
				}

				localStorage.firstName = firstName;
				localStorage.lastName = lastName;
				localStorage.tag = res.tag;
				localStorage.username = firstName + " " + lastName + " #" + localStorage.tag;
				location.reload();
			}
		})
		.catch(err => {
			console.log(err);
		});
	} else if(id == 2) {
		var newEmail = document.getElementById("inputEmail").value;

		if(newEmail == "") {
			if(document.getElementById("email-error") == null) {
				var div = document.createElement("div");
				div.className = "alert alert-danger";
				div.id = "email-error";
				div.innerHTML = "All fields are mandatory!";
				div.style.width = "100%";
				div.style.display = "block";

				document.getElementById("email-errors").appendChild(div);
				return;
			} 
		} else {
			var div = document.getElementById("email-error");
			if(div != null) {
				div.remove();
			}
		}

		details = {
			id: id,
			email: localStorage.email,
			newEmail: newEmail
		}

		sendRequest("POST", "/user/update", details)
		.then(res => {
			if(res.msg && res.msg != "Done!") {
				var div = document.createElement("div");
				div.className = "alert alert-danger";
				div.id = "email-error";
				div.innerHTML = res.msg;
				div.style.width = "100%";
				div.style.display = "block";

				document.getElementById("email-errors").appendChild(div);
				return;
			} else {
				var div = document.getElementById("email-error");
				if(div != null) {
					div.remove();
				}

				localStorage.email = newEmail;
				location.reload();
			}
		})
		.catch(err => {
			console.log(err);
		});
	} else if(id == 3) {
		var password = document.getElementById("inputPassword").value;

		if(newEmail == "") {
			if(document.getElementById("password-error") == null) {
				var div = document.createElement("div");
				div.className = "alert alert-danger";
				div.id = "password-error";
				div.innerHTML = "All fields are mandatory!";
				div.style.width = "100%";
				div.style.display = "block";

				document.getElementById("password-errors").appendChild(div);
				return;
			} 
		} else {
			var div = document.getElementById("password-error");
			if(div != null) {
				div.remove();
			}
		}

		details = {
			id: id,
			email: localStorage.email,
			password: password
		}

		sendRequest("POST", "/user/update", details)
		.then(res => {
			if(res.msg && res.msg != "Done!") {
				var div = document.createElement("div");
				div.className = "alert alert-danger";
				div.id = "password-error";
				div.innerHTML = res.msg;
				div.style.width = "100%";
				div.style.display = "block";

				document.getElementById("password-errors").appendChild(div);
				return;
			} else {
				var div = document.getElementById("password-error");
				if(div != null) {
					div.remove();
				}

				localStorage.password = newEmail;
				location.reload();
			}
		})
		.catch(err => {
			console.log(err);
		});
	}
}
