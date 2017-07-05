
var counter = 100;
setInitialConditions();
setInterval(mainLoop, 50);

function setInitialConditions() {
	$("#graviton").css("left", counter);
	$("#graviton").css("visibility", "visible");
}

function mainLoop(){
	counter++;
	$("#graviton").css("left", counter);
}


function getSatelitePosition(){
  h = counter;

  //(x – h)2 + (y – k)2 = r2
}




$("#graviton").style