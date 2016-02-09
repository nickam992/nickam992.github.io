$(function() {

	$("#font-size-slider").change(function(e) {
		$("tr:first-child td").css("font-size", $(this).val() + "px");	
	});
	
	$(".color-slider").change(function(e) {
		$("tr:first-child td").css("color", "hsla(" + $("#color-slider-1").val() + ", " + $("#color-slider-2").val() + "%, " + $("#color-slider-3").val() + "%, 1)");	
	});

	$(".background-color-slider").change(function(e) {
		$("tr:first-child td").css("background-color", "hsla(" + $("#background-color-slider-1").val() + ", " + $("#background-color-slider-2").val() + "%, " + $("#background-color-slider-3").val() + "%, 1)");	
	});
	
	$(".shadow-slider").change(function(e) {	
		$("tr:first-child td").css("text-shadow", $("#shadow-slider-1").val() + "px " + $("#shadow-slider-2").val() + "px " + $("#shadow-slider-3").val() + "px black");	 
	});

});