if(localStorage.employer == 0) {
	document.getElementById("menu-reviews").style.display = "none";
}

function openAccount() {
	window.location.href = "account.html";
}

function logout() {
	localStorage.clear();
	window.location.href = "index.html";	
}