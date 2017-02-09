if (document.location.hostname == "localhost" || document.location.hostname == "svn.inkling.com"){
	s9.initialParams = {
		"image1": "img/slideline_placeholder_images_1.jpg",
        "caption1": "This is the first caption. This is optional.",
        "label1": "Label 1. This is optional.",
        "image2": "img/slideline_placeholder_images_2.jpg",
        "caption2": "This is the second caption. This is optional.",
        "label2": "Label 2. This is optional.",
        "image3": "img/slideline_placeholder_images_3.jpg",
        "caption3": "This is the third caption. This is optional.",
        "label3": "Label 3. This is optional.",
        "image4": "img/slideline_placeholder_images_4.jpg",
        "caption4": "This is the fourth caption. This is optional.",
        "label4": "Label 4. This is optional.",
        "image5": "img/slideline_placeholder_images_5.jpg",
        "caption5": "This is the fifth caption. This is optional.",
        "label5": "Label 5. This is optional.",
        "image6": "img/slideline_placeholder_images_6.jpg",
        "caption6": "This is the sixth caption. This is optional.",
        "label6": "Label 6. This is optional.",
	}
};


$(document).ready(function(){

	// variables for values
	var val;
	var wholeVal;
	var decVal;

	var last = 0;
	var lastStop = 0;

	// varables for each element
	var prevImage;
	var currentImage;
	var nextImage;
	var prevLabel;
	var currentLabel;
	var nextLabel;
	var prevCaption;
	var currentCaption;
	var nextCaption;

	// variables for catching and storing values during slide
	var oldVal;
	var currentVal;
	var newVal;

	var dataSource  = s9.initialParams['dataSource'];

	function clearGhosts(start, end) {
        $('.image').each(function() {
        	if (this.getAttribute('id') == 'image' + start || this.getAttribute('id') == 'image' + end) {
        		return;
        	}
        	$(this).css({opacity: 0});
        });
    }

    //This function initializes the jQuery slider and shows the first slide
	function buildSlider(){
		$('#slide_images #image1').css("opacity", 1);
		$('#slide_labels #label1').css("opacity", 1);
		$('#slide_captions #caption1').css("opacity", 1);

		currentImage = document.getElementById('image1');
		currentLabel = document.getElementById('label1');
		currentCaption = document.getElementById('caption1');

		$("#slider").slider({
			animate: true,
			value: 1,
			min: 1,
			max: $('#slide_images .image').size(),
			step: .01,
			slide: function (event, ui) {
				$('.ui-slider-handle').removeClass('pulsing');
				sliderPos = (ui.value); //ex: 1.25
				wholeSliderPos = Math.floor(sliderPos); //ex: 1
				decVal = sliderPos - wholeSliderPos; // ex: 1.25 - 1 (=.25)
				//console.log('sliding: ' + decVal);
				var rangeStart = Math.floor(sliderPos);
                var rangeEnd = Math.ceil(sliderPos);

                if (lastStop > 0 && lastStop != rangeStart && lastStop != rangeEnd){
                    var old = $('#image' + lastStop);
                    old.css('opacity', 0);
                }

				prevImage = document.getElementById('image' + (wholeSliderPos - 1));
				currentImage = document.getElementById('image' + wholeSliderPos);
				nextImage = document.getElementById('image' + (wholeSliderPos + 1));

				prevLabel = document.getElementById('label' + (wholeSliderPos - 1));
				currentLabel = document.getElementById('label' + wholeSliderPos);
				nextLabel = document.getElementById('label' + (wholeSliderPos + 1));

				prevCaption = document.getElementById('caption' + (wholeSliderPos - 1));
				currentCaption = document.getElementById('caption' + wholeSliderPos);
				nextCaption = document.getElementById('caption' + (wholeSliderPos + 1));


		        if (ui.value > last) {
		        	$(currentImage).css("opacity", 1 - decVal);
		        	$(nextImage).css("opacity", decVal);
		        }

		        if (ui.value < last) {
		        	$(currentImage).css("opacity", 1 - decVal);
		        	$(nextImage).css("opacity", decVal);
		        }

		        if (Math.floor(last) != wholeSliderPos) {
                    clearGhosts(rangeStart, rangeEnd);
                }
		        last = ui.value;
			},
			stop: function( event, ui ) {
				$('.ui-slider-handle').removeClass('pulsing');
				var wholeVal = Math.round(ui.value);
				$( "#slider" ).slider( "value", wholeVal );
				// console.log('stop: ' + wholeVal);
				prevImage = document.getElementById('image' + (wholeVal - 1));
				currentImage = document.getElementById('image' + wholeVal);
				nextImage = document.getElementById('image' + (wholeVal + 1));

				prevLabel = document.getElementById('label' + (wholeVal - 1));
				currentLabel = document.getElementById('label' + wholeVal);
				nextLabel = document.getElementById('label' + (wholeVal + 1));

				prevCaption = document.getElementById('caption' + (wholeVal - 1));
				currentCaption = document.getElementById('caption' + wholeVal);
				nextCaption = document.getElementById('caption' + (wholeVal + 1));

				$('.image').css("opacity", 0);
				$('.label').css("opacity", 0);
				$('.caption').css("opacity", 0);

				$(currentImage).css("opacity", 1);
				$(currentLabel).css("opacity", 1);
				$(currentCaption).css("opacity", 1);

				last = wholeVal;
				lastStop = wholeVal;
		    }

		});
	}

	//This function draws the tick marks/pips for the slider. It must be called after the slider's max is set.
    function setSliderTicks(){
	    var $slider =  $('#slider');
	    var max =  $slider.slider("option", "max");    
	    if (max > 1) {
	    	var spacing =  100 / (max -1);
	    } else {
	    	var spacing = 50;
	    }

	    $slider.find('.ui-slider-tick-mark').remove();
	    for (var i = 0; i < max ; i++) {
	        $('<span class="ui-slider-tick-mark"></span>').css('left', (spacing * i) +  '%').appendTo($slider); 
	     }
	}
	 

	// Extract the text from the template .html() is the jquery helper method for that
	var image_template = $('#image-temp').html();
	var label_template = $('#label-temp').html();
	var caption_template = $('#caption-temp').html();
	// Compile that into an handlebars template
	var imageTemplate = Handlebars.compile(image_template);
	var labelTemplate = Handlebars.compile(label_template);
	var captionTemplate = Handlebars.compile(caption_template);
	// Retrieve the placeHolder where the Posts will be displayed 
	var imageHolder = $("#slide_images");
	var labelHolder = $("#slide_labels");
	var captionHolder = $("#slide_captions");

	var imgArr = []
	var slideNum = 0;
	for(var key in s9.initialParams) {
		if (key.slice(0, 5) == 'image'){
			slideNum++;
			imgArr.push(s9.initialParams[key]);
		}
	}

  	var slideInfo = {
		'slideData': []
	};

	for(var i=0; i<slideNum; i++){
		var temp = i+1;
		// console.log("loading slide " + temp);
		if (!s9.initialParams['image'+(i+1)]) {
			continue;
		}
		slideInfo['slideData'].push({
			image : s9.initialParams['image'+(i+1)], 
			caption : s9.initialParams['caption'+(i+1)], 
			label : s9.initialParams['label'+(i+1)], 
			index : temp
		});
	};

	if (slideInfo.slideData.length == 0){
		//Show default - placeholder images.
		slideInfo.slideData = [{
			image: 'img/placeholder-image1.svg',
			caption: 'Caption 1',
			label: 'Label 1',
			index: 1,
		},
		{	image: 'img/placeholder-image2.svg',
			caption: 'Caption 2',
			label: 'Label 2',
			index: 2,
		},
		{
			image: 'img/placeholder-image3.svg',
			caption: 'Caption 3',
			label: 'Label 3',
			index: 3,
		}];

	}

	//Add each of the slide images, labels, and captions to the DOM
	$.each(slideInfo.slideData,function(index,element){
      // Generate the HTML for each post
      var imagehtml = imageTemplate(element);
      var labelhtml = labelTemplate(element);
      var captionhtml = captionTemplate(element);
      // Render the posts into the page
      imageHolder.append(imagehtml);
      	if (element.label){
      	 	labelHolder.append(labelhtml);
      	}
    	if (element.caption) {
    		captionHolder.append(captionhtml);
    	}
  	});

	//Size the image div to the tallest slide image
	function imageSizing() {
		$('#slide_images').css({height: 0});
		var numImages = $('.image img').length;
		var numDone = 0;
		$('.image img').each(function() {
			$(this).load(function () {
				var w = $('#slide_images').outerWidth();
		        var ratio = w / this.naturalWidth; 
		        var curHeight = $('#slide_images').height() || 0;
		        var displayH = this.naturalHeight * ratio;
		        if (displayH > curHeight){
		            $('#slide_images').css({height: displayH});
		        }
		        numDone++;
		        if (numDone == numImages) {
		        	setSize();
                    numDone = 0;
		        }
                $(this).off('load');
		    });
		    if (this.complete) {
		        $(this).load();
		    }
		});
	}


	if ($('.label').length == 0){
		$('#slide_labels').hide();
		$('#slide_captions').css({'border-top': 'none'});
	} else {
		labelSizing();
	}
	if ($('.caption').length == 0){
		$('#slide_captions').hide();
	} else {
		captionSizing();
	}

	// build the slideline slider
	buildSlider();

	//add ticks to slideline slider
	setSliderTicks();
	
	//set heights of image container
	imageSizing();
	

	//This function sets the size of the caption & label areas to the tallest ones
	function captionSizing() {
		$('#slide_captions').css({'height': 0});
	    var captionHeights = [];
		$('.caption').each(function() {
			var captionHeight = $(this).children('p').outerHeight(true);
			captionHeights.push(captionHeight);
		});
		
		var tallestCaption = Math.max.apply(Math,captionHeights);	
		captionHeights = [];
		
		$('#slide_captions').css({'height': tallestCaption + 20});
	};

	function labelSizing() {
		$('#slide_labels').css({'height': 0});
		var labelHeights = [];
		$('.label').each(function() {
			var labelHeight = $(this).outerHeight(true);
			labelHeights.push(labelHeight);
		});
		var tallestLabel = Math.max.apply(Math,labelHeights);
		labelHeights = [];
		$('#slide_labels').css({'height': tallestLabel + 20});
	}

	$(document).on('mouseout', function(e) {
		e = e ? e : window.event;
		var from = e.relatedTarget || e.toElement;
		if (!from || from.nodeName == 'HTML'){
			// this detects that the mouse has left the frame - 
			// somehow need to trigger the slider stop event or use a hack
		}
	});

	$(window).resize(function() {
		captionSizing();
		labelSizing();
		imageSizing();
	});

	window.addEventListener('orientationchange', function() {
		captionSizing();
		labelSizing();
		imageSizing();
	});

	$(window).load(function() {
		$('.ui-slider-handle').addClass('pulsing');
		//FastClick.attach(document.body);
	});

	function setSize(){
		//console.log('set size called');
		s9.view.size({
    		height: $(document.body).outerHeight(true)
    	});
    }
	
 	
	
});


