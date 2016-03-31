var DarkSkyAPIConfigurations = (function(){

	var icons = {
		"clear-day": "icons/clear-day.png",
		"clear-night": "icons/clear-night.png",
		"rain": "icons/rain.png",
		"snow": "icons/snow.png",
		"sleet": "icons/sleet.png",
		"fog": "icons/fog.png",
		"cloudy": "icons/cloudy.png",
		"partly-cloudy-day": "icons/partly-cloudy-day.png",
		"partly-cloudy-night": "icons/partly-cloudy-night.png",
	}

	var weatherDataUrlBase = "https://api.forecast.io/forecast/";
	var weatherDataAPIKey = "58c56faea4042bdbe6ce401e84302d7e";
	var weatherDataUrl = weatherDataUrlBase + weatherDataAPIKey + "/";

	return {
		icons: icons,
		weatherDataUrl: weatherDataUrl
	};

});
