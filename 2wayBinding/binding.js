
window.setTimeout(function() {
	var name = document.getElementById("name");
	var title = document.getElementById("title");
	bindText(name, title);

	var messageInput = document.getElementById("message");
	var messageH1 = document.getElementById("h1Message");
	bindText(messageInput, messageH1);
}, 100);

function bindText(elem, target) {
	elem.addEventListener("input", function() {
		target.text = elem.value;
	});
}