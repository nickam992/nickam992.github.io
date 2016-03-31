/*
var s = document.createElement("script");
//s.src = "http://thesaurus.altervista.org/service.php?word=peace&language=en_US&output=json&key=test_only&callback=process"; // NOTE: replace test_only with your own KEY
s.src = "https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srwhat=text&srsearch=don%27t"
document.getElementsByTagName("head")[0].appendChild(s);
*/

/*
function process(result) {
    output = "";
    for (key in result.response) {
        list = result.response[key].list;
        output += list.synonyms + "<br>";
    }
    if (output)
        document.getElementById("synonyms").innerHTML = output;
}
*/

/*
$.ajax({
	dataType: "jsonp",
	url: "https://en.wiktionary.org/w/api.php?action=query&format=json&list=search&srwhat=text&srsearch=launch"
	//data: data,
	//success: success
})
*/



$.ajax({
	dataType: "jsonp",
	url: "https://en.wiktionary.org/w/api.php?action=parse&format=json"
})












//https://www.google.com/#q=define+love
