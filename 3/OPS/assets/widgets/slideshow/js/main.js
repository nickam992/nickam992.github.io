var mySwiper;

$(document).ready(function(){

	if (window.top != window.self) { // is used in iframe
		var w = window.document.documentElement.clientWidth;
        $(document.body).css({width: w});
    }

	if (document.location.hostname == "localhost" || document.location.hostname == "10.0.2.2" || document.location.hostname == "svn.inkling.com"){
		s9.initialParams = {
			image1: 'img/image1.jpg',
			title1: 'Image 1',
			image2: 'img/image2.jpg',
			title2: 'Image 2',
			caption2: 'Caption two',
			source2: 'Source two',
			image3: 'img/image3.jpg',
			source3: 'source three',
			autoplay: 'true'
		}
	};

	$(".prev_nav").bind("click touch", function(){
		var numSlides = $('div.swiper-slide:not(.swiper-slide-duplicate)').length;
		if (numSlides < 0) numSlides = 0;
		if (mySwiper.activeIndex == 1){
			flyTo(numSlides - 1);
		} else {
			mySwiper.swipePrev();
		}
	});

	$(".next_nav").bind("click touch", function(){
		var numSlides = $('div.swiper-slide:not(.swiper-slide-duplicate)').length;
		if (numSlides < 0) numSlides = 0;
		if (mySwiper.activeIndex == numSlides){
			flyTo(0);
		} else {
			mySwiper.swipeNext();
		}
	});

	// Swiper to given slide (beginning or end only, since intermediary slides are hidden during transition)
	function flyTo(slide) {
		// Temporarily remove intermediary slides - the callback puts them back after slide has transitioned.
		var intermediates = $('div.swiper-slide:not(.swiper-slide-duplicate) .image').slice(1,-1);
		intermediates.css({opacity: 0})
		mySwiper.swipeTo(slide);
	}

	function preloadimages(arr){
	    var newimages=[], loadedimages=0
	    var postaction=function(){}
	    var arr=(typeof arr!="object")? [arr] : arr
	    function imageloadpost(){
	        loadedimages++
	        if (loadedimages==arr.length){
	            postaction(newimages)
	        }
	    }
	    for (var i=0; i<arr.length; i++){
	        newimages[i]=new Image()
	        newimages[i].src=arr[i]
	        newimages[i].onload=function(){
	            imageloadpost()
	        }
	        newimages[i].onerror=function(){
	            imageloadpost()
	        }
	    }
	    return { 
	        done:function(f){
	            postaction=f || postaction // Remember user defined callback functions to be called when images load.
	        }
	    }
	}

	function refreshFunctions() {
		if (window.top != window.self) { // is used in iframe
			var w = window.document.documentElement.clientWidth;
	        $(document.body).css({width: w});
	    }
	    //HACK (lilith): There are some issues with the way the swiper calculates heights, etc. when it's resized. The timeout seems to help.
	   	window.setTimeout(function() {
	   		mySwiper.resizeFix();
			widgetSizing();
			var navHeight = $('.prev_nav').outerHeight(true);
			$('.slideshow_nav').css("top", ($('.swiper-wrapper').outerHeight()*0.5 - navHeight*0.5));
		}, 1);
	}

	function widgetSizing() {
	    var heights_array = [];
	    var title = $('.slide-title');
	    var caption = $('.slide-caption');
	    var source = $('.slide-source');
	    var curTitle = title.html();
	    var curCaption = caption.html();
	    var curSource = source.html();
	    var titleVisible = title.is(':visible');
	    var captionVisible = caption.is(':visible');
	    var sourceVisible = source.is(':visible');

	   	//This makes the text temporarily invisible while we cycle through the captions/sources to find the tallest one
	   	title.addClass('hidden');
	   	caption.addClass('hidden');
	   	source.addClass('hidden');
	   	title.show();
	    caption.show();
	    source.show();

		$('div.swiper-slide:not(.swiper-slide-duplicate)').each(function(i) {
			var titleText = s9.initialParams['title' + (i+1)] || ''; 
			var captionText = s9.initialParams['caption' + (i+1)] || ''; 
			var sourceText = s9.initialParams['source' + (i+1)] || '';

			title.empty().html(sanitize(titleText));
			caption.empty().html(sanitize(captionText));
			source.empty().html(sanitize(sourceText, true));
			var slideHeight = $(document.body).outerHeight(true);

			heights_array.push(slideHeight);
		});

		//restore original state
		title.empty().html(curTitle);
		caption.empty().html(curCaption);
		source.empty().html(curSource);
		title.removeClass('hidden');
		caption.removeClass('hidden');
	   	source.removeClass('hidden');

	   	if (!titleVisible){
			title.hide();
		}
		if (!captionVisible){
			caption.hide();
		}
		if (!sourceVisible) {
			source.hide();
		}

		var tallestSlide = Math.max.apply(Math,heights_array);
		
		heights_array = [];
		s9.view.size({
			height: tallestSlide
		})
	};


	/* Encode all tags except bold and italic (and, optionally, links). NOTE: this is not very strict - 
	 * if worried about security issues, other measures should be taken
	 * HTML encoding from http://stackoverflow.com/questions/1219860/html-encoding-in-javascript-jquery
	 */
	function includeLinks(match){
		var link = /^(<\/a>)|(<\s*?a\s+href\s*=\s*(\"([^"]*\")|'[^']*')(\s+[a-z]+\s*=\s*(\"([^"]*\")|'[^']*'))*[ \/]*>)$/im;
		if (match.match(link)) {
			return match;
		} else {
			return noLinks(match);
	 	}
	}

	function noLinks(match){
		var bi = /^<\s*?\/?\s*?[bi]\s*?>$/im;
		if (match.match(bi)){
			return match;
		} else {
	 		return match.replace(/&/g, '&amp;')
	            .replace(/"/g, '&quot;')
	            .replace(/'/g, '&#39;')
	            .replace(/</g, '&lt;')
	            .replace(/>/g, '&gt;');
	 	}
	}

	/* Sanitize makes all tags plain except for bold and italic (and links, if allowLinks is true)
	 * NOTE: this is not very strict - 
	 * if worried about security issues, other measures should be taken!
	 * This must be done on the consumer side (i.e. when the content is rendered)
	 * because code mode can get around any sanitization we do when storing the 
	 * caption/sources.
	 */
	function sanitize(str, allowLinks) {
		allowLinks = allowLinks || false;
		if (!str) {
			return;
		}
	    var re = /<\s*?(\/)?\s*?([a-z])*(\s*?[a-z]+\s*?=\s*?"\s*?[^"]*\s*?")*?\s*?>/igm;
	    var sanitized = allowLinks ? str.replace(re, includeLinks) : str.replace(re, noLinks);
	    return sanitized;
	}

	function showSlideInfo() {
		numSlides = $('div.swiper-slide:not(.swiper-slide-duplicate)').length;
		var target = numSlides;
		if (mySwiper.activeIndex > 0) {
			target = (mySwiper.activeIndex - 1) % numSlides + 1;
		}
		if (imgArr.length == 1){ 
			// This is an edge case - it's the only case where you navigate to same slide
			// and the slider's numbering/duplication system is also different in this case.
			target = 1;
		}

		var title = $(".slide-title");
		var caption = $(".slide-caption");
		var source = $(".slide-source");
		
		//Crossfade caption & source
		var titleText = (s9.initialParams['title' + target]) || '';
		var captionText = (s9.initialParams['caption' + target]) || '';
		var sourceText =(s9.initialParams['source' + target]) || '';
		// Fade outs
		var fadeOuts = function() {
			title.animate({opacity: 0},{queue: false, duration: 150, complete: function() {
				title.html(sanitize(titleText));
			}});
			caption.animate({opacity: 0},{queue: false, duration: 150, complete: function() {
				caption.html(sanitize(captionText));
			}});
			source.animate({opacity: 0},{queue: false, duration: 150, complete: function() {
				source.html(sanitize(sourceText, true));
			}});
		}
		
		// Slides
		var sliding = function() {
			if (titleText) {
				title.slideDown({queue: false, duration: 10});
			} else {
				title.slideUp({queue: false, duration: 10});
			}

			if (captionText) {
				caption.slideDown({queue: false, duration: 10});
			} else {
				caption.slideUp({queue: false, duration: 10});
			}

			if (sourceText){
				source.slideDown({queue: false, duration: 10});
			} else {
				source.slideUp({queue: false, duration: 10});
			}
			
		}
		// Fade ins
		var fadeIns = function() {
			title.animate({opacity: 1},{queue: false, duration: 150});
			caption.animate({opacity: 1},{queue: false, duration: 150});
			source.animate({opacity: 1},{queue: false, duration: 150});
		}

		fadeOuts();
		var t = title.promise();
		var c = caption.promise();
		var s = source.promise();
		$.when(c, s, t).done(function() {
			sliding();
			t = title.promise();
			c = caption.promise();
			s = source.promise();
			$.when(c, s, t).done(function() {
				fadeIns();
			});
		});
	}


	// Below is actual function execution (above are the declarations).

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
		slideInfo['slideData'].push({
			image : s9.initialParams['image'+(i+1)], 
			caption : s9.initialParams['caption'+(i+1)], 
			source : s9.initialParams['source'+(i+1)], 
			index : temp
		});
	};

	var slideTemplate = $(".swiper-slide").html();

	var slide = Handlebars.compile(slideTemplate);
	$(".swiper-wrapper").append(slide(slideInfo));

   	var autoplay = (s9.initialParams['autoplay'] === "true") ? 5000 : false;
    var config = {
		// horizontal or vertical slide direction
		mode: 'horizontal',
		// continuous loop through all slides
		loop: true,
		centeredSlides: true,
		calculateHeight: true,
		autoResize: false,
		pagination: '.my-pagination',
		paginationClickable: true,
		paginationElement: 'div',
		createPagination: true,
		autoplay: autoplay,
		keyboardControl: true,
		autoplayDisableOnInteraction: true,

	}
    
    mySwiper = $('.swiper-container').swiper(config);
    // By default, if showNav is unspecified, whatever navType is selected is shown
    // (or both dots and arrows if navType is unspecified as well)
    if (!(s9.initialParams['showNav'] === "true" || s9.initialParams['showNav'] == undefined)) {
    	//hide pagination and arrows
    	$('.slideshow_nav').hide();
    	$('.my-pagination').hide();
    } else { //if navigation is shown, determine what type
		switch (s9.initialParams['navType']){
		 	case 'dots':
		 		$('.slideshow_nav').hide();
		 		break;
		 	case 'arrows':
		 		$('.my-pagination').hide();
		 		break;
		 	case 'dotsAndArrows':
		 		break;
		 	default:
		 		break;
		}
  	}

	//loading images
	preloadimages(imgArr).done(function(images){
	 	console.log('images have loaded');
		refreshFunctions();
	});

	// adding callback to load captions and sources on slide change
	mySwiper.addCallback('SlideChangeStart', showSlideInfo);
	mySwiper.addCallback('SlideChangeEnd', function() {
		$('div.swiper-slide:not(.swiper-slide-duplicate) .image').css({opacity: 1});
	});

	$('.swiper-pagination-switch').one('click', function() {
		mySwiper.stopAutoplay();
	});

	$(window).resize(function(){
		refreshFunctions();
	});

	$(window).bind('orientationchange', function() {
		refreshFunctions();
	});

	$(window).load(function() {
		var w = $(document.body).outerWidth(true);
		$('div.swiper-slide .image').each(function(){
			var ratio = $('.image-container').outerHeight(true) / this.naturalHeight;
			var vert = this.naturalWidth * ratio < w;
			if (vert) { 
				$(this).addClass('vert');
			} else {
				$(this).addClass('horiz');
			}
		});

		FastClick.attach(document.body);

	});
	
	refreshFunctions();
	showSlideInfo();
});

