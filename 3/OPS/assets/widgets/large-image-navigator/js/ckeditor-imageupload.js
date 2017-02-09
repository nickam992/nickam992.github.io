$(function() {
    function closeDialog(userFileName) {
        var ckDialog = window.CKEDITOR.dialog.getCurrent(),
            ckCancel = ckDialog._.buttons['cancel'],
            ckOK = ckDialog._.buttons['ok'],
            element;

        if (ckDialog.getName() == 'image') {
            element = ckDialog.getContentElement('info', 'txtAlt');
            if (element) {
                element.setValue(userFileName);
            }

            ckOK.click();
        }
    }

    $(document.body).on('change', '.uploadFile', function(e) {
        e.preventDefault();
        var thisInput = e.currentTarget;

        if ($(thisInput)[0].files.length == 0) return;

        var fileName = $(thisInput)[0].files[0].name;

        var currentEditor = $('.cke_focus');

        var file_parent = $(currentEditor).parents('.in_block').attr('data-name');
        var file_parent_id = $(currentEditor).parents('.in_block').attr('data-id');

        file_id = JSON.stringify({
            "file_parent_id": file_parent_id,
            "file_parent": file_parent,
            "file_name": fileName
        });

        var fileUploadHandler = {};
        _.extend(fileUploadHandler, Backbone.Events);
        fileUploadHandler.listenToOnce(Widget.app, 'upload:end', function(path) {
            var urlLabels = $('label.cke_dialog_ui_labeled_label:contains("URL")');
            $.each(urlLabels, function(iIndex, iElement) {
                if($(iElement).text() === "URL") {
                    var inputID = $(iElement).attr('for');
                    $('#' + inputID).val(path);
                }
            });
            var pathName = path.split("/");
            $('.in_block[data-name=' + file_parent +'][data-id=' + file_parent_id + ']').find('span.val').text(fileName);
            closeDialog(fileName);
        });

        var file = $(thisInput)[0].files[0];
        Widget.app.uploadImage(file);
    });
});
