var submitBtn = document.getElementById("submit-btn");

submitBtn.addEventListener("click", () => {

	div = document.getElementById("error-error");
	if(div != null) {
		div.remove();
	}

	var firstNameValue = document.getElementById("inputFirstName").value;
	var lastNameValue = document.getElementById("inputLastName").value;
	var emailValue = document.getElementById("inputEmail").value;
	var passwordValue = document.getElementById("inputPassword").value;
	var employerCheckBoxValue = document.getElementById("employerCheck").checked;
	var checkBoxValue = document.getElementById("termsCheck").checked;

	if(firstNameValue == "") {		
		var div = document.getElementById("fisrt-name-error");
		if(div == null) {
			var div = document.createElement("div");
			div.className = "alert alert-danger";
			div.id = "fisrt-name-error";
			div.innerHTML = "First name is a mandatory field!";
			div.style.width = "100%";
			div.style.display = "block";

			document.getElementById("errors").appendChild(div);
		}

		return;
	} else {
		div = document.getElementById("fisrt-name-error");
		if(div != null){
			div.remove();
		}
	}

	if(lastNameValue == "") {
		var div = document.createElement("div");
		div.className = "alert alert-danger";
		div.id = "last-name-error";
		div.innerHTML = "Last name is a mandatory field!";
		div.style.width = "100%";
		div.style.display = "block";

		document.getElementById("errors").appendChild(div);

		return;
	} else {
		div = document.getElementById("last-name-error");
		if(div != null){
			div.remove();
		}
	}

	if(emailValue == "") {
		var div = document.createElement("div");
		div.className = "alert alert-danger";
		div.id = "email-error";
		div.innerHTML = "Email is a mandatory field!";
		div.style.width = "100%";
		div.style.display = "block";

		document.getElementById("errors").appendChild(div);

		return;
	} else {
		div = document.getElementById("email-error");
		if(div != null){
			div.remove();
		}
	}

	if(passwordValue == "") {
		var div = document.createElement("div");
		div.className = "alert alert-danger";
		div.id = "password-error";
		div.innerHTML = "Password is a mandatory field!";
		div.style.width = "100%";
		div.style.display = "block";

		document.getElementById("errors").appendChild(div);

		return;
	} else {
		div = document.getElementById("password-error");
		if(div != null){
			div.remove();
		}
	}

	if(!checkBoxValue) {
		var div = document.createElement("div");
		div.className = "alert alert-danger";
		div.id = "password-error";
		div.innerHTML = "You must agree to the terms of use before signing up!";
		div.style.width = "100%";
		div.style.display = "block";

		document.getElementById("errors").appendChild(div);

		return;

	} else {
		div = document.getElementById("checkbox-error");
		if(div != null){
			div.remove();
		}
	}

	var employer = 0;
	if(employerCheckBoxValue) {
		employer = 1;
	}
	
	let details = {
    	firstName:firstNameValue,
    	lastName:lastNameValue,
    	email:emailValue,
    	password:passwordValue,
    	employer:employer
	}

	sendRequest("POST", "/user/register", details)
	.then(res => {
		if(res.msg == "You have been successfully registered!") {
			window.location.href = "login.html";
		} else {
			var div = document.createElement("div");
			div.className = "alert alert-danger";
			div.id = "error-error";
			div.innerHTML = res.msg;
			div.style.width = "100%";
			div.style.display = "block";

			document.getElementById("errors").appendChild(div);
		}		
	})
	.catch(err => {
		console.log(err);
	});
});