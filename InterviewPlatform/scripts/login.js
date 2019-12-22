var loginBtn = document.getElementById("login-btn");

loginBtn.addEventListener("click", () => {

	div = document.getElementById("error-error");
	if(div != null) {
		div.remove();
	}

	var emailValue = document.getElementById("inputEmail").value;
	var passwordValue = document.getElementById("inputPassword").value;

	if(emailValue == "") {
		var div = document.getElementById("email-error");
		if(div == null) {
			var div = document.createElement("div");
			div.className = "alert alert-danger";
			div.id = "email-error";
			div.innerHTML = "Please, enter an email!";
			div.style.width = "100%";
			div.style.display = "block";

			document.getElementById("errors").appendChild(div);
		}

		return;
	} else {
		div = document.getElementById("email-error");
		if(div != null){
			div.style.display = "none";
		}
	}

	if(passwordValue == "") {
		var div = document.getElementById("password-error");
		if(div == null) {
			div = document.createElement("div");
			div.className = "alert alert-danger";
			div.id = "password-error";
			div.innerHTML = "Please, enter your password";
			div.style.width = "100%";
			div.style.display = "block";

			document.getElementById("errors").appendChild(div);
		}

		return;
	} else {
		div = document.getElementById("password-error");
		if(div != null){
			div.style.display = "none";
		}
	}

	let details = {
    	email:emailValue,
    	password:passwordValue
	}

	sendRequest("POST", "/auth/login", details)
	.then(res => {
			localStorage.setItem("token", res.token);

			// details = {};

			// console.log(res);
			// debugger;

			sendRequest("POST", "/user/details", details)
			.then(res => {
				console.log(res);
				localStorage.firstName = res.firstName;
				localStorage.lastName = res.lastName;
				localStorage.tag = res.tag;
				localStorage.username = res.username;
				localStorage.employer = res.employer;
				localStorage.email = res.email;
				window.location.href = "home.html";
			})
			.catch(err => {
				console.log(err);
			})

	})
	.catch(err => {
		console.log(err);
		let res = JSON.parse(err);
		
		var div = document.createElement("div");
			div.className = "alert alert-danger";
			div.id = "error-error";
			div.innerHTML = res.msg;
			div.style.width = "100%";
			div.style.display = "block";

			document.getElementById("errors").appendChild(div);
	});

});