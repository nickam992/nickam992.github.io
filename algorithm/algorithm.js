$("#bet").click(bet);
$("#bet1000").click(bet1000);

function bet() {
	var startingMoney = parseInt($("#startingMoney").val());
	$("#startingMoney").attr("disabled", "disabled");
	var rand = Math.random();
	var numWagers = parseInt($("#numWagers").html());
	var currentMoney = parseInt($("#currentMoney").html());

	var currentWager = parseInt($("#currentWager").html());
	var multiplyBy = parseInt($("#multiplyBy").val());


	if (rand >.5) {
		var newMoney = currentMoney + currentWager;
		$("#currentMoney").html(currentMoney + currentWager);
		$("#currentWager").html(1);
		$("#previousWager").html("Won");
	}
	else {
		$("#currentMoney").html(currentMoney - currentWager);
		$("#currentWager").html(currentWager * multiplyBy);
		$("#previousWager").html("Lost");
	}
	$("#numWagers").html(numWagers+1);
	if(parseInt($("#currentMoney").html()) <= 0){
		$("#previousWager").html("BANKRUPT");
		$("#bet").attr("disabled", "disabled");
		$("#bet1000").attr("disabled", "disabled");
	}
}

function bet1000() {
	$("#startingMoney").attr("disabled", "disabled");
	var numBets = parseInt($("#numBets").val());

	for (var i=0; i<numBets; i++) {
		bet();
		if(parseInt($("#currentMoney").html()) <= 0){
			break;
		}
	}
}


window.setTimeout(function() {
	var startingMoney = document.getElementById("startingMoney");
	var currentMoney = document.getElementById("currentMoney");
	bindText(startingMoney, currentMoney);
}, 100);

function bindText(elem, target) {
	elem.addEventListener("input", function() {
		target.innerHTML = elem.value;
	});
}