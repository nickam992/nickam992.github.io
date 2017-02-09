$(document).ready(function() {
    //for testing-------

    global.enumerations = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    global.numAnswers = 0;

    var params = {};
    window.location.search.replace(/([^?=&]+)(=([^&]*))?/g, function($0, $1, $2, $3) {
        var key = $1;
        var value = decodeURIComponent($3);
        params[key] = value;
    });
    // var params = s9.initialParams;
    var answers = $.parseJSON(params.answers);
    var src = params.imgSrc;

    function init() {
        //eventually hope to put this inside another for loop for multiple questions
        for (var i = 0; i < answers.length; i++) {
            var answerInfo = {
                answerData: [{
                    number: (i + 1),
                    enumeration: global.enumerations[i],
                    answer: answers[i].answer,
                    optionalText: answers[i].optionalText
                }]
            };
            // answerInfo.answerData.answer;
            var answerTemplate = $('.answer').html();
            var answerTag = Handlebars.compile(answerTemplate);
            $('.answer_set').append(answerTag(answerInfo));
            global.numAnswers++;

            $('.answer' + (i + 1)).data('number', i + 1);
        }
        $('#question textarea').val(params.question);
        $('#question .promptText')[0].innerHTML = "Hint";
        $('.answer_set .promptText').each(function() {
            $(this).html("Not Quite");
            $(this).addClass("incorrect");
        });

        $('#question .optionalText').val(params.hint);

        if (params.correct) {
            var $correct = $('.' + params.correct);
            $('.' + params.correct + ' .switch input').attr('checked', 'true');
            $correct.find('.promptText').html("That's Correct!");
            $correct.find('.promptText').removeClass('incorrect');
            $correct.find('.promptText').addClass('correct');

        }
        if (params.shuffle === "true") {
            $('.panel .checkbox input').attr('checked', 'true');
        }

        $('textarea').each(function() {
            $(this).css('height', $(this)[0].scrollHeight + 2 + 'px');
        });


        $('input, textarea').on('input', function(e) {
            $(this).css('height', 'auto');
            $(this).css('height', $(this)[0].scrollHeight + 2 + 'px');
            sendData();
        });
        $('#addButton').click(function(e) {
            e.stopPropagation();
            addChoice();
        });
        $('.panel .checkbox').click(function() {
            sendData();
        });

        $('.sortable').on("sortupdate", function() {
            var order = [];
            var i = 0;
            $('.answer_set .btnEdit').each(function() {
                $(this).data('number', ++i);
            });
            var j = 0;
            $('.answer_set .btnEdit .enumeration').each(function(e) {
                $(this).text(global.enumerations[j++]);
            });
            sendData();
        });

        if (src) {
            $('#imageGroup').css('display', 'inline');
            var img = document.createElement('img');
            img.src = src;
            img.id = "imageContainer";
            $('.image').html(img);
            $('.imageEditor').addClass('disabled');
            $('.imageEditor').removeClass('enabled');
            document.getElementById('imagePicker').disabled = true;
            $('.imageEditor').removeAttr("name");
            bindSwapbutton();
            bindTrashButton();
        }

        $('.answer_set').delegate('.btn-trash', 'click', function() {
            $(this).parent().remove();
            global.numAnswers--;
            if (global.numAnswers < 8) {
                $('#addButton').css('display','inline-block');
            }
            reorder();
            sendData();
        });
        bindChecks();
        addTrash();
    }

    function reorder() {
        var order = [];
        var i = 0;
        $('.answer_set .btnEdit .enumeration').each(function(e) {
            $(this).text(global.enumerations[i++]);
        });
        var j = 0;
        //remove answer class from each button and ensure new one is in order
        $('.answer_set .btnEdit').each(function() {
            $that = $(this);
            $.each($(this)[0].classList, function(index, c) {
                if (c.indexOf('answer') > -1) {
                    $that.removeClass(c);
                }
            });
            $(this).addClass('answer' + (j + 1));
            $(this).data('number', ++j);
        });
    }

    function addTrash() {
        $('.answerBlock').hover(function() {
                $(this).find('.btn-trash').stop(true, true).fadeIn(100);
            },
            function(e) {
                $(this).find('.btn-trash').fadeOut(1000);
            });
    }


    /*
   Bind behavior to checks and prompt text
   */

    function bindChecks() {
        $('.answer_set').delegate('.check', 'click', function() {
            var $that = $(this);
            if ($(this).parents('.btnEdit').find('input.check:checked').length !== 0) {
                $(this).parents('.btnEdit').find('.promptText').removeClass('incorrect');
                $(this).parents('.btnEdit').find('.promptText').addClass('correct');
                $(this).parents('.btnEdit').find('.promptText').html("That's Correct!");
            } else {
                $(this).parents('.btnEdit').find('.promptText').addClass('incorrect');
                $(this).parents('.btnEdit').find('.promptText').removeClass('correct');
                $(this).parents('.btnEdit').find('.promptText').html("Not Quite");
            }
            $(".btnEdit input:checkbox:checked").each(function() {
                if ($(this)[0] !== $that[0]) {
                    $(this).attr('checked', false);
                    $(this).parents('.btnEdit').find('.promptText').removeClass('correct');
                    $(this).parents('.btnEdit').find('.promptText').addClass('incorrect');
                    $(this).parents('.btnEdit').find('.promptText').html('Not Quite');
                    return false; //only 1
                }
            });
            if ($('.btnEdit input:checkbox:checked').length === 0) {
                alert('You must select one correct answer!');
            }
            sendData();
        });
    }

    function getChoices() {
        var answer;
        var answers = [];
        var i = 1;
        $('.answerBlock').each(function() {
            answer = $(this).find('.answerInput').val();
            optionalText = $(this).find('.optionalText').val();
            answers.push({
                answer: answer,
                optionalText: optionalText
            });
            i++;
        });
        var correct = 'answer' + $('.btnEdit input:checkbox:checked').parents('.btnEdit').data('number');
        return {
            "question": $('#question .answerInput').val(),
            "answers": JSON.stringify(answers),
            "title": params.title,
            "hint": $('#question .optionalText').val(),
            "correct": correct,
            "shuffle": $('.panel input:checkbox:checked').length === 1,
            "imgSrc": imgSrc ? (imgSrc) : ""
        };
    }



    function addChoice() {
        var answerTemplate = $('.answer').html();
        var answerTag = Handlebars.compile(answerTemplate);
        var answerInfo = {
            answerData: [{
                number: global.numAnswers + 1,
                enumeration: global.enumerations[global.numAnswers],
                answer: ""
            }]
        };
        var newElem = answerTag(answerInfo);
        $('.answer_set').append(newElem);
        $('.sortable').sortable('refresh');
        $('.answer' + (global.numAnswers + 1) + ' .promptText').html("Not Quite");
        $('.answer' + (global.numAnswers + 1) + ' .promptText').addClass("incorrect");

        addTrash();
        $('.answer' + (global.numAnswers + 1)).data('number', global.numAnswers + 1);
        $('input, textarea').on('input', function(e) {
            $(this).css('height', 'auto');
            $(this).css('height', $(this)[0].scrollHeight + 2 + 'px');
        });
        global.numAnswers++;
        sendData();
        if (global.numAnswers >=8) {
            $('#addButton').css('display','none');
        }
    }

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

    function sendData() {
        window.parent.postMessage({
            "type": "configuration",
            "method": "set",
            "payload": getChoices()
        }, "*");
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

    /*--------------------------
    Main
    ---------------------------*/
    init();

    var imgSrc = src;

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

    $('#imagePicker').change(function() {
        var file = document.getElementById('imagePicker').files[0];
        if (file) {

            $('#imageGroup').css('display', 'inline');
            $('.imageEditor').addClass('disabled');
            $('.imageEditor').removeClass('enabled');
            document.getElementById('imagePicker').disabled = true;
            $('.imageEditor').removeAttr("name");

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



});
