Widget = window.Widget || {};

Widget.persistence = {

    load: function() {
        var promise = $.Deferred();
        var urlParams = Widget.utils.getUrlParams();
        if (!urlParams.configFile) {
            promise.resolve({
                largeImage: null,
                thumbnail: null,
                title: '',
                caption: ''
            });
            return promise;
        }
        $.ajax({
            url: urlParams.configFile,
            dataType: 'json',
            success: function(widgetData) {
                promise.resolve(widgetData);
            },
            error: function() {
                $('body').html('An error occured while loading the saved '
                    + 'state of the widget.');
            }
        });

        return promise;
    },

    save: function() {
        // make new object to avoid cloning error message from Inkling
        var payload = JSON.parse(JSON.stringify(this._currentData()));
        window.parent.postMessage({
            type: 'configuration',
            method: 'file',
            payload: payload
        }, '*');
    },

    _currentData: function() {
        return Widget.app.model.toJSON();
    },

    // dump current JSON to console
    _dump: function() {
        console.log(JSON.stringify(this._currentData()));
    },

    // browser downloads json config file to use in dev
    _file: function() {
        var pom = document.createElement('a');
        pom.setAttribute('href', 'data:text/plain;charset=utf-8,'
            + encodeURIComponent(JSON.stringify(this._currentData())));
        pom.setAttribute('download', 'widget-data.json');
        pom.click();
    }

};