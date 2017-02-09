/*global $, s9:false */
// var fs = require('fs');

$(function() {

    // var params = {};
    // window.location.search.replace(/([^?=&]+)(=([^&]*))?/g, function($0, $1, $2, $3) {
    //     var key = $1;
    //     var value = decodeURIComponent($3);
    //     params[key] = value;
    // });

    var params = s9.initialParams;

    /*
default specs:
    first slide is title    
*/

    var slideInfo = {};
    var tags = {};
    var slides = 1;
    var titleSlide = s9.initialParams.titleSlide;
    var $currentSelect;

    function init() {
        var date = $.parseJSON(params.date);
        for (var i in date) {
            slideInfo[(parseInt(i) + 1)] = date[i];
            addSlide();
            if (date[i].tag.length > 0) {
                if (!tags.hasOwnProperty(date[i].tag)) {
                    tags[date[i].tag] = [parseInt(i) + 1];
                } else {
                    tags[date[i].tag].push(parseInt(i) + 1);
                }
            }
        }
        $('.btn-select:first-child').addClass('ui-selected');
        $currentSelect = $('.btn-select:first-child');
        loadSlide(1);
    }

    init();
    // local variable to store state
    var imgSrc = '';
    if (Object.keys(slideInfo).length === 0) {
        addSlide();
        slideInfo['1'] = {
            'startDate': '',
            'endDate': '',
            'headline': '',
            'text': '',
            'asset': {
                'media': '',
                'credit': '',
                'caption': ''
            }
        };
    }
    //--------------------------------------------------------------------------//
    //----------------------------Binding and setup ----------------------------//
    //--------------------------------------------------------------------------//

    $('.btn-select').each(function() {
        $(this).find('span').html(slideInfo[slides].headline);
        $(this).attr('number', slides++);
    });

    $('.menu-list').delegate('.btn-select', 'click', function(e) {
        $('.ui-selected').removeClass('ui-selected');
        $(this).addClass('ui-selected');
        if (!e.toElement.classList.contains('delete-slide')) {
            var j = $('.ui-selected').attr('number');
            loadSlide(j);
            $currentSelect = $(this);
            sendData();
        } else { //delete slide
            deleteSlide($(e.toElement).parent());
        }
    });

    //textarea height management
    $('textarea').each(function() {
        $(this).css('height', $(this)[0].scrollHeight + 2 + 'px');
    });

    //update slideinfo
    $('textarea, input').focusout(function() {
        if ($(this).hasClass('date') && /[a-zA-Z]/.test($(this).val())) {
          alert('Dates only use numeric characters!');
        }
        sortByDate();
        sendData();
    });

    $('textarea, input').on('input', function() {
        sendData();
    });

    $('#headline').on('input', function() {
        $('.ui-selected span').html($('#headline').val() ? $('#headline').val() : 'Headline');
    });

    //TEXTAREA height management
    $('textarea').on('input', function(e) {
        $(this).css('height', 'auto');
        $(this).css('height', $(this)[0].scrollHeight + 2 + 'px');
    });

    $('#titleSlide').on('change', function() {
        if (this.checked) {
            titleSlide = $('.ui-selected').attr('number');
        } else {
            titleSlide = 1; //default to first as titleslide
        }
        sendData();
    });

    $('#addButton').click(function() {
        addSlide();
        slideInfo[slides] = {
            'startDate': '',
            'endDate': '',
            'headline': '',
            'text': '',
            'tag': '',
            'asset': {
                'media': '',
                'credit': '',
                'caption': ''
            }
        };
        slides++;
    });

    //----------------------------------------------------------------------------//
    //-------------------------Communication with Habitat-------------------------//
    //----------------------------------------------------------------------------//

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
                    $('textarea').css('height', 'auto');
                    $('textarea').css('height', $(this)[0].scrollHeight + 2 + 'px');
                    slideInfo[$('.ui-selected').attr('number')].asset = {
                        'media': payload.path,
                        'credit': '',
                        'caption': ''
                    };
                }
                sendData();
            } else {
                var loadPercent = payload.progress * 100;
                $('.load-progress').width(loadPercent + '%');
            }
        }
    });

    function sendData() {
        slideInfo[$('.ui-selected').attr('number')] = getChoices();
        var date = [];
        for (var i in slideInfo) {
            date.push(slideInfo[i]);
        }
        if (slideInfo[titleSlide].text.length === 0) {
            alert('Title slide requires description!');
        }
        window.parent.postMessage({
            'type': 'configuration',
            'method': 'set',
            'payload': {
                date: JSON.stringify(date),
                titleSlide: titleSlide
            }
        }, '*');
    }


    function getChoices() {
        var startDate = [$('#startDate .inputYear').val(),
            $('#startDate .inputMonth').val(),
            $('#startDate .inputDay').val(),
            $('#startDate .inputTime').val().replace(/:\s*/g, ",")
        ].join();
        var endDate = [$('#endDate .inputYear').val(),
            $('#endDate .inputMonth').val(),
            $('#endDate .inputDay').val(),
            $('#endDate .inputTime').val().replace(/:\s*/g, ",")
        ].join();
        if (endDate.length <= 5) {
            endDate = '';
        }
        var headline = $('#headline').val();
        var text = $('#description').val();
        var tag = $('#categories textarea').val();
        var selected = slideInfo[$('.ui-selected').attr('number')];

        var media = selected.asset.media;
        var mediaCaption = selected.asset.media.length > 0 ? $('.imageCaption').val() : '';
        var imageCredit = selected.asset.media.length > 0 ? $('.imageCredit').val() : '';

        return {
            'startDate': startDate,
            'endDate': endDate,
            'headline': headline,
            'text': text,
            'tag': tag,
            'asset': {
                'media': media,
                'caption': mediaCaption,
                'credit': imageCredit
            }
        };
    }

    //------------------------------------------------------------------------------//
    //-------------------------------Slide Management -----------------------------//
    //----------------------------------------------------------------------------//

    function addSlide() {
        var li = document.createElement('li');
        li.className = 'btn-select';
        li.setAttribute('number', slides);
        li.innerHTML = '<span>Headline</span> <div class="delete-slide"></div>';
        $('#panelSlides').append(li);
    }

    function reorder() {
        var i = 1;
        var elemHeight = $('.btn-select:first-child').outerHeight(true);
        //sort elements first
        var list = $('.menu-list');
        var listItems = list.find('li').sort(function(a, b) {
            return $(a).attr('number') - $(b).attr('number');
        });
        list.find('li').remove();
        list.append(listItems);
        $('.btn-select').each(function() {
            var j = $(this).attr('number');
            slideInfo[i] = slideInfo[j];
            if (slideInfo[i].tag.length > 0) {
                tags[slideInfo[i].tag].splice(tags[slideInfo[i].tag].indexOf(j), 1, i);
            }
            if (titleSlide == $(this).attr('number')) {
                titleSlide = i;
            }
            $(this).attr('number', i++);
        });
    }

    function deleteSlide(slide) {
        var animateTime = 500;
        $('.btn-select').each(function() {
            if ($(this).attr('number') > slide.attr('number')) {
                $(this).animate({
                    "top": '-=' + $(slide).outerHeight(true)
                }, animateTime);
            }
        });
        $('.btn-select').promise().done(function() {
            if (slides > 2) {
                var tag = slideInfo[slide.attr('number')].tag;
                if (tag.length > 0) {
                    tags[tag].splice(tags[tag].indexOf(parseInt(slide.attr('number'))), 1);
                }
                slide.remove();
                reorder();
                $('#categories textarea').val('');
                delete slideInfo[--slides];
                $('.btn-select:first-child').addClass('ui-selected');
                $currentSelect = $('.ui-selected');
                $(".btn-select").css("top", "0px");
                loadSlide(1);
            } else {
                window.alert('You need at least one slide!');
            }
        });
        sendData();
    }


    function swapEntries(i, j) {
        if (slideInfo[i].tag.length > 0) {
            tags[slideInfo[i].tag].splice(tags[slideInfo[i].tag].indexOf(i), 1, j);
        }
        if (slideInfo[j].tag.length > 0) {
            tags[slideInfo[j].tag].splice(tags[slideInfo[j].tag].indexOf(j), 1, i);
        }
        var temp = slideInfo[i];
        slideInfo[i] = slideInfo[j];
        slideInfo[j] = temp;
        var swap2 = $('.btn-select[number=' + j + ']');
        var swap1 = $('.btn-select[number=' + i + ']');
        swap2.attr('number', i);
        swap1.attr('number', j);
        if (i == titleSlide) {
            titleSlide = j;
        } else if (j == titleSlide) {
            titleSlide = i;
        }
        return swap2.outerHeight(true);
    }

    function sortByDate() {
        var wantToSelect = $('.ui-selected').attr('number');
        var curSlide = parseInt($currentSelect.attr('number')); //this one will change
        var curSlideCopy = curSlide; //this one will not- remember initial state
        var startDate = slideInfo[curSlide].startDate;
        var date = new Date(startDate);
        var temp, swap2;
        var moveHeight = 0;
        var swap1 = $('.btn-select[number=' + curSlide + ']');
        //bubble sort
        if (curSlide > 1 && date < new Date(slideInfo[curSlide - 1].startDate)) {
            while (curSlide > 1 && date < new Date(slideInfo[curSlide - 1].startDate)) {
                // swapEntries(curSlide, curSlide-1);
                // swap1 = $('.btn-select[number=' + curSlide + ']');
                // swap2 = $('.btn-select[number=' + (curSlide - 1) + ']'); //higher
                moveHeight += swapEntries(curSlide, curSlide - 1);
                curSlide--;
            }
            swap1.animate({
                "top": '-=' + moveHeight
            }, 500);
            $('.btn-select').each(function() {
                if ($(this).attr('number') <= curSlide || $(this).attr('number') > curSlideCopy) {
                    return;
                }
                $(this).animate({
                    "top": '+=' + swap1.outerHeight(true)
                }, 500);
            });
        } else if (curSlide < Object.keys(slideInfo).length && date > new Date(slideInfo[curSlide + 1].startDate)) {
            while (curSlide < Object.keys(slideInfo).length && date > new Date(slideInfo[curSlide + 1].startDate)) {
                moveHeight += swapEntries(curSlide, curSlide + 1);
                curSlide++;
            }
            swap1.animate({
                "top": '+=' + moveHeight
            }, 500);
            $('.btn-select').each(function() {
                if ($(this).attr('number') >= curSlide || $(this).attr('number') < curSlideCopy) {
                    return;
                }
                $(this).animate({
                    "top": '-=' + swap1.outerHeight(true)
                }, 500);
            });
        }
        $('.btn-select').promise().done(function() {
            var list = $('.menu-list');
            var listItems = list.find('li').sort(function(a, b) {
                return $(a).attr('number') - $(b).attr('number');
            });
            list.find('li').remove();
            list.append(listItems);
            $('.btn-select').css('top', '0px');
        });
    }


    function loadSlide(i) {
        //update taglist when navigating away from current slide
        $('.tag').remove();
        var curTag = $('#categories textarea').val();
        var j = parseInt($currentSelect.attr('number'));
        if (curTag.length > 0) {
            if (!tags.hasOwnProperty(curTag)) {
                tags[curTag] = [j];
            } else if ($.inArray(j, tags[curTag]) === -1) {
                tags[curTag].push(j);
            }
        }
        var info = slideInfo[i];
        var startDate = info.startDate ? info.startDate.split(',') : '';
        var endDate = info.endDate ? info.endDate.split(',') : '';
        $('#startDate .inputYear').val(startDate[0]);
        $('#startDate .inputMonth').val(startDate[1]);
        $('#startDate .inputDay').val(startDate[2]);
        var startTime = [startDate[3], startDate[4], startDate[5]].join(':');
        if (startTime.length < 3) {
            $('#startDate .inputTime').val('');
        } else {
            $('#startDate .inputTime').val(startTime);
        }
        $('#endDate .inputYear').val(endDate[0]);
        $('#endDate .inputMonth').val(endDate[1]);
        $('#endDate .inputDay').val(endDate[2]);
        var endTime = [endDate[3], endDate[4], endDate[5]].join(':');
        if (endTime.length < 3) {
            $('#endDate .inputTime').val('');
        } else {
            $('#endDate .inputTime').val(endTime);
        }
        $('#headline').val(info.headline);
        $('#description').val(info.text);
        $('#categories textarea').val(info.tag);
        if (info.asset !== undefined && info.asset.media.length > 1) {
            var src = info.asset.media;
            $('#imageGroup').css('display', 'inline');
            var img = document.createElement('img');
            img.src = src;
            img.id = 'imageContainer';
            $('.image').html(img);
            $('.imageEditor').addClass('disabled');
            $('.imageEditor').removeClass('enabled');
            document.getElementById('imagePicker').disabled = true;
            $('.imageEditor').removeAttr('name');
            bindSwapbutton();
            bindTrashButton();
        } else {
            $('#imageGroup').css('display', 'none');
            $('#imageContainer')[0].src = '';
            document.getElementById('imagePicker').disabled = false;
            imgSrc = '';
        }
        if (i == titleSlide) {
            $('#titleSlide').prop('checked', true);
        } else {
            $('#titleSlide').prop('checked', false);
        }
        for (var t in tags) {
            $('#categories').append('<div class="tag"><span>' + t + '</span> <div class="deleteTag"></div></div>');
        }

    }



    function alert(message) {
        var $overlay = $('.overlay-mask');
        var $dialog = $('.dialog-box');
        $dialog.show();
        $overlay.addClass('overlay-mask-visible');
        var $confirm = $('.confirmDelete');
        var $cancel = $('.cancelDelete');
        $('.dialogText h4').html(message);

        $confirm.on('click', function() {
            $(this).off('click');
            $('.confirmation').hide();
            $('.overlay-mask').removeClass('overlay-mask-visible');
        });
        $cancel.on('click', function() {
            $confirm.off('click');
            $('.confirmation').hide();
            $overlay.removeClass('overlay-mask-visible');
        });
    }

    //------------------------------------------------------------------------------//
    //-------------Category/tag Management------------------------------------------//
    //------------------------------------------------------------------------------//

    $('#categories').delegate('.deleteTag', 'click', function(e) {
        e.stopImmediatePropagation();
        deleteCategory($(this).siblings().html());
        $(this).parent().remove();
    });

    function deleteCategory(category) {
        var catList = tags[category];
        for (var i in catList) {
            slideInfo[parseInt(catList[i])].tag = '';
        }
        delete tags[category];
        if (category == $('#categories textarea').val()) {
            $('#categories textarea').val('');
        }
        sendData();
    }

    $('#categories').delegate('.tag', 'click', function() {
        $('#categories textarea').val($(this).find('span').html());
        sendData();
    });

    //--------------------------------------------------------------------------//
    //-------------Image Management--------------------------------------------//
    //------------------------------------------------------------------------//

    function bindTrashButton() {
        $('.btn-delete').click(function() {
            $('#imageGroup').fadeOut(150, function() {
                $('#imageGroup').css('display', 'none');
                $('#imageContainer')[0].src = '';
            });
            document.getElementById('imagePicker').disabled = false;
            slideInfo[$('.ui-selected').attr('number')].asset = {
                'media': '',
                'credit': '',
                'caption': ''
            };
            sendData();
        });
    }


    function bindSwapbutton() {
        $('#swapButton').change(function() {
            var file = document.getElementById('swapButton').files[0];
            if (file) {
                $('#imageContainer').fadeOut(400);
                $('.image').append('<span class="load-container"><span class="load-progress"></span></span>');
                $('textarea').each(function() {
                    $(this).css('height', $(this)[0].scrollHeight + 2 + 'px');
                });
                window.parent.postMessage({
                    'type': 'asset',
                    'method': 'image',
                    'payload': {
                        'data': document.getElementById('swapButton').files[0],
                        'progress': true
                    }
                }, '*');
            }
        });
    }

    $('#imagePicker').change(function() {
        var file = document.getElementById('imagePicker').files[0];
        if (file) {

            $('#imageGroup').css('display', 'inline');
            $('.imageEditor').addClass('disabled');
            $('.imageEditor').removeClass('enabled');
            document.getElementById('imagePicker').disabled = true;
            $('.imageEditor').removeAttr('name');
            $('.image').append('<span class="load-container"><span class="load-progress"></span></span>');
            window.parent.postMessage({
                'type': 'asset',
                'method': 'image',
                'payload': {
                    'data': document.getElementById('imagePicker').files[0],
                    'progress': true
                }
            }, '*');
        }
        //allows double selection after deletion
        $(this).val('');
        bindTrashButton();
        bindSwapbutton();
    });


});
