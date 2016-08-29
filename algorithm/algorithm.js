notSet = true;
$("#bet").click(bet);
$("#bet1000").click(bet1000);

function bet() {
	var startingMoney = parseInt($("#startingMoney").val())
	if (notSet === true) {
		$("#currentMoney").html(startingMoney)
		notSet = false;
	}
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