if (document.location.hostname === "localhost" || document.location.hostname === "10.8.8.65") {
    s9.initialParams = {
        "show-button-text": "Show Answer",
        "hide-button-text": "Hide Answer",
        "answer": "Insert fancy answer text here!",
        "imgSrc": "img/image1.jpg"
    };
}

$(function() {
    // set initial params as variables  
    var showButton = s9.initialParams["show-button-text"];
    var hideButton = s9.initialParams["hide-button-text"];
    var answer = s9.initialParams.answer;
    var imgSrc = s9.initialParams.imgSrc;

    //set show/hide params in DOM
    $('.button_text').html(showButton);
    $('#answerImg').before(answer);

    if (imgSrc) {
        $('<img />', {src: imgSrc}).appendTo('#answerImg');
    }
    var startHeight = $('.button').outerHeight(true);

    // setting widget_con to height of button +1 to account for bottom border
    $('.widget_container').css("height", startHeight + 1);

    //creating variable to use later
    var closeHeight = $('.widget_container').outerHeight(true);

    //setting iframe height to widget container size
    s9.view.size({
        height: closeHeight
    });

    var answerHeight;
    var endHeight;
    var isAnimating = false;

    function closeWidget() {
        isAnimating = true;
        answerHeight = $('.answer').outerHeight(true);
        endHeight = answerHeight + closeHeight;
        $('.button').removeClass('clicked');
        $('.button_text').html(showButton);
        $('.widget_container').animate({
                height: closeHeight
            },
            //animate options
            {
                duration: 500,
                progress: function(animation, progress, remainingMS) {
                    // s9.view.size({height: closeHeight + (1 - progress) * answerHeight} ); 
                    s9.view.size({
                        height: $('.widget_container').outerHeight(true)
                    });
                },
                complete: function() {
                    isAnimating = false;
                    s9.view.size({
                        height: $('.widget_container').outerHeight(true)
                    }); //as a safety check 
                }
            }
        );
    }

    function openWidget() {
        isAnimating = true;
        answerHeight = $('.answer').outerHeight(true);
        endHeight = answerHeight + closeHeight;
        $('.button').addClass('clicked');
        $('.button_text').html(hideButton);
        $('.widget_container').animate({
                height: endHeight
            },
            //animate options
            {
                duration: 500,
                progress: function(animation, progress, remainingMS) {
                    //bottomBuffer for aesthetic effect. spaces the bottom from text so 
                    //it doesn't run up against the text in case of lag
                    var bottomBuffer = 50;
                    var newHeight = progress * endHeight + bottomBuffer;
                    if (newHeight > endHeight) {
                        newHeight = endHeight;
                    } //stop animating once get to bottom of buffer
                    s9.view.size({
                        height: newHeight
                    });
                },
                complete: function() {
                    isAnimating = false;
                    s9.view.size({
                        height: endHeight
                    }); //safeguard again
                }
            }
        );
    }

    //animate opening and set new iframe height when button is clicked
    $('.button').on("click touch", function(e) {
        if ($(this).hasClass('clicked')) {
            closeWidget();
        } else {
            openWidget();
        }
    });

    $(window).resize(function() {
         //prevent glitch behavior (flash) from resizing while animating
        if ($("div:animated").length === 0) {
            var answerHeight = $('.answer').outerHeight(true);
            if ($('.button').hasClass('clicked')) {
                var containerHeight = $('.button').outerHeight(true) + answerHeight;
                $('.widget_container').css("height", containerHeight);
            } else {
                var containerHeight = $('.button').outerHeight(true);
                $('.widget_container').css("height", containerHeight);
            }
            s9.view.size({
                height: containerHeight
            });
        }
    });
});
