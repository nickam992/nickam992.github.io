Widget = window.Widget || {};

Widget.Parent = function(options) {
    options || (options = {});
    _.extend(this, options);
    _.bindAll(this, 'messageReceived');
    this.listenEvents();
};

_.extend(Widget.Parent.prototype, Backbone.Events, {

    uploadImage: function(file) {
        if (Widget.app.debug) {
            var path = '../../widget_images/' + file.name;
            setTimeout(function() {
                Widget.app.trigger('upload:end', path);
            }, 1000);
        } else {
            window.parent.postMessage({
                type: 'asset',
                method: 'image',
                payload: {
                    'data': file,
                    'id' : 'file-upload',
                    'progress': false
                }
            }, '*');
        }
    },

    setHeight: function(height) {
        window.parent.postMessage({
            'type': 'view',
            'method': 'set',
            'payload': {
                'height': height
            }
        }, '*');
    },

    listenEvents: function() {
        var eventMethod = window.addEventListener
            ? 'addEventListener'
            : 'attachEvent';
        var eventer = window[eventMethod];
        var messageEvent = eventMethod == 'attachEvent'
            ? 'onmessage'
            : 'message';

        eventer(messageEvent, this.messageReceived);
    },

    messageReceived: function(e) {
        if (window.console && window.console.log) {
            console.log('Received message from parent:', e);
        }
        // image upload
        if (e.data.method == 'image' && e.data.type == 'asset') {
            var payload = e.data.payload;
            if (payload.progress === 1) { // upload is done
                Widget.app.trigger('upload:end', payload.path);
            }
        }
    }

});
