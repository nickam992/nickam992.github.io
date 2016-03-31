
$("#getDefinition").click(getDefinition)


function getDefinition(){
	var termToDefine = $("#word").val();

	$.ajax({
		dataType: "json",
		url: "https://en.wiktionary.org/api/rest_v1/page/definition/" + termToDefine,
		success: processWiktionaryJSON,
		error: throwGetDefinitionError
	})
}

function processWiktionaryJSON(data){
	try{
		console.log(data);
		englishData = data.en;

		for(var i=0; i<englishData.length; i++){
			console.log(englishData[i].partOfSpeech + ":  ");
			console.log(englishData[i].definitions[0].definition);

			$("#definition").append(englishData[i].partOfSpeech + ":  ");
			$("#definition").append(englishData[i].definitions[0].definition);
			$("#definition").append("<br><br>");
		}
	}

	catch(e){
		console.log("definition data could not be displayed");
	}
}

function throwGetDefinitionError(){
	alert("Could not get a definition");
}
