resize()

function resize() {
	document.getElementById("blackColor").style.height = document.body.clientHeight + "px";
}

$(window).resize(function() {
	resize();
});