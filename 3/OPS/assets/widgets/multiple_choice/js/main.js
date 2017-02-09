/*global $, s9, Handlebars:false */
$(document).ready(function() {
    var enumerations = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

    var params = s9.initialParams;
    var imgSrc = s9.initialParams.imgSrc;

    var answers = $.parseJSON(params.answers);

    if (params.shuffle === 'true') {
        params = shuffle(params);
        answers = params.answers;
    } else {
        answers = $.parseJSON(params.answers);
    }
    // Populate the unordered set with the given answers.
    for (var i = 1; i <= answers.length; i++) {
        var answerInfo = {
            answerData: [{
                number: i,
                enumeration: enumerations[i - 1],
                answer: answers[i - 1].answer
            }]
        };
        var answerTemplate = $('.answer').html();
        var answerTag = Handlebars.compile(answerTemplate);
        $('.answer_set').append(answerTag(answerInfo));
        $('.answer' + i).data('optionalText', answers[i - 1].optionalText);
    }
    if (imgSrc) {
        $('<img />').load(function() {
            s9.view.size(
                {height: $('.widget_container').height()}
                );
        }).attr('src', imgSrc).appendTo('#answerImg');
    }

    // Include an offset to account for bottom border.
    var offset = 5;
    var hintHeight = $('.feedback_hint').outerHeight(true);
    var correctHeight = $('.feedback_correct').outerHeight(true);
    var incorrectHeight = $('.feedback_incorrect').outerHeight(true);
    var startSize = $('.widget_container').outerHeight(true);

    // Initialize the widget to its starting state.

    function init() {
        var startSize = $('.widget_container').outerHeight(true);
        if (params.shuffle === 'true') {
            $('.answer_set').empty();
            params = shuffle(params);
            answers = params.answers;
            // console.log(params);
            for (var i = 1; i <= answers.length; i++) {
                var answerInfo = {
                    answerData: [{
                        number: i,
                        enumeration: enumerations[i - 1],
                        answer: answers[i - 1].answer
                    }]
                };
                var answerTemplate = $('.answer').html();
                var answerTag = Handlebars.compile(answerTemplate);
                $('.answer_set').append(answerTag(answerInfo));
                $('.answer' + i).data('optionalText', answers[i - 1].optionalText);
            }
        }

        if (s9.initialParams.hint.length === 0) {
            $('.show_hint').css('display', 'none');
        }

        $('.' + params['correct']).addClass('correct_answer');
        // $('.question_stem span').html(params['title']);
        $('.question_stem span').html('');
        $('.question_stem p').html(params['question']);
        $('.feedback_hint p').html(params["hint"]);
        $('.feedback').animate({
            height: 0
        }, {
            complete: function() {
                $('.feedback_text').hide();
                $('.answer').removeClass('correct incorrect user_select disabled');
                $('.answer_button').removeClass('reset try_again active').html('Check Answer');
                $('.answer_button').addClass('disabled');
                $('.help').removeClass('disabled');
                s9.view.size({
                    height: startSize + offset
                });
            },
            progress: function(animation, progress, remaining) {
                s9.view.size({
                    height: $('.widget_container').height() + offset
                });
            }
        });
    }


    function shuffle(params) {
        var currentIndex = answers.length,
            temp,
            randomIndex;
        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            if (('answer' + (currentIndex) == params.correct)) {
                params.correct = 'answer' + (randomIndex + 1);
            } else if ('answer' + (randomIndex + 1) == params.correct) {
                params.correct = 'answer' + (currentIndex);
            }
            currentIndex -= 1;

            temp = answers[currentIndex];
            answers[currentIndex] = answers[randomIndex];
            answers[randomIndex] = temp;
        }
        params.answers = answers;
        return params;
    }


    // Handles the UI logic when a user clicks an enabled show hint.
    var hintSelector = '.show_hint';

    function hintClicked() {
        $('.feedback_incorrect').hide();
        $('.feedback_hint').show();
        var startSize = $('.widget_container').outerHeight(true);
        $('.feedback').animate({
            height: hintHeight
        });
        s9.view.size({
            height: startSize + hintHeight + offset
        });
    }

    $(hintSelector).bind("click touch", function() {
        var hintElem = $(this);
        if (!hintElem.hasClass('disabled')) {
            hintElem.addClass('disabled');
            if (s9.initialParams.hint.length > 0) {
                hintClicked();
            }
        }
    });

    // Handles the UI logic when a user clicks an enabled show answer.
    var showAnswerSelector = '.show_answer';

    function showAnswerClicked() {
        $('.show_hint').addClass('disabled');
        $('.answer').addClass('disabled');
        $('.feedback_text').hide();
        $('.feedback_correct p').html($('.correct_answer').data('optionalText'));
        $('.feedback_correct').show();
        $('.correct_answer').addClass('correct');
        $('.answer_button').html('Reset Question').addClass('reset');
        $('.help').addClass('disabled');
        $('.answer_button').removeClass('disabled');
        var correctHeight = $('.feedback_correct').outerHeight(true);
        var startSize = $('.widget_container').outerHeight(true);
         $('.feedback').animate({
                height: correctHeight
            }, {
                duration: 300,
                progress: function() {
                    s9.view.size({
                        height: startSize + $('.feedback').outerHeight(true) + offset
                    });
                }
            });
    }

    $('.help_buttons').delegate(showAnswerSelector, 'click touch', function() {
        var showAnswerElem = $(this);
        if (!showAnswerElem.hasClass('disabled')) {
            showAnswerElem.addClass('disabled');
            showAnswerClicked();
        }
    });


    // Handles the UI logic when a user selects an answer radio.
    var answerRadioGroupSelector = '.answer';

    function answerRadioClicked() {
        $(answerRadioGroupSelector).removeClass('user_select');
        $('.answer_button').addClass('active').removeClass('disabled');
    }

    $('.answer_set').delegate(answerRadioGroupSelector, 'click touch', function() {
        var answerElem = $(this);
        if (!answerElem.hasClass('disabled')) {
            answerRadioClicked();
            answerElem.addClass('user_select');
        }
    });

    // Main verification logic of the multiple choice widget.
    var submitAnswerSelector = '.answer_button';

    function checkAnswer() {
        var optionalText = $('.user_select').data('optionalText');
        var startSize = $('.widget_container').outerHeight(true);
        if ($('.user_select').hasClass('correct_answer')) {
            $('.user_select').addClass('correct');
            $('.feedback_text').hide();
            $('.feedback_correct').show();
            $('.help').addClass('disabled');
            $('.answer_button').html('Reset Question').addClass('reset');
            $('.answer').addClass('disabled');
            $('.feedback_correct p').html(optionalText);
            var correctHeight = $('.feedback_correct').outerHeight(true);
            $('.feedback').animate({
                height: correctHeight
            }, {
                duration: 300,
                progress: function() {
                    s9.view.size({
                        height: startSize + $('.feedback').outerHeight(true) + offset
                    });
                }
            });
            // s9.view.size({
            //     height: startSize + correctHeight + offset
            // });
        } else {
            $('.user_select').addClass('incorrect');
            $('.answer_button').html('Try Again').addClass('reset try_again');
            $('.feedback_incorrect p').html(optionalText);
            $('.feedback_text').hide();
            $('.feedback_incorrect').show();
            $('.answer').addClass('disabled');
            var incorrectHeight = $('.feedback_incorrect').outerHeight(true);
            $('.feedback').animate({
                height: incorrectHeight
            }, {
                duration: 300,
                progress: function(animation, progress, remainingMS) {
                    s9.view.size({
                        height: startSize + $('.feedback').outerHeight(true) + offset
                    });
                }
            });
        }
    }
    $(submitAnswerSelector).bind('click touch', function() {
        var submitAnswerElem = $(this);
        if (!submitAnswerElem.hasClass('disabled')) {
            if (submitAnswerElem.hasClass('reset')) {
                init();
            } else {
                checkAnswer();
            }
        }
    });

    // Actively resize widget as the window is changed.
    $(window).resize(function() {
        if ($(".feedback:animated").length === 0) { //don't resize while animating
            $.each($('.feedback').children(), function(i, feedbackDiv) {
                if ($(feedbackDiv).css('display') !== 'none') {
                    $('.feedback').height($(feedbackDiv).outerHeight(true));
                }
            });
            var widgetHeight = $('.widget_container').height();
            s9.view.size({
                height: widgetHeight + offset
            });
        }
    });
    init();
});
