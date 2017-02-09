Widget = Widget || {};

Widget.MapView = Backbone.View.extend({
    template: '#map-template',
    events: {
        'click .js-zoom-in': 'zoomInClicked',
        'click .js-zoom-out': 'zoomOutClicked'
    },
    initialize: function() {
        _.bindAll(this, 'resized', 'dragged', 'dragStopped');
        this.listenTo(Widget.app, 'resized', this.resized);
    },
    render: function() {
        var that = this;
        var templateText = $(this.template).html();
        var template = _.template(templateText);
        var src;
        if (this.model.get('thumbnail') != null) {
            src = this.model.get('thumbnail').path;
        } else if (this.model.get('largeImage') != null) {
            src = this.model.get('largeImage').path;
        } else {
            src = 'data:image/gif;base64,' // transparent 1x1 gif
                + 'R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
        }
        var html = template({
            src: src,
            viewportColor: this.model.get('viewportColor')
        });
        this.$el.html(html);
        this.$el.find('.thumb img').load(function() {
            that.resized();
            that.$el.find('.viewport').show();
            that.$el.find('.viewport').draggable({
                containment: 'parent',
                drag: that.dragged,
                stop: that.dragStopped
            });
        });
        return this;
    },
    resized: function() {
        this.resize();
    },
    resize: function() {
        this.updateProps();
    },
    updateProps: function() {
        this.props = {
            thumbWidth: this.$el.find('.thumb img').width(),
            thumbHeight: this.$el.find('.thumb img').height()
        };
    },
    resizeViewport: function(xRatio, yRatio) {
        this.$el.find('.viewport').css({
            width: (xRatio * 100) + '%',
            height: (yRatio * 100) + '%'
        });
    },
    updateViewport: function(xOffset, yOffset) {
        if (this.props === undefined) {
            this.updateProps();
        }
        this.$el.find('.viewport').css({
            top: (-yOffset * this.props.thumbHeight) + 'px',
            left: (-xOffset * this.props.thumbWidth) + 'px'
        });
    },
    dragged: function() {
        var pos = this.$el.find('.viewport').position();
        var xOffset = pos.left / this.props.thumbWidth;
        var yOffset = pos.top / this.props.thumbHeight;
        this.trigger('drag:drag', xOffset, yOffset);
    },
    dragStopped: function() {
        this.trigger('drag:stop');
    },
    zoomInClicked: function() {
        Widget.app.trigger('zoom:in');
    },
    zoomOutClicked: function() {
        Widget.app.trigger('zoom:out');
    }
});
