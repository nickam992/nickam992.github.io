
$("#bet").click(bet);

function bet() {
	var rand = Math.random();
	var startingMoney = parseInt($("#startingMoney").html())
	var highestMoney = parseInt($("#highestMoney").html());
	var numWagers = parseInt($("#numWagers").html());
	var currentMoney = parseInt($("#currentMoney").html());
	var currentWager = parseInt($("#currentWager").html());

	if (rand >.5) {
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
}