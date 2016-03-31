

//http://api.wordnik.com/v4/word.json/dog/definitions?limit=200&includeRelated=true&sourceDictionaries=all&useCanonical=false&includeTags=false&api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5




$.ajax({
	dataType: "jsonp",
	url: "http://api.wordnik.com/v4/word.json/dog/definitions?limit=200&includeRelated=true&sourceDictionaries=all&useCanonical=false&includeTags=false&api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5",
	success: processDefinitionJSON
})

function processDefinitionJSON(data){
	console.log(data)
}
