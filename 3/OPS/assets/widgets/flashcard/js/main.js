//--------------------------------------------------------------------
// Image width IE9 fix (HACK)
//--------------------------------------------------------------------
 (function($){
    var
    props = ['Width', 'Height'],
    prop;

    while (prop = props.pop()) {
    (function (natural, prop) {
      $.fn[natural] = (natural in new Image()) ? 
      function () {
      return this[0][natural];
      } : 
      function () {
      var 
      node = this[0],
      img,
      value;

      if (node.tagName.toLowerCase() === 'img') {
        img = new Image();
        img.src = node.src,
        value = img[prop];
      }
      return value;
      };
    }('natural' + prop, prop.toLowerCase()));
    }
  }(jQuery));

//--------------------------------------------------------------------
// Get Image Orientation and apply class
//--------------------------------------------------------------------
(function( $ ) {
 
    $.fn.setOrientation = function() {
 
        this.load(function() {
            $(this).removeClass('landscape portrait');
            if(this.naturalWidth > this.naturalHeight ) {
                $(this).addClass('landscape');
            } else {
                $(this).addClass('portrait');
            }
        });

        return this;
 
    };
 
}( jQuery ));

//--------------------------------------------------------------------
// Update Cards and Menus
//--------------------------------------------------------------------
function updateView () {

    // update both the select menu and the card.

    params.card = {};

    params.global = {};

    $.each(payload, function(key, value) {

        var keyVars = key.split('.');

        if (keyVars[0] == 'global') {
            var globalVar = keyVars[1];

            params.global[globalVar] = value;

        } else {
            var id = keyVars[0],
            side = keyVars[1],
            param = keyVars[2],
            card = "card-" + id;

            if(!params.card[side]) {
                params.card[side] = {};
            }

            params.card.id = "card-" + id;
            params.card[side][param] = value;
        }

    });
    
    $.each(params, function(key, value){

        var id = this.id;

        // TODO[Anthony]: Add code here for multple flashcards.

        // Loop over the sides

        $.each(params.card, function(key, value){
            
            if (typeof value === 'object') {

                var side = key;

                var sidePath = '#' + id + ' .card-' + side;

                if (this.type == "") {
                    if(side == 'front') {
                        $(sidePath).removeClass('keyword desc image').addClass('image');
                    } else {
                        $(sidePath).removeClass('keyword desc image').addClass('keyword');
                    }
                } else {
                    $(sidePath).removeClass('keyword desc image').addClass(this.type);
                }

                // Update image path
                var $innerImage = sidePath + ' .inner-image';

                if (this.img == "") {
                     $($innerImage).attr("src", "css/images/editor/image-placeholder.svg");
                } else {
                    $($innerImage).attr("src", this.img);
                }

                // Update card text 
                var $innerText = sidePath + ' .inner-text';

                if (this.txt == "") {
                     $($innerText).text("Add text here.");
                } else {
                    $($innerText).text(this.txt);
                }

            }

        });

        $.each(params.global, function(key, value){
            switch (key) { 
                case 'bleed': 
                    //update global checkbox and image bleeds
                    if (value == 'true') {
                        $('.card-container.image').addClass('image--bleed');
                    } else {
                        $('.card-container.image').removeClass('image--bleed');
                    }
                    break;
                default:
                    console.log('Warning: The ' + ' setting has no effect.');
            }
        });
        
    });
    
}

//--------------------------------------------------------------------
// Get Params
//--------------------------------------------------------------------

function getInitialParams () {

    payload = s9.initialParams;

    updateView();
}

//--------------------------------------------------------------------
// Gte Cards
//--------------------------------------------------------------------
// Initialize all of the editor behavior based on the class names in editor.sample.html
function getCards() {

    //--------------------------------------------------------------------
    // New Flashcard Stuff
    //--------------------------------------------------------------------

    if (document.location.hostname == "localhost" || document.location.hostname == "svn.inkling.com" || document.location.hostname == "10.0.1.4"){
        s9.initialParams = {
            '1.front.type' : 'keyword',
            '1.front.img' : '',
            '1.front.txt' : 'Front text value',
            '1.back.type' : 'desc',
            '1.back.img' : '',
            '1.back.txt' : 'Front text value',
            'global.bleed' : 'true'
        };
    }

    getInitialParams();

    $('.inner-image').setOrientation();

    $('.flip').click(function() {
        $(this).toggleClass('flipped');
    })

}

//--------------------------------------------------------------------
// Set the user agent on the body
//--------------------------------------------------------------------
function setUserAgent() {
    var b = $('html');
    b.attr('data-useragent',  navigator.userAgent);
    b.attr('data-platform', navigator.platform );
}


//--------------------------------------------------------------------
// Init
//--------------------------------------------------------------------

var config =  {},
    payload = {},
    params =  {};
            
(function(init) {


    // The global jQuery object is passed as a parameter
    init(window.jQuery, window, document);

    }(function($, window, document) {

        // The $ is now locally scoped 
        $(function() {

            setUserAgent();

            getCards();

            s9.view.size({
                height: $(document).height()
            });

            FastClick.attach(document.body);
            
            // Dom-ready code goes here.

        });

        
      $(window).resize(function() {
            s9.view.size({
                height: $(document).height()
            });
      });
      // Place rest of your code here.
  }

));