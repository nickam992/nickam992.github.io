var Widget = Widget || {};

Widget.App = function(options) {
    options || (options = {});
    _.extend(this, options);
};

_.extend(Widget.App.prototype, Backbone.Events, {
    initialize: function() {
        _.bindAll(this, 'bootstrap', 'scheduleSave', 'resized');
        this.model = new Widget.WidgetModel();
        this.parent = new Widget.Parent();
        Widget.persistence.load().then(this.bootstrap);
    },
    bootstrap: function(data) {
        this.model.set(data);
        var viewClass;
        if (this.editor) {
            ViewClass = Widget.EditorView;
            this.listenTo(this.model, 'change', this.scheduleSave);
        } else {
            ViewClass = Widget.ViewerView;
            if (this.model.get('largeImage') == null) {
                $('body').html("Please edit this widget's content.");
                if (!this.debug) {
                    this.parent.setHeight(100);
                }
                return; // bail
            }
        }
        this.view = new ViewClass({
            model: this.model
        });
        this.view.render();
        $('body').html(this.view.el);
        $(window).resize(this.resized).resize();
    },
    scheduleSave: function() {
        if (this.debug) {
            return;
        }
        if (this.savingTimeout) {
            clearTimeout(this.savingTimeout)
        }
        this.savingTimeout = setTimeout(function() {
            Widget.persistence.save();
        }, 1000);
    },
    resized: function() {
        this.trigger('resized');
        if (!this.debug) {
            var newHeight = $('body').outerHeight();
            this.parent.setHeight(newHeight);
        }
    },
    uploadImage: function(file) {
        this.parent.uploadImage(file);
        this.trigger('upload:start');
    }
});
