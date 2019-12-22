canvas = document.getElementById('canvas');
context = canvas.getContext("2d");

if(!context)
	throw new Error("Cannot find canvas!");

localStorage.setItem("color", "#6c757d");
localStorage.setItem("brushSize", 1);
localStorage.setItem("paintTool", "Marker");
localStorage.setItem("canvas", context);

var clickX = new Array();
var clickY = new Array();
var clickDrag = new Array();
var clickColor = new Array();
var brushSize = new Array();
var clickTool = new Array();

var currentColor = localStorage.getItem("color");
var currentBrushSize = localStorage.getItem("brushSize");

var paint;

$('#canvas').mousedown(function(e){
	
  var mouseX = e.pageX - this.offsetLeft;
  var mouseY = e.pageY - this.offsetTop;
  
  paint = true;
  currentColor = localStorage.getItem("color");
  currentBrushSize = localStorage.getItem("brushSize");
  currentTool = localStorage.getItem("paintTool");

  addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
  redraw();
});

$('#canvas').mousemove(function(e){
	
  if(paint){
    addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
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
}

function redraw(){
	
  context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas
  
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
}