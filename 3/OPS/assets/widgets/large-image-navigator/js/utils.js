Widget = window.Widget || {};

Widget.utils = {

    getUrlParams: function() {
        var params = {};
        window.location.search.replace(/([^?=&]+)(=([^&]*))?/g,
            function($0, $1, $2, $3) {
                params[$1] = decodeURIComponent($3);
            });
        return params;
    },

    truncateFilename: function(filename, maxLength) {
        maxLength = maxLength || 40;
        if (filename.length > maxLength) {
            var filenameParts = filename.split('.');
            filename = filename.substr(0, maxLength - 8) + '[...]';
            if (filenameParts.length > 1) {
                filename += '.' + filenameParts.pop();
            }
        }
        return filename;
    },

    ckEditorConfig: {
        extraPlugins: 'widget,dialog,clipboard,lineutils,mathjax,autogrow',
        toolbar: [
            ['FontSize'],
            ['Bold','Italic','Underline'],
            ['TextColor','BGColor'],
            ['JustifyLeft', 'JustifyCenter', 'JustifyRight'],
            ['Image'],
            ['Mathjax']
        ],
        contentsCss: 'css/ckeditor.css',
        font_names: 'ProximaNova',
        font_defaultLabel: 'ProximaNova',
        fontSize_defaultLabel: '14',
        mathJaxLib: "https://cdn.mathjax.org/mathjax/latest/MathJax.js"
            + "?config=TeX-AMS-MML_HTMLorMML",
        autoGrow_maxHeight: 400,
        autoGrow_minHeight: 70,
        removePlugins: 'resize'
    }

};
