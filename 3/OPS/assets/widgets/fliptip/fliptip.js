/**
 * FlipTips 1.0
 * All code not previously covered by 3rd party licenses (MIT, etc) is copyright Inkling, 2013.
 */

var collection = {
    // Options for s9 params.
    options : {
        cardHeight : Number,
        cardWidth  : Number,
        shuffle    : 'boolean',
        edit       : 'boolean',
        flipOrient : 'x|y',
    }
}

// Process the cards, add handlers, etc.
var init = function(cards){
    if (!cards){
        cards = {};
        var numCards = 6;
        for (var x = 1; x <= numCards; x++){
            if (s9.initialParams['card' + x + '-front']){
                cards[x] = {
                    front : s9.initialParams['card' + x + '-front'],
                    back  : s9.initialParams['card' + x + '-back']
                }
            }
        }

        collection.cards = cards;
    }

    var source = $('#card_template').html();
    var template = Handlebars.compile(source);
    $('#card_container').append(template(collection));
}

// Determine if fliptip card has an image in it or if card is entirely image.
Handlebars.registerHelper('transmogrify',function(cardInfo){
    // SafeString prevents escapation.
    return new Handlebars.SafeString(cardInfo);
});

function resize(){
    s9.view.size({
        height: document.documentElement.offsetHeight
    });
}

// Resize the widget when the window is resized.
$(window).resize(resize);

$(document).ready(function(){
    init();

    // Set size on load.
    resize();

    // Fastclick removes 300ms delay on touch devices.
    window.addEventListener('load', function(){
        new FastClick(document.body);
    }, false);

    $("#card_container").on('click', '.card', function(e){
        $(this).toggleClass('flip');
    });
});

