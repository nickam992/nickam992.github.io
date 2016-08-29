
$("#bet").click(bet);
$("#bet1000").click(bet1000);

function bet() {
	var rand = Math.random();
	var startingMoney = parseInt($("#startingMoney").html())
	var numWagers = parseInt($("#numWagers").html());
	var currentMoney = parseInt($("#currentMoney").html());
	var currentWager = parseInt($("#currentWager").html());

	if (rand >.5) {
		var newMoney = currentMoney + currentWager;
		$("#currentMoney").html(currentMoney + currentWager);
		$("#currentWager").html(1);
		$("#previousWager").html("Won");
	}
	else {
		$("#currentMoney").html(currentMoney - currentWager);
		$("#currentWager").html(currentWager * 2);
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
	for (var i=0; i<1000; i++) {
		bet();
		if(parseInt($("#currentMoney").html()) <= 0){
			break;
		}
	}
}