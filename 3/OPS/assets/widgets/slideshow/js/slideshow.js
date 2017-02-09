(function() {

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
            var title = s9.initialParams['title' + i];
            var caption = s9.initialParams['caption' + i];
            var source = s9.initialParams['source' + i];
            var ident = generateId();

            slideInfo.push({
                image: image,
                imgsrc: imgsrc,
                title: title,
                caption: caption,
                source: source,
                originalIndex: i,
                identifier: ident,
            });
            i++;
        }

        if (slideInfo.length > 0) {
            currentSlide = 1;
            // The line below is used instead of selectSlide because it's called before the thumbnails exist.
            $('#preview-image').empty().append(slideInfo[0].image); 
            $('.preview').show();
            $('.upload').hide();
        } else {
            $('.preview').hide();
            $('.upload').show();
        }
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
            },
            forcePlaceholderSize: true,
            placeholder: 'sortable-placeholder',
            scroll: false
        });
    }

    function loadSettingsTab(){
        var settingsTemplate = document.getElementById('settings-template').innerHTML.trim();
        var settingsPanel = Handlebars.compile(settingsTemplate);
        
        var olContainer = document.querySelector('.settingsContent');
        olContainer.innerHTML = settingsPanel({});

        $('input:checkbox').each(function() {
            var name = this.name;
            if (name == 'showNav' && !s9.initialParams[name]){
                $(this).attr('checked', true);
                return;
            }
            if (s9.initialParams[name] === 'true') {
                $(this).attr('checked', true);
            } else {
                $(this).attr('checked', false);
            }
        });

        $('select').each(function() {
            var name = this.name;
            if (s9.initialParams[name]) {
                $(this).val(s9.initialParams[name]);
            } else {
                if (name == 'navType'){
                    $(this).val('dotsAndArrows');
                }
            }
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

    function preloadImages(imageArray) {
        $(imageArray).each(function(i) {
            var img = new Image();
            img.src = imageArray[i]; 
            $(img).css('display', 'none');
            $('body').append(img);
        });
    }

    //--------------------------------------------------------------------
    // Data-saving functions
    //--------------------------------------------------------------------

    function registerData() {
        var title = document.querySelector('.slide-title').value;
        var caption = document.querySelector('.slide-caption').value;
        var source = document.querySelector('.slide-source').value;
        slideInfo[currentSlide-1].title = title;
        slideInfo[currentSlide-1].caption = caption;
        slideInfo[currentSlide-1].source = source;
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
            payload['title' + i] = slideInfo[i - 1].title;
            payload['caption' + i] = slideInfo[i - 1].caption;
            payload['source' + i] = slideInfo[i - 1].source;
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
                var deleteActive = (thumbInd == currentSlide); //deleteActive must be recorded before renumbering!
                renumberThumbnails();
                //Below code switches focus if current slide was deleted.
                if (deleteActive){
                    if (next) {
                        selectSlide(next);
                    } else if (prev) {
                        selectSlide(prev);
                    } else {
                        toggleWorkspace();
                    }
                }
                
                if (slideInfo.length == 0) {
                    currentSlide = 0;
                }
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
            console.log('Slide information missing for slide ' + ind + '!');
            return;
        }
        // show image
        if (!slideEntry.image) { //not yet loaded/unsuccessful upload

            var id = slideEntry.identifier;
            $('#preview-image').empty().append(blankImage);
            var loadbar = $(which).find('.load-container').clone();
            $('#preview-image').append(loadbar);
        } else {
            $('#preview-image img').fadeIn(0);
            $('#preview-image').empty().append(slideEntry.image);
        }

        if (slideEntry.title){
            $('.slide-title').val(slideEntry.title);
        } else {
            $('.slide-title').val('');
        }
        if (slideEntry.caption){
            $('.slide-caption').val(slideEntry.caption);
        } else {
            $('.slide-caption').val('');
        }
        if (slideEntry.source){
            $('.slide-source').val(slideEntry.source);
        } else {
            $('.slide-source').val('');
        }

        // $('.slide-caption').trigger('input');
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
                $(image).off('load');
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
    // Caption/source functions
    //--------------------------------------------------------------------

    function autoSize(elem, animate) {
        /* V1: This is the simple, less expensive way. It's not smooth, though,
         * and it goes back to textarea default size when you expand and then
         * shrink down to one line or less. This looks kind of weird because it's not the same
         * size as our initial size (doesn't match the source text field height).
         */
        // this.style.height = 'auto';
        // this.style.height = (this.scrollHeight) + 'px';


        /* V2: This method uses a hidden copy for shrinking when text is deleted. 
         * It's an expensive thing to do, but we can do smooth animation of the resizing
         * and it can go back to the height we set initially when shrinking down to one line
         * or less.
         */
        var sourceHeight = $('.slide-source').outerHeight(true);
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
        if (h < sourceHeight){
            h = sourceHeight;
        }
        if (animate) {
            $(elem).animate({height: h.toString() + 'px'}, {duration: 200, easing: 'linear', queue: false});
        } else {
            elem.style.height = h.toString() + 'px';
        }
        copy.remove();
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
            $('.upload-instructions .details').text('Drop your files at any time');
        } else {
            $(e.target).removeClass('hovering');
            $('.dragText').removeClass('ready-text');
            $('.dragText').text('Click to Upload Images');
            $('.upload-instructions .details').text('or drag and drop files from your desktop');
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
                title: '',
                caption: '',
                source: '',
                originalIndex: slideNum,
                identifier: id,
            });
            var newSlide = singleSlide({
                originalIndex: (slideInfo.length),
                imgsrc: 'img/blank.svg', 
                identifier: id
            });
            $('.sortableThumbs').append(newSlide);
            $('li.slide-' + id + ' .actual-image').fadeOut(400);
            $('li.slide-' + id + ' .nav-slide').append('<span class="load-' + id + ' load-container"><span class="load-progress"></span></span>');

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
                                if (slideInfo[currentSlide-1].identifier == id){
                                    var previewImg = $('#preview-image img');
                                    previewImg.fadeOut(0);
                                    $('#preview-image').empty().append(slideEntry.image);
                                    previewImg.fadeIn(400);
                                }
                                orientThumbnails();
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

        if (window.File && window.FileList && window.FileReader){
            console.log('Initializing file drop');
            dragInit();
        }

        $('select').change(function(){
            sendData();
        });

        $('input:checkbox').change(function() {
            sendData();
        });   

        $('input[name="showNav"]').change(function(){
            var selectType = $('select[name="navType"]');
            var fancySelectType = selectType.next();
            if ($(this).is(':checked')) {
                selectType.prop('disabled', false);
                fancySelectType.show();
            } else {
                selectType.prop('disabled', true);
                fancySelectType.hide();
            }
        });

        $('input[name="showNav"]').trigger('change');

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
            slideInfo[slideInd].image = undefined;

            // fade out thumbnail and image
            $('li.slide-' + id + ' .actual-image').fadeOut(400);
            $('#preview-image img').animate({opacity: 0}, {duration: 400});
            // add loader spans
            $('li.slide-' + id + ' .nav-slide').append('<span class="load-' + id + ' load-container"><span class="load-progress"></span></span>');
            $('#preview-image').append('<span class="load-' + id + ' load-container"><span class="load-progress"></span></span>');
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

    //--------------------------------------------------------------------
    // DOM on-load functions
    //--------------------------------------------------------------------

    window.addEventListener('DOMContentLoaded', function(){
        Handlebars.registerPartial('slide', $('#slide-partial').html());

        if (document.location.hostname == 'localhost' || document.location.hostname == 'svn.inkling.com'){
            s9.initialParams = {
                image1: 'img/image1.jpg',
                title1: 'Image One',
                image2: 'img/image2.jpg',
                caption2: 'caption two',
                source2: 'source two',
                image3: 'img/image3.jpg',
                caption3: 'caption three',
                source3: 'source three'
            }
        };

        initSlideInfo();

        loadMediaTab();
        loadSettingsTab();

        fancySelect();

        blankImage.src = 'img/blank.svg';
        $(blankImage).addClass('loader-placeholder');
    });

})();