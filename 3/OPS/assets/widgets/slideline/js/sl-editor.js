// (function() {

    //--------------------------------------------------------------------
    // Slide identifier helpers
    //--------------------------------------------------------------------

    /* function generateId() just gives consecutive numbers - 
     * this is used for a separate identifier from the index/order of the slides
     * and shouldn't change when the order is changed. It should be used for
     * actions that may be interwoven with reordering actions. E.g. image uploads, deletions.
     */
    function generateId() {
        if (generateId.count == undefined){
            generateId.count = 1;
        }
        return generateId.count++;
    }

    function getSlide(ident) {
        ident = parseInt(ident);
        var entry = $.grep(slideInfo, function(e){ return e.identifier === ident; });
        return entry[0];
    }
    
    // function getIndex returns the index of the slide with identifier @param ident
    // in slideInfo, i.e. one less than its number in the thumbnails.
    function getIndex(ident) { 
        ident = parseInt(ident);
        for (var i = 0; i < slideInfo.length; i++){
            if (slideInfo[i].identifier === ident){
                return i;
            }
        }
        return -1;
    }

    //--------------------------------------------------------------------
    // Global variables
    //--------------------------------------------------------------------

    var currentSlide = 0; //Note: this is a number defined by the order of the slides, not the identifiers.

    var slideInfo = [];

    var askConfirm = (function(){
        if (s9.initialParams['confirm']) {
            return (s9.initialParams['confirm'] === 'true');
        } else {    
            return true;
        }
    })();

    var blankImage = new Image();

    var last = 0; 
    var lastStop = 0;

    //--------------------------------------------------------------------
    // Initialization/setup functions
    //--------------------------------------------------------------------

    // NOTE: This function must be called before any other interactions with the slide data!
    function initSlideInfo() {
        var i = 1;
        while (true){
            var image = new Image();
            imgsrc = s9.initialParams['image' + i];
            if (!imgsrc){
                break;
            }
            image.src = imgsrc;
            image.className = 'fullImage';
            var label = s9.initialParams['label' + i];
            var caption = s9.initialParams['caption' + i];
            var ident = generateId();

            slideInfo.push({
                image: image,
                imgsrc: imgsrc,
                label: label,
                caption: caption,
                originalIndex: i,
                identifier: ident,
            });
            i++;
        }

        if (slideInfo.length > 0) {
            $('.preview').show();
            $('.upload').hide();
        } else {
            $('.preview').hide();
            $('.upload').show();
        }

        drawDeck();
    }

    function loadMediaTab(){
        var container = $('.mediaContent');
        drawThumbnails();

        var thumbs = $('.nav-slide');

        if (currentSlide > 0){
            selectSlide($('.nav-slide')[currentSlide-1]);
        }

        $('.nav-slide .actual-image').each(function() {
            $(this).load(function() {
                $(this).hide();
                $(this).fadeIn(400);
            });
        })
        orientThumbnails();

        $('.sortableThumbs').sortable({
            update: function(event, ui){
                
                var old_ind = ui.item.attr('data-index');
                renumberThumbnails();
                var new_ind = ui.item.attr('data-index');
                var slide = slideInfo.splice(old_ind - 1, 1);
                slideInfo.splice(new_ind - 1, 0, slide[0]);
                sendData();
                var activeIndex = $('.nav-slide.active').closest('li').attr('data-index');
                $('#slider').slider('value', activeIndex);
            },
            forcePlaceholderSize: true,
            placeholder: 'sortable-placeholder',
            scroll: false
        });
    }

    function drawThumbnails() {
        var slideTemplate = document.getElementById('slidelist-template').innerHTML.trim();
        var slide = Handlebars.compile(slideTemplate);
        var data = {
            slideData: slideInfo
        };
        var olContainer = document.querySelector('.mediaContent');
        olContainer.innerHTML = slide(data);
    }

    function drawDeck() {
        // var imagesTemplate = document.getElementById('images-template').innerHTML.trim();
        // var imagesCompiled = Handlebars.compile(imagesTemplate);
        // var data = {
        //     slideData: slideInfo
        // };
        // var olContainer = document.querySelector('#preview-image');
        // olContainer.innerHTML = imagesCompiled(data);
        for (var i = 0 ; i < slideInfo.length; i++){
            var wrapper = $('<div/>');
            wrapper.addClass('image-wrapper');
            wrapper.addClass('wrapper-' + slideInfo[i].identifier);
            wrapper.append(slideInfo[i].image);
            $('#preview-image').append(wrapper);
        }
    }

    function preloadImages(imageArray) {
        $(imageArray).each(function(i) {
            var img = new Image();
            img.src = imageArray[i]; 
            $(img).css('display', 'none');
            $('body').append(img);
        });
    }

    // This function sets the size of the preview image div to the tallest slide image. 
    // The nature of slideline means all slides should be the same size (or at least aspect ratio)
    // However since this is an editor, there may be some point during editing 
    // where the user is changing slides and has slides of different sizes. 
    function setPreviewSize() {
        //var w = $('#preview-image').outerWidth();
        $('#preview-image').css({height: '250px'}); //some minimum height

        $(slideInfo).each(function() {
            if (!this.image) {
                return;
            }
            $(this.image).load(function() {
                var w = $('#preview-image').outerWidth();
                var ratio = w / this.naturalWidth; 
                var displayH = this.naturalHeight * ratio;
                if (displayH > $('#preview-image').outerHeight()){
                    $('#preview-image').css({height: displayH});
                }
            });
            if (this.image && this.image.complete) {
                $(this.image).load();
            }
        });
    }

    //--------------------------------------------------------------------
    // Data-saving functions
    //--------------------------------------------------------------------

    function registerData() {
        var label = document.querySelector('.slide-label').value;
        var caption = document.querySelector('.slide-caption').value;
        slideInfo[currentSlide-1].label = label;
        slideInfo[currentSlide-1].caption = caption;
    }

    function sendData(){
        var payload = {
            'confirm': askConfirm
        };

        var i = 1;
        while (true){
            if (!slideInfo[i-1]) {
                break;
            }
            if (!slideInfo[i-1].image){
                i++;
                continue; //This ignores images not properly loaded. May want to change this in the future.
            }
            payload['image' + i] = slideInfo[i - 1].imgsrc;
            payload['label' + i] = slideInfo[i - 1].label;
            payload['caption' + i] = slideInfo[i - 1].caption;
            i++;
        }

        var checkboxes = $('input:checkbox');
        for (i = 0; i < checkboxes.length; i++){
            var key = checkboxes[i].name
            var value = $(checkboxes[i]).is(':checked') ? 'true' : 'false';
            payload[key] = value;
        }

        var menus = $('select');
        for (i = 0; i < menus.length; i++){
            var key = menus[i].name;
            var value = menus[i].value;
            payload[key] = value;
        }

        window.parent.postMessage({
            type: 'configuration',
            method: 'set',
            payload: payload
        }, '*');
    }

    //--------------------------------------------------------------------
    // Click functions
    //--------------------------------------------------------------------

    function toggleWorkspace() {
        $('.preview').toggle();
        $('.upload').toggle();
    }

    function clickAdd() {
        $('#image-uploader').click();
    }

    function clickReplace(id) {
        $('#image-replacer').data('id', id);
        $('#image-replacer').click();
    }

    function clickDelete(ident) {
        if (askConfirm){
            confirmDelete(ident);
        } else {
            deleteSlide(ident);
        }
    }

    //--------------------------------------------------------------------
    // Slide manipulation functions
    //--------------------------------------------------------------------

    function confirmDelete(ident) {
        var overlay = $('.overlay-mask');
        var dialog = $('.dialog-box');
        dialog.show();
        overlay.addClass('overlay-mask-visible');
        var confirm = $('.confirmDelete');
        var cancel = $('.cancelDelete');

        confirm.on('click', function() {
            deleteSlide(ident);
            $(this).off('click');
            $('.confirmation').hide();
            $('.overlay-mask').removeClass('overlay-mask-visible');
        });
        cancel.on('click', function() {
            $(confirm).off('click');
        });
    }

    function deleteSlide(ident) {
        var deleted = $('li.slide-' + ident)[0];
        var ind = getIndex(ident);
        // CAUTION: The above line is costly if there are many slides.
        if (ind > -1){
            $(slideInfo[ind].image).closest('.image-wrapper').remove();
            slideInfo.splice(ind, 1);
            sendData();
        }
        if (deleted != undefined){
            //remove from navigation
            var thumbInd = $(deleted).attr('data-index');
            var thumbs = $('.nav-slide');
            var next = thumbs[thumbInd];
            var prev = thumbs[thumbInd-2];
            $(deleted).animate({opacity: 0}, {duration: 50}).slideUp(100, function() {
                deleted.parentNode.removeChild(deleted);
                $('#slider').slider('option', 'max', slideInfo.length);
                

                var deleteActive = (thumbInd == currentSlide); //deleteActive must be recorded before renumbering!
                renumberThumbnails();
                setSliderTicks();

                //Below code switches focus if current slide was deleted.
                if (deleteActive){
                    if (next) {
                        selectSlide(next);
                    } else if (prev) {
                        selectSlide(prev);
                    } else {
                        toggleWorkspace();
                    }
                } else {
                    $('#slider').slider('value', currentSlide);
                }
                if (slideInfo.length == 0) {
                    currentSlide = 0;
                }
                setPreviewSize();


            });
        }
    }

    /* This function makes the slide indicated by @param which active.
     * @param which should be a div with the class "nav-slide")
     * directly containing the thumbnail image.
     * selectSlide highlights the thumbnail and shows the image and associated text.
     */
    function selectSlide(which) {
        if (!$(which).hasClass('nav-slide')) {
            console.log('selectSlide called with inappropriate argument.');
            return;
        }
        if ($(which).hasClass('active')) { //already active
            return;
        }
        var thumbs = $('.nav-slide');
        thumbs.removeClass('active');
        $(which).addClass('active');
        var li = $(which).closest('li');
        var ind = li.attr('data-index');
        var id = li.data('id');
        currentSlide = parseInt(ind);
        var slideEntry = getSlide(id);
        if (!slideEntry) {
            /* If execution gets here, information for this slide doesn't exist. 
             * This means something got messed up.
             * How should we handle this? 
             */
            return;
        }
    
        var show =  $('.wrapper-' + slideEntry.identifier);
        show.stop(true,true).animate({opacity: 1, duration: 370});
        if (lastStop > 0 && lastStop <= slideInfo.length){
            var hide = $('.wrapper-' + slideInfo[Math.round(lastStop)-1].identifier);
            if (show[0] != hide[0]) {
                hide.stop(true,true).animate({opacity: 0, duration: 370});
            }
        }
        lastStop = ind;

        // HACK (lilith): for some reason turning off animation and turning it back on 
        // after setting value fixes jerky animation issue. Can't pinpoint why the problem exists in the first place
        // although it seems to be a known problem with jQuery slider
        $('#slider').slider('option', 'animate', false); 
        $('#slider').slider('value', ind);
        $('#slider').slider('option', 'animate', true);

        if (slideEntry.label){
            $('.slide-label').val(slideEntry.label);
        } else {
            $('.slide-label').val('');
        }
        if (slideEntry.caption){
            $('.slide-caption').val(slideEntry.caption);
        } else {
            $('.slide-caption').val('');
        }

        autoSize($('.slide-caption')[0], false);

        // show preview if hidden
        if (!$('.preview').is(':visible')) {
            toggleWorkspace();
        }
    }

    /* NOTE: This implementation assumes that the slideInfo array 
     * is kept up to date with the thumbnail order.
     */
    function orientThumbnails() { 
        var thumb_imgs = $('.actual-image');
        $(thumb_imgs).each(function(i) {
            var image = slideInfo[i].image;
            if (!image) {
                return;
            }
            $(image).load( (function(thumb, image){
                return function() {
                    var portrait = (image.naturalHeight > image.naturalWidth);
                    if (portrait) {
                        $(thumb).removeClass('landscape');
                        $(thumb).addClass('portrait');
                    } else {
                        $(thumb).removeClass('portrait');
                        $(thumb).addClass('landscape');
                    }
                };
            })(this, image));

            if (image.complete) {
                $(image).load();
            }
        });
    }

    function renumberThumbnails(){
        var newCurrent = 0;
        var slides = document.querySelectorAll('#slides ol li');
        Array.prototype.forEach.call(slides, function(slide, arrayIdx){
            var idx = arrayIdx + 1;
            var oldIdx = slide.getAttribute('data-index');
            if (oldIdx == currentSlide){
                newCurrent = idx;
            }
            slide.setAttribute('data-index', idx);

            var image = $(slide).find('.actual-image');
            $(image).removeClass('image' + oldIdx).addClass('image' + idx);
        });
        currentSlide = newCurrent;
    }

    //--------------------------------------------------------------------
    // Caption/label functions
    //--------------------------------------------------------------------

    function autoSize(elem, animate) {
        /* V1: This is the simple, less expensive way. It's not smooth, though,
         * and it goes back to textarea default size when you expand and then
         * shrink down to one line or less. This looks kind of weird because it's not the same
         * size as our initial size (doesn't match the label text field height).
         */
        // this.style.height = 'auto';
        // this.style.height = (this.scrollHeight) + 'px';


        /* V2: This method uses a hidden copy for shrinking when text is deleted. 
         * It's an expensive thing to do, but we can do smooth animation of the resizing
         * and it can go back to the height we set initially when shrinking down to one line
         * or less.
         */
        var labelHeight = $('.slide-label').outerHeight(true);
        if (elem.scrollHeight >= 150){ // 150px = max height before scrolling is activated
            elem.style.overflow = 'auto';
            if (animate){
                $(elem).animate({height: '150px'}, {duration: 200, easing: 'linear', queue: false});
            } else {
                elem.style.height = '150px';
            }
            return;
        }
        elem.style.overflow = 'hidden';
        var copy = $('<textarea/>');
        copy.val(elem.value);
        copy.addClass('clone-caption');
        $(elem.parentNode).append(copy[0]);
        var h = copy[0].scrollHeight;
        if (h < labelHeight){
            h = labelHeight;
        }
        if (animate) {
            $(elem).animate({height: h.toString() + 'px'}, {duration: 200, easing: 'linear', queue: false});
        } else {
            elem.style.height = h.toString() + 'px';
        }
        copy.remove();
    }

    //--------------------------------------------------------------------
    // Slideline Navigation (slider)
    //--------------------------------------------------------------------

    function clearGhosts(start, end, animate) {
        for (var i = 0; i < slideInfo.length; i++){
            if (i == start || i == end) {
                continue;
            }
            var wrapper = $('.wrapper-' + slideInfo[i].identifier);
            if (animate) {
                wrapper.animate({opacity: 0, duration: 370});
            } else {
                wrapper.css({opacity: 0});
            }
        }
    }

    function buildSlider() {
        $("#slider").slider({
            animate: true,
            value: 1,
            min: 1,
            max: slideInfo.length,
            step: .01,
            slide: function (event, ui) {
                var sliderPos = (ui.value); //ex: 1.25
                var wholeSliderPos = Math.floor(sliderPos); //ex: 1
                var decVal = sliderPos - wholeSliderPos; // ex: 1.25 - 1 (=.25)
                var rangeStart = Math.floor(sliderPos);
                var rangeEnd = Math.ceil(sliderPos);

                if (lastStop != rangeStart && lastStop != rangeEnd && lastStop > 0 && lastStop <= slideInfo.length){
                    var old = $('.wrapper-' + slideInfo[lastStop - 1].identifier);
                    old.css('opacity', 0);
                }

                var currentImage = $('.wrapper-' + slideInfo[wholeSliderPos - 1].identifier);
                var nextImage = (wholeSliderPos < slideInfo.length ? $('.wrapper-' + slideInfo[wholeSliderPos].identifier) : []);

                if (ui.value > last) {
                    $(currentImage).css("opacity", 1 - decVal);
                    $(nextImage).css("opacity", decVal);
                }

                if (ui.value < last) {
                    $(currentImage).css("opacity", 1 - decVal);
                    $(nextImage).css("opacity", decVal);
                }

                if (Math.floor(last) != wholeSliderPos) {
                    clearGhosts(rangeStart - 1, rangeEnd - 1);
                }
                last = ui.value;
            },
            stop: function( event, ui ) {
                var wholeVal = Math.round(ui.value);
                $( "#slider" ).slider( 'value', wholeVal);

                clearGhosts(wholeVal - 1, undefined, true);
                //$('.image-wrapper').css({opacity: 0}, {queue: false});
                var slideEntry = slideInfo[wholeVal - 1];

                var thumb = $('.nav-slide.slide-' + slideEntry.identifier);

                var currentImage = $('.wrapper-' + slideEntry.identifier);
                $(currentImage).stop(true,true).animate({opacity: 1, duration: 370});

                $('.nav-slide').removeClass('active');
                thumb.addClass('active');

                if (slideEntry.label){
                    $('.slide-label').val(slideEntry.label);
                } else {
                    $('.slide-label').val('');
                }
                if (slideEntry.caption){
                    $('.slide-caption').val(slideEntry.caption);
                } else {
                    $('.slide-caption').val('');
                }
                
                last = wholeVal;
                lastStop = wholeVal;
                currentSlide = wholeVal;
            }

        });
    }

    function setSliderTicks(){
        var $slider =  $('#slider');
        var max =  $slider.slider("option", "max");    
        if (max > 1){
            var spacing =  100 / (max - 1);
        } else {
            var spacing = 50;
        }
        $slider.find('.ui-slider-tick-mark').remove();
        for (var i = 0; i < max ; i++) {
            $('<span class="ui-slider-tick-mark"></span>').css('left', (spacing * i) +  '%').appendTo($slider); 
        }
    }

    function initSlider() {
        buildSlider();
        setSliderTicks();
    }

    //--------------------------------------------------------------------
    // Drag-and-drop upload
    //--------------------------------------------------------------------
    // Following tutorial at http://www.sitepoint.com/html5-file-drag-and-drop/

    function dragInit() {
        // Initialize drag upload functionality
        var xhr = new XMLHttpRequest();
        if (xhr.upload) {
            var fileDrag = $('.drag-area')[0];
            fileDrag.addEventListener('dragover', dragHover, false);
            fileDrag.addEventListener('dragleave', dragHover, false);
            fileDrag.addEventListener('drop', fileDrop, false);

            $('.upload-instructions .details').show();
        }
    }

    function dragHover(e) {
        e.stopPropagation();
        e.preventDefault();
        if (e.type == 'dragover') {
            $(e.target).addClass('hovering')
            $('.dragText').addClass('ready-text');
            $('.dragText').text('Ready to Drop');
            $('.upload-instructions .details').text('Drop your files at any time.');
        } else {
            $(e.target).removeClass('hovering');
            $('.dragText').removeClass('ready-text');
            $('.dragText').text('Click to Upload Images');
            $('.upload-instructions .details').html('or drag and drop files from your desktop.<p/>* All images should have the same aspect ratio.');
        }
    }

    function fileDrop(e) {
        dragHover(e);
        uploadHandler(e);
    }

    //--------------------------------------------------------------------
    // Upload-related functions
    //--------------------------------------------------------------------

    function uploadHandler(e) {
        var files = e.target.files || e.dataTransfer.files;
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var slideTemp = document.getElementById('slide-partial').innerHTML.trim();
            var singleSlide = Handlebars.compile(slideTemp);
            var slideNum = slideInfo.length+1;
            var id = generateId();
            slideInfo.push({
                image: undefined,
                imgsrc: 'img/blank.svg',
                label: '',
                caption: '',
                originalIndex: slideNum,
                identifier: id,
            });
            var newSlide = singleSlide({
                originalIndex: (slideInfo.length),
                imgsrc: 'img/blank.svg', 
                identifier: id
            });
            $('.sortableThumbs').append(newSlide);
            var newWrapper = $('<div/>');
            newWrapper.addClass('image-wrapper wrapper-' + id);
            newWrapper.append('<span class="load-' + id + ' load-container"><span class="load-progress"></span></span>');
            $('#preview-image').append(newWrapper);
            $('li.slide-' + id + ' .nav-slide').append('<span class="load-' + id + ' load-container"><span class="load-progress"></span></span>');

            $('#slider').slider('option', 'max', slideInfo.length);
            setSliderTicks();

            window.parent.postMessage({
                type: 'asset', 
                method: 'image', 
                payload: {
                    data: file,
                    id: id,
                    progress: true,
                }
            }, '*');
        }
    }

     window.addEventListener('message', function(evt){
        var data = evt.data;
        if (data.type === 'asset' && data.method === 'image' && data.payload){
            var payload = data.payload;
            if (payload.progress === 1){ 
                if (payload.path){
                    var imgsrc = payload.path;
                    var id = payload.id;
                    var img = new Image();
                    img.src = imgsrc;
                    img.className = 'fullImage';
                    var slideEntry = getSlide(id);
                    if (!slideEntry) { 
                        //This means the slide was deleted before image finished uploading.
                        return;
                    }
                    
                    if (currentSlide == 0){ //if going from empty to 1+ slide, set first slide active
                        selectSlide($('.nav-slide')[0]);
                    }
                    //update thumbnail
                    var thumb = $('li.slide-' + id + ' .actual-image');
                    $('.load-' + id + ' .load-progress').width('100%');
                    thumb.attr('src', imgsrc);
                    thumb.load(function() {
                        $('.load-' + id).fadeOut(400, function() {
                                $('.load-' + id).remove();
                                thumb.fadeIn(400);
                                
                                slideEntry.image = img;
                                slideEntry.imgsrc = imgsrc;
                                sendData();
                                var imgWrapper = $('.wrapper-' + id);
                                imgWrapper.css({opacity: 0});
                                imgWrapper.empty().append(slideEntry.image);
                                if ($('li.slide-' + id + ' .nav-slide').hasClass('active')) {
                                    imgWrapper.animate({opacity: 1, duration: 400});
                                }
                                orientThumbnails();
                                setPreviewSize();
                            });
                        $(this).off('load');
                    });
                    if (thumb.complete) {
                        $(thumb).load();
                    }

                    renumberThumbnails();                    
                    
                } else {
                    // This means the upload failed.
                    // Should we alert failure to load as log message?
                    // Clean up thumbnails (remove failed uploads)?
                    // What should be done if it's a replacement? 
                    console.log('upload failed.');
                }
            } else { //not done, making progress
                var id = payload.id
                var loadPercent = payload.progress * 100;
                $('.load-' + id + ' .load-progress').delay(1500).width(loadPercent + '%');
                if (currentSlide == 0){ //if going from empty to 1+ slide, set first slide active
                    selectSlide($('.nav-slide')[0]);
                }
            }
        }
    });

    //--------------------------------------------------------------------
    // On-load functions - listeners, etc.
    //--------------------------------------------------------------------

    window.addEventListener('load', function() {
        document.querySelector('form').addEventListener('input', function(evt){
            registerData();
            sendData();
        });

        if (slideInfo.length > 0) {
            currentSlide = 1;
            selectSlide($('.nav-slide')[0]);
        }

        setPreviewSize();

        if (window.File && window.FileList && window.FileReader){
            console.log('Initializing file drop');
            dragInit();
        }

        $('.cancelDelete').click(function(){
            $('.confirmation').hide();
            $('.overlay-mask').removeClass('overlay-mask-visible');
        })

        $('#showDelConf').change(function() {
            if ($(this).is(':checked')){
                askConfirm = false;
            } else {
                askConfirm = true;
            }
            sendData();
        });

        $('.add-image').on('click', function() {
            clickAdd();
        })


        $('.btn-delete').on('click', function() {
            clickDelete(slideInfo[currentSlide-1].identifier);
            return false;
        });

        $('.btn-replace').on('click', function() {
            clickReplace(slideInfo[currentSlide-1].identifier);
            return false;
        });

        $('.drag-area').on('click', function() {
            clickAdd();
        });

        $('.slide-caption').on('input paste', function() {
            autoSize(this, true);
        });

        /* The following are "live" listeners - 
         * they should capture events on future elements 
         * that match the selector as well. 
         */

        $('.panel').on('click', '.btn-trash', function() {
            clickDelete( $(this).closest('li').data('id') );
            return false;
        });

        $('.panel').on('click', '.nav-slide', function() {
            selectSlide(this);
        });

        $('#image-uploader').change(function(e){
            uploadHandler(e);
            $(this).val('');
        });

        $('#image-replacer').change(function(){
            var file = document.getElementById('image-replacer').files[0];
            var id = $(this).data('id');
            var slideInd = getIndex(id);
            //TODO: THIS MIGHT NEED TO BE CHANGED - CHECK
            slideInfo[slideInd].image = undefined;

            // fade out thumbnail
            $('li.slide-' + id + ' .actual-image').fadeOut(400);
            // add loader spans
            $('li.slide-' + id + ' .nav-slide').append('<span class="load-' + id + ' load-container"><span class="load-progress"></span></span>');
            $('.wrapper-' + id).empty().append('<span class="load-' + id + ' load-container"><span class="load-progress"></span></span>');
            $(this).val('');

            window.parent.postMessage({
                type: 'asset', 
                method: 'image', 
                payload: {
                    data: file,
                    id: id,
                    progress: true,
                }
            }, '*');
        });
        
    });

    $(window).resize(function(){
        console.log('window resized');
        setPreviewSize();
    });

    //--------------------------------------------------------------------
    // DOM on-load functions
    //--------------------------------------------------------------------

    window.addEventListener('DOMContentLoaded', function(){
        Handlebars.registerPartial('slide', $('#slide-partial').html());
        // Handlebars.registerPartial('image', $('#image-partial').html());

        if (document.location.hostname == 'localhost' || document.location.hostname == 'svn.inkling.com'){
            s9.initialParams = {
                "image1": "img/slideline_placeholder_images_1.jpg",
                "caption1": "This is the first caption. This is optional.",
                "label1": "Label 1. This is optional.",
                // "image2": "img/slideline_placeholder_images_2.jpg",
                // "caption2": "This is the second caption. This is optional.",
                // "label2": "Label 2. This is optional.",
                // "image3": "img/slideline_placeholder_images_3.jpg",
                // "caption3": "This is the third caption. This is optional.",
                // "label3": "Label 3. This is optional.",
                // "image4": "img/slideline_placeholder_images_4.jpg",
                // "caption4": "This is the fourth caption. This is optional.",
                // "label4": "Label 4. This is optional.",
                // "image5": "img/slideline_placeholder_images_5.jpg",
                // "caption5": "This is the fifth caption. This is optional.",
                // "label5": "Label 5. This is optional.",
                // "image6": "img/slideline_placeholder_images_6.jpg",
                // "caption6": "This is the sixth caption. This is optional.",
                // "label6": "Label 6. This is optional.",
            }
        };

        initSlideInfo();

        initSlider();
        loadMediaTab();

        blankImage.src = 'img/blank.svg';
        $(blankImage).addClass('load-placeholder');
    });

// })();