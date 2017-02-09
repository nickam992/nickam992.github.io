/**
 * JS Console Widget
 * All code not previously covered by 3rd party licenses (MIT, etc) is copyright Inkling, 2013.
 */

// Fake objects that get put into the execution scope. This prevents the user
// from getting easy access to globals that we want to protect. Yes, there are still tricks
// to get the global, but that why this is executed in a sandboxed iframe.
var fakeScope = {
    window: null,
    document: null,
    console: null,
    XMLHttpRequest: null
};

// Command to run.
var command;

function addResult(output){

    var section = '<section class="result">'
        + '<code class="command prettyprint">' + formatInput(command) + '</code>'
        + '<span class="output prettyprint">' + formatOutput(output) + '</span>'
        + '</section>';

    var results = $('.results');
    results.append(section);
    prettyPrint();

    results.scrollTop = results.scrollHeight;
}

// The cancel button is included to workaround the iOS bug where if an input field
// inside an iframe has focus, you can't tap outside to dismiss the keyboard. The user needs
// to tap the 'dismiss keyboard' button in the lower right of the keyboard. But we provide an
// extra cancel button for clarity.
function cancel(evt){
    // Prevent form submission.
    evt.preventDefault();

    $('#input').value = '';

    // Force the blur.
    forceBlur();
}

// Hack to force blur. Unfortunately input.blur() doesn't
// work on Mobile Safari. Lasted tested on iOS 5.
function forceBlur(){
    var input = $('#input');
    var placeholder = document.createElement('div');
    var parent = input.parentNode;
    // Swap elements and then immediately swap them back. This will pull the cursor out.
    parent.replaceChild(placeholder, input);
    parent.replaceChild(input, placeholder);
}

function formatInput(input){
    if (!input) return input;
    input = input.replace(/\n/g, '<br/>');
    input = input.replace(/ /g, '&nbsp;');
    return input;
}

function formatOutput(output){
    // Handle special-case undefined.
    if (typeof(output) == 'undefined') return '';

    // Print out errors.
    if (output instanceof Error) return output.toString();

    // Try its JSON form.
    try {
        return JSON.stringify(output);
    } catch (e){}

    // Try its string form.
    if (output && output.toString){
        return output.toString();
    }

    // If all else fails, just return the value.
    return output;
}

function runEvt(evt){
    // Prevent form submission.
    evt.preventDefault();

    var input = $('#input');
    if (!input.val()) return;

    // Pass the input commands to the execute function.
    executeCode(input.val());

    // Clear the input text area.
    input.val('');
}

function executeCode(code){
    // This hack is required to apply two contexts to the command.
    // The eval function must be executed outside of this function's context.
    window.command = code;

    window.location.href = "javascript: \
        try { \
            addResult(eval(' \
                with(window) {\
                    with(fakeScope) { \
                        ' + window.command + ' \
                    } \
                } \
            ')); \
        } catch (e) { \
            addResult(e); \
        } \
        void 0";
}

// Detects a key event and executes the code.
function keyupEvt(evt){
    // Handle Shift-Enter, Command-Enter, or Ctrl-Enter to run the command.
    if ((evt.shiftKey || evt.metaKey || evt.ctrlKey) && evt.keyCode == 13){
        runEvt(evt);
        evt.preventDefault();

    // Up arrow recalls previous command.
    } else if (evt.keyCode == 38){
        $('#input').val(command);
        evt.preventDefault();
    }
}

// Setup.

$(function() {
    // Run preexecute example.
    var preExecute = s9.initialParams['preexecute'];
    if (preExecute) executeCode(preExecute);

    // Populate initial code from params.
    var initialCode = s9.initialParams['prepopulate'];
    if (initialCode) $('#input').value = initialCode;

    $('#run').click(runEvt);
    $('#cancel').click(cancel);
    $('#input').keyup(keyupEvt);
});