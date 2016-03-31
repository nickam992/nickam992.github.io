/*
without going to the trouble of using RequireJS, Angular, or
another module loader, I'm using a closure to store the config
options in this app in config.js.  Having all the API configurations
in one place will make the app more maintainable
*/
var config = DarkSkyAPIConfigurations();

if (navigator.geolocation)
{
    navigator.geolocation.getCurrentPosition(geolocationSuccessFunction, geolocationErrorFunction);
}
else
{
    alert("Gelocation is not available");
}

function geolocationSuccessFunction(position)
{
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;

    getWeatherData(latitude, longitude);
}

function geolocationErrorFunction(position)
{
    alert("Gelocation is not available");
}

function getWeatherData(latitude, longitude){
    $.ajax({
        url: config.weatherDataUrl + latitude + "," + longitude,
        dataType: 'jsonp'
    }).done(function(data) {
        displayWeatherData(data);
    }).fail(function(){
        alert("Could not get weather data");
    })
}


function displayWeatherData(data){
    console.log(data)
    var days = $(".day");

    try{
        for(var i=0; i<5; i++){
            var maxTemp = data.daily.data[i].temperatureMax;
            var minTemp = data.daily.data[i].temperatureMin;

            var icon = data.daily.data[i].icon;
            var iconPath = config.icons[icon];

            $(days[i]).append("<div class='high'>" + Math.round(maxTemp) + "</div>");
            $(days[i]).append("<div><img src= '" + iconPath + "'></img></div>");
            $(days[i]).append("<div class='low'>" + Math.round(minTemp) + "</div>");
        }
    }
    catch(e){
        alert("Weather data could not be displayed");
    }
}
