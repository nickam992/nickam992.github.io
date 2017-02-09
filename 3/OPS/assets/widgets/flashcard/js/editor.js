//--------------------------------------------------------------------
// Debounced Resize
//--------------------------------------------------------------------
//https://gist.github.com/Pushplaybang/3341936
(function($,sr){
 
  // debouncing function from John Hann
  // http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
  var debounce = function (func, threshold, execAsap) {
      var timeout;
 
      return function debounced () {
          var obj = this, args = arguments;
          function delayed () {
              if (!execAsap) {
                  func.apply(obj, args);
              }
              timeout = null; 
          }
 
          if (timeout) {
              clearTimeout(timeout);
          } else if (execAsap) {
              func.apply(obj, args);
          }
          timeout = setTimeout(delayed, threshold || 100); 
      };
  };
    // smartresize 
    jQuery.fn[sr] = function(fn){  return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr); };
 
})(jQuery,'smartresize');

//--------------------------------------------------------------------
// Create Text Selection
//--------------------------------------------------------------------
(function( $ ) {

    $.fn.selectText = function(){
        var doc = document, 
            element = this[0],
            range, 
            selection;
        
        if (doc.body.createTextRange) {
            range = document.body.createTextRange();
            range.moveToElementText(element);
            range.select();
        } else if (window.getSelection) {
            selection = window.getSelection();        
            range = document.createRange();
            range.selectNodeContents(element);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    };

}( jQuery ));

//--------------------------------------------------------------------
// Smart Labels for Vertical Buttons
// 
// Right-side labels will point inward when the workspace is too small.
//--------------------------------------------------------------------

(function( $ ) {
    
    // Expose function as a jQuery oject method.
    $.fn.smartLabels = function($container, minWidth, reverse) {

        var $this = $(this);

        $( window ).smartresize(function(){
            if ($container.width() <= minWidth) {
                if(reverse == false) {
                    $this.addClass('labels--left');
                } else {
                    $this.removeClass('labels--left');
                }
            } else {
                if(reverse == false) {
                    $this.removeClass('labels--left');
                } else {
                    $this.addClass('labels--left');
                }
            }
        });

        $(document).ready(function(){
            $(window).trigger('resize');
        });

        return this;
    };

}( jQuery ));

//--------------------------------------------------------------------
// Editable
//--------------------------------------------------------------------
// TODO (Anthony): Abstract this method so it can be used with other elements.

(function( $ ) {
 
    $.fn.editable = function(returnIsEnter, escIsCancel) {

        returnIsEnter = typeof returnIsEnter !== 'undefined' ? returnIsEnter : true;
        escIsCancel = typeof escIsCancel !== 'undefined' ? escIsCancel : true;
        
        // Store the text before editing in case the user cancels their edit.
        var tempText;

        this

            // When the remove button is clicked, remove the list item.
            .on('click', '.btn-remove', function () {
                $(this).parent().fadeOut(300, function() { $(this).remove(); });
            })

            // When the edit button is clicked, make the inner-text editable.
            .on('click', '.btn-edit', function () {
                $(this).siblings( '.inner-text' ).attr('contentEditable',true).focus();

                // Add class for 'edit mode' CSS.
                $(this).parent().addClass( 'editing' );

                // Store the current text in case the user cancels the input (by hitting esc).
                tempText = $(this).siblings( '.inner-text' ).text();
            })

            // Also make inner-text editable when the list item is double-clicked.
            .click(function () {

                var innerTextInput = $(this).children('.inner-text' );

                if(!(innerTextInput.is(":focus"))) {
                    innerTextInput.attr('contentEditable',true).focus().selectText();
                }

                // Add class for 'edit mode' CSS.
                $(this).addClass( 'editing' );

                // Store the current text in case the user cancels the input (by hitting esc).
                tempText = $(this).children( '.inner-text' ).text();
            })

            // Check for special keys hit while in 'edit mode'.
            .on('keydown', '.inner-text', function(e) {  

                // e.preventDefault();
                // $(this).trigger('change');

                // RETURN: Exit edit mode.
                if(e.keyCode === 13 && returnIsEnter === true) {
                    e.preventDefault();
                    $(this)
                        .trigger('change')
                        .attr('contentEditable',false)
                        .parent().removeClass( 'editing' );
                }

                // ESC: Exit edit mode and restore text from before edit.
                if (e.keyCode === 27 && escIsCancel === true) {
                    e.preventDefault();
                    $(this)
                        //.trigger('change') - Don't trigger change if cancelled
                        .attr('contentEditable',false)
                        // Restore the text from before the edit.
                        .text(tempText)
                        .parent().removeClass( 'editing' );
                }
            })

            // Exit edit mode when clicking away (or lose focus).
            .on('blur', '.inner-text', function() {
                $(this).attr('contentEditable',false);
                $(this).parent().removeClass( 'editing' );
            });

        return this;
 
    };
 
}( jQuery ));

//--------------------------------------------------------------------
// Panel Tabs
//--------------------------------------------------------------------
(function( $ ) {
 
    $.fn.panelTabs = function() {
 
        // Initialize jQuery UI Tabs (http://jqueryui.com/tabs/)
        this.tabs();

        // $('.menu-underline').width(70);
        
            
        // When a tab is clicked, move and resize underline to match the active tab.
        // this.find('.panel-tab').click(function() {
        //     $('.menu-underline').width($(this).width()).css({
        //     '-webkit-transform':'translateX('+$(this).position().left+'px)',
        //     '-moz-transform':'translateX('+$(this).position().left+'px)',
        //     'transform':'translateX('+$(this).position().left+'px)' });
        // });

        return this;
 
    };
 
}( jQuery ));

//--------------------------------------------------------------------
// Facny Select Dropdown
//--------------------------------------------------------------------
function fancySelect() {
    
    var fadeOutDur      = 75,
        fadeOutDelay    = 200,
        fadeInDur       = 75;

    // Hide the menu when clicking away from it.
    $('html').click(function() {
        $('.select-menu--faux .select-menu-list').fadeOut(fadeOutDur);
    });

    // Create a faux menu for each <select> with the class '.select-menu'.
    $('.select-menu').each(function() {

        // The faux menu is contained within a wrapping ul.
        // The chid li.selected-value represents the currently selected 
        // value (and is also the click target to active the menu).
        // Once clicked, the list of options is a nested ul whose values are grabbed from
        // the option values of the original <select> tag.
        
        var selectMenuFaux;

        selectMenuFaux = '<ul class="select-menu--faux"><li class="selected-value">select menu</li> <ul class="select-menu-list">';
        
        // Add items to the faux menu for each option in the <select> menu.
        $(this).children('option').each(function() {
            if($(this).is(':selected')) {
                selectMenuFaux += '<li class="select-menu-option option--selected" data-value="' + this.value + '">' + this.text + '</li>';

            } else {
                selectMenuFaux += '<li class="select-menu-option" data-value="' + this.value + '">' + this.text + '</li>';
            }
        });
        
        selectMenuFaux += '</ul></span>';

        // Add the faux menu after the real menu.
        $(this).after(selectMenuFaux);

        // Set the selected value text equal to the actual selected faux menu child.
        $(this).next().children('.selected-value').text($(this).children(':selected').text());

    });


    $('.select-menu--faux').click(function () {
        event.stopPropagation();
    });

    // Fade in menu when selected label is clicked
    $('.selected-value').click(function () {
        $(this).parent().addClass('menu--active');
        $(this).siblings('.select-menu-list').fadeIn(fadeInDur);
    });

    // When menu option is clicked, set both real and faux menus
    $('.select-menu-option').click(function() {

        var $this = $(this),
            selectText = $(this).text(),
            selectedVal = $(this).attr('data-value');

        // Set the selected option in the faux menu
        $this.siblings().removeClass('option--selected');
        $this.addClass('option--selected');
        
        // Change the faux selected text
        $this.parent().siblings('.selected-value').text(selectText);

        // Change the original select box
        $this.parent().parent().prev().val(selectedVal).trigger('change');
        $this.parents('.select-menu--faux').removeClass('menu--active');
        $this.parent('.select-menu-list').delay(fadeOutDelay).fadeOut(fadeOutDur);
    });

    // When select menu is changed, set both real and faux menus
    $('.select-menu').change(function() {
        // Change the faux selected text
        $(this).siblings('.select-menu--faux').children('.selected-value').text($(this).children(':selected').text());

        $(this).siblings('.select-menu--faux').find('.select-menu-option').removeClass('option--selected');
        $(this).siblings('.select-menu--faux').find('[data-value="'+$(this).val()+'"]').addClass('option--selected');
    });

}

//--------------------------------------------------------------------
// Update Param
//--------------------------------------------------------------------
function updatePayload(key, value){

    config = {
        'type': 'configuration', 
        'method': 'set', 
        'payload': '',
    }

    payload[key] = value;

    config.payload = payload;

    window.parent.postMessage(config, '*');
}

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
// Set Image
//--------------------------------------------------------------------
function setImagePath() {
    $.each(params, function(key, value){

        var id = this.id;
        
        // Loop over the sides
        $.each(params.card, function(key, value){

            if (typeof value === 'object') {
                
                var side = key;

                var imgId = id + side;

                 var $loadProgress,
                    sidePath;

                sidePath =  '#' + id + ' .card-' + side;

                $loadProgress = sidePath + ' .load-progress';

                 // Update Button menus
                var $replaceBtn = sidePath + ' .input-replace';
                var $addBtn = sidePath + ' .input-add-image';

                var $card = sidePath + ' .card';

                $($replaceBtn).on('change', function() {

                    var file = $(this)[0].files[0];
            
                    window.parent.postMessage({
                        'type': 'asset', 
                        'method': 'image', 
                        'payload': {
                            'data': file,
                            'id' : imgId,
                            'progress': true
                        }
                    }, '*');

                    $(this).val('');

                    $($card).find('.inner-image').fadeOut(400);

                    $($card).append('<span class="load-container"><span class="load-progress"></span></span>');


                    // updatePayload(txtKey, newTxt);
                    // updateView();

                });

                $($addBtn).on('change', function() {

                    var file = $(this)[0].files[0];
            
                    window.parent.postMessage({
                        'type': 'asset', 
                        'method': 'image', 
                        'payload': {
                            'data': file,
                            'id' : imgId,
                            'progress': true
                        }
                    }, '*');

                    $(this).val('');

                    $($card).find('.inner-image').fadeOut(400);
                    $($card).find('.inner-add-image').fadeOut(400);

                    $($card).append('<span class="load-container"><span class="load-progress"></span></span>');


                    // updatePayload(txtKey, newTxt);
                    // updateView();

                });

                window.addEventListener('message', function(evt){ 

                    if (evt.data.type == 'asset' && evt.data.method == 'image' &&  evt.data.payload.id == imgId ){


                        
                        var payload = evt.data.payload; 

                        if (payload.progress === 1){ 
                            if (payload.path){ 

                                var idNum = id.replace('card-',''),
                                    imgKey = idNum + '.' + side + '.img',
                                    newPath = payload.path;

                                updatePayload(imgKey, newPath);

                                updateView();

                                 $($card).find('.inner-image').hide();

                                $($loadProgress).width('100%');

                                $($card).find('.inner-image').load(function() {
                                    $($card).find('.load-container')
                                    // .delay(1500)
                                    .fadeOut(400)
                                    .queue(function(next) {
                                          $(this).remove();
                                          $($card).find('.inner-image').fadeIn(400).attr('style', '');
                                          next();
                                      });

                                });

                            } else { 
                                // Upload failed 
                            } 
                        } else { 

                            var loadPercent = payload.progress * 100;

                            $($loadProgress).delay(1500).width(loadPercent + '%');

                        } 
                    } 
                });
            }

        });

    });
}

//--------------------------------------------------------------------
// Set ediable text
//--------------------------------------------------------------------

function setEditableText() {
    $.each(params, function(key, value){

        var id = this.id;
        
        // Loop over the sides
        $.each(params.card, function(key, value){

            if (typeof value === 'object') {
                
                var side = key;

                var sidePath = '#' + id + ' .card-' + side;

                 // Update Select menus
                var $card = sidePath + ' .card';

                $($card).editable();

                // Yes, keyup can be bad. But in this instance it's quite useful.
                $($card).on('keyup', '.inner-text', function() {

                    var idNum = id.replace('card-',''),
                        txtKey = idNum + '.' + side + '.txt',
                        newTxt = $(this).text();

                    updatePayload(txtKey, newTxt);
                    //updateView();

                });
            }

        });

    });
}

//--------------------------------------------------------------------
// Select Menu Change
//--------------------------------------------------------------------

function setCardType() {

    $.each(params, function(key, value){

        var id = this.id;

        // Loop over the sides
        $.each(params.card, function(key, value){
            
            if (typeof value === 'object') {
                var side = key;

                var sidePath = '#' + id + ' .card-' + side;

                // Update Select menus
                var $selectMenu = sidePath + ' .select-menu';


                $($selectMenu).change(function() {

                    var idNum = id.replace('card-',''),
                        typeKey = idNum + '.' + side + '.type',
                        newVal = $(this).val();

                    updatePayload(typeKey, newVal);

                    updateView();

                });


            }

        });
        
    });
}

//--------------------------------------------------------------------
// Settings Menu Globals
//--------------------------------------------------------------------
function setGlobals() {
    $('#global-bleed').change(function() {

        var $this = $(this),
            globalKey = 'global.bleed',
            globalVal;

        if($this.is(':checked')) {
            globalVal = 'true';
        } else {
            globalVal = 'false';
        }
        
        updatePayload(globalKey, globalVal);

        updateView();
    });
}

//--------------------------------------------------------------------
// Update Cards and Menus
//--------------------------------------------------------------------
function updateView () {

    // update both the select menu and the card and any globals

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
            card = 'card-' + id;

            if(!params.card[side]) {
                params.card[side] = {};
            }

            params.card.id = 'card-' + id;
            params.card[side][param] = value;
        }

    });

    //console.log(params);
    
    $.each(params, function(key, value){

        var id = this.id;

        // TODO[Anthony]: Add code here for multple flashcards.

        // Loop over the sides
        $.each(params.card, function(key, value){
            
            if (typeof value === 'object') {

                var side = key;

                var sidePath = $selectMenu = '#' + id + ' .card-' + side;

                // Update Select menus
                var $selectMenu = sidePath + ' .select-menu';

                $($selectMenu).val(this.type);

                if (this.type == '') {
                    if(side == 'front') {
                         $($selectMenu).val('image');
                    } else {
                         $($selectMenu).val('keyword');
                    }
                } else {
                     $($selectMenu).val(this.type);
                }

                

                // Update card class
                var $cardContainer = sidePath + ' .card-container';

                if (this.type == '') {
                    if(side == 'front') {
                        $($cardContainer).removeClass('keyword desc image add-image--large').addClass('image');
                    } else {
                        $($cardContainer).removeClass('keyword desc image add-image--large').addClass('keyword');
                    }
                } else {
                    $($cardContainer).removeClass('keyword desc image add-image--large').addClass(this.type);
                }

                // Update image path
                var $innerImage = sidePath + ' .inner-image';

                if (this.img == '') {
                    console.log(this.img);
                    console.log('no img val');
                    $($cardContainer).addClass('add-image--large');
                    $($innerImage).attr('src', 'css/images/editor/image-placeholder.svg');
                } else {
                    $($cardContainer).removeClass('add-image--large');
                    $($innerImage).attr('src', this.img);
                }

               
                // Update card text 
                var $innerText = sidePath + ' .inner-text';

                if (this.txt == '') {
                     $($innerText).text('Add text here.');
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
                        $('#global-bleed').prop('checked', true);
                        $('.card-container.image').addClass('image--bleed');
                    } else {
                        $('#global-bleed').prop('checked', false);
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

    $('.select-menu').trigger('change');

}

//--------------------------------------------------------------------
// Sample Initializer
//--------------------------------------------------------------------
// Initialize all of the editor behavior based on the class names in editor.sample.html
function editorInit() {

    fancySelect();

    // Smart Labels
    $('.button-menu.vert-right').smartLabels($('.workspace'), 960, false);

    $('.button-menu.vert-left').smartLabels($('.workspace'), 960, true);

    //--------------------------------------------------------------------
    // New Flashcard Stuff
    //--------------------------------------------------------------------

    if (document.location.hostname == 'localhost' || document.location.hostname == 'svn.inkling.com' || document.location.hostname == "10.0.1.4"){
        s9.initialParams = {
            '1.front.type' : '',
            '1.front.img' : '',
            '1.front.txt' : '',
            '1.back.type' : '',
            '1.back.img' : '',
            '1.back.txt' : '',
            'global.bleed' : 'true'
        };
    }

    $('.panel').panelTabs();

    getInitialParams();

    $('.inner-image').setOrientation();

    setCardType();

    setEditableText();

    setImagePath();

    setGlobals();

    console.log(params);

    

}
var config =  {},
    payload = {},
    params =  {};
            
(function(init) {


    // The global jQuery object is passed as a parameter
    init(window.jQuery, window, document);

    }(function($, window, document) {

        // The $ is now locally scoped 
        $(function() {

            editorInit();
            
            // Dom-ready code goes here.

        });

      // Place rest of your code here.
  }

));