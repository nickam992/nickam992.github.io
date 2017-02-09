/*
globals $
*/
$(function() {
    "use strict";
    /* 
    Initialize by getting values from window
    */
    var initialParams = {};
    window.location.search.replace(/([^?=&]+)(=([^&]*))?/g, function($0, $1, $2, $3) {
        var key = $1;
        var value = decodeURIComponent($3);
        initialParams[key] = value;
    });

    $('#answerText').val(initialParams.answer);
    $('.hide-button-text input').val(initialParams['hide-button-text']);
    $('.show-button-text input').val(initialParams['show-button-text']);
    var src = initialParams.imgSrc;
    $('textarea').css('height', 'auto');
    $('textarea').css('height', $('textarea')[0].scrollHeight + 'px');
    $('.imageEditor').addClass('enabled');

    if (src) {
        setupImage();
        var img = document.createElement('img');
        img.src = src;
        img.id = "imageContainer";
        $('.image').html(img);
        bindSwapbutton();
        bindTrashButton();
    }

    var imgSrc = src;
    //delegate button clicking behavior
    $('.editor').delegate('.button', 'mousedown', function() {
        if ($(this).hasClass('enabled')) {
            $(this).addClass('click');
        }
    });

    $('.editor').delegate('.button', 'mouseup', function() {
        $(this).removeClass('click');
    });


    /*
Wait for image upload
*/
    window.addEventListener('message', function(evt) {
        var data = evt.data;
        if (data.type === 'asset' && data.method === 'image') {
            var payload = data.payload;
            if (payload.progress === 1) {
                if (payload.path) {
                    imgSrc = payload.path;
                    var img = $('#imageContainer');
                    img[0].src = payload.path;
                    img.fadeIn(500);
                    $('.load-container').fadeOut(500, function() {
                        $('.load-container').remove();
                    });
                    $('.load-container').remove();
                }
                sendData();
            } else {
                var loadPercent = payload.progress * 100;
                $('.load-progress').width(loadPercent + '%');
            }
        }
    });

    /*
    Gets the values from the form with defaults set
    */

    function getSaveData() {
        var showButtonText = $('.show-button-text input').val() || "Show Button";
        var hideButtonText = $('.hide-button-text input').val() || "Hide Button";
        var answerText = $('#answerText').val();
        return {
            "show-button-text": showButtonText,
            "hide-button-text": hideButtonText,
            "answer": answerText,
            "imgSrc": imgSrc ? (imgSrc) : ""
        };
    }

    /*
  Bind saving to each keypress in input fields
  */
    $('input, textarea').on('input', function(e) {
        // $('textarea').css('height', 'auto');
        $('textarea').css('height', $('textarea')[0].scrollHeight);
        sendData();
    });


    /*--------------Image adding management ---------------*/



    /*
  Image selection grabs file and renders a preview
  */


    $('#imagePicker').change(function() {
        var file = document.getElementById('imagePicker').files[0];
        if (file) {
            setupImage();
            $('.image').append('<span class="load-container"><span class="load-progress"></span></span>');
            window.parent.postMessage({
                "type": "asset",
                "method": "image",
                "payload": {
                    "data": document.getElementById('imagePicker').files[0],
                    "progress": true
                }
            }, "*");
        }
        //allows double selection after deletion
        $(this).val("");
        bindTrashButton();
        bindSwapbutton();
    });

    function setupImage() {
        $('#imageGroup').css('display', 'table');
        $('.imageEditor').addClass('disabled');
        $('.imageEditor').removeClass('enabled');
        document.getElementById('imagePicker').disabled = true;
        $('.imageEditor').removeAttr("name");
    }

    function sendData() {
        window.parent.postMessage({
            "type": "configuration",
            "method": "set",
            "payload": getSaveData()
        }, "*");
    }


    /*--------------Image swap/deletion management ---------------*/

    /*
  Manage button placement
  */

    function bindTrashButton() {
        $('.btn-delete').click(function() {
            $('#imageGroup').fadeOut(150, function() {
                $('#imageGroup').css('display', 'none');
                $('#imageContainer')[0].src = "";
            });
            $('.imageEditor').removeClass('disabled');
            $('.imageEditor').addClass('enabled');
            $('.imageEditor').attr("name", "Add Image");
            document.getElementById('imagePicker').disabled = false;
            imgSrc = "";
            sendData();
        });
    }

    function bindSwapbutton() {
        $('#swapButton').change(function() {
            var file = document.getElementById('swapButton').files[0];
            if (file) {
                $('#imageContainer').fadeOut(400);
                $('.image').append('<span class="load-container"><span class="load-progress"></span></span>');
                window.parent.postMessage({
                    "type": "asset",
                    "method": "image",
                    "payload": {
                        "data": document.getElementById('swapButton').files[0],
                        "progress": true
                    }
                }, "*");
            }
        });
    }
});
