Widget = Widget || {};

Widget.LargeImageView = Backbone.View.extend({
    template: '#large-image-template',
    className: 'wrap',
    initialize: function() {
        _.bindAll(this, 'resized', 'dragged', 'dragStopped', 'mapDragged',
            'zoomSet', 'zoomIn', 'zoomOut');
        this.mapView = new Widget.MapView({
            model: this.model
        });
        this.zoom = 100;
        this.listenTo(Widget.app, 'resized', this.resized);
        this.listenTo(Widget.app, 'zoom:set', this.zoomSet);
        this.listenTo(Widget.app, 'zoom:in', this.zoomIn);
        this.listenTo(Widget.app, 'zoom:out', this.zoomOut);
        this.listenTo(this.mapView, 'drag:drag', this.mapDragged);
        this.listenTo(this.mapView, 'drag:stop', this.mapDragStopped);
        this.updateProps();
    },
    render: function() {
        var that = this;
        var templateText = $(this.template).html();
        var template = _.template(templateText);
        var html = template({
            src: this.model.get('largeImage') != null
                ? this.model.get('largeImage').path
                : 'data:image/gif;base64,' // transparent 1x1 gif
                    + 'R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
            thumbnailCorner: this.model.get('thumbnailCorner')
        });
        this.$el.html(html);
        this.$el.find('img.main').draggable({
            drag: this.dragged,
            stop: this.dragStopped
        }).load(function() {
            Widget.app.resized();
        });
        this.$el.find('.map').html(this.mapView.render().el);
        this.mapView.delegateEvents();
        return this;
    },
    setHeight: function() {
        this.imgHeight = this.$el.find('img.main').height();
    },
    updateContainment: function() {
        var containement = this._containement();
        this.$el.find('img.main')
                .draggable('option', 'containment', containement);
        this.enforceContainment();
    },
    enforceContainment: function() {
        var pos = this.$el.find('img.main').position();
        var minPosLeft = -(this.props.imgWidth - this.props.containerWidth);
        var minPosTop = -(this.props.imgHeight - this.props.containerHeight);
        if (pos.top < minPosTop) {
            this.$el.find('img.main').css('top', minPosTop + 'px');
        }
        if (pos.left < minPosLeft) {
            this.$el.find('img.main').css('left', minPosLeft + 'px');
        }
        if (pos.top > 0) {
            this.$el.find('img.main').css('top', '0px');
        }
        if (pos.left > 0) {
            this.$el.find('img.main').css('left', '0px');
        }
        this.updateMap();
    },
    _containement: function() {
        var borderWidth = this.$el.css('border-width');
        borderWidth = parseInt(borderWidth.replace('px', ''));
        var top = this.props.containerHeight - this.props.imgHeight
            + this.props.containerTop + borderWidth;
        var bottom = this.props.containerTop + borderWidth;
        var left = this.props.containerWidth - this.props.imgWidth
            + this.props.containerLeft + borderWidth;
        var right = this.props.containerLeft + borderWidth;
        return [left, top, right, bottom]; // [ x1, y1, x2, y2 ]
    },
    resized: function() {
        this.resetZoom();
        this.setHeight();
        this.resize();
        this.updateContainment();
        this.resizeMap();
        this.updateMap();
    },
    resize: function() {
        var height = Math.min(this.imgHeight, 500);
        this.$el.css('height', height);
        this.updateProps();
    },
    updateProps: function() {
        this.props = {
            containerWidth: this.$el.width(),
            containerHeight: this.$el.height(),
            containerTop: this.$el.offset().top,
            containerLeft: this.$el.offset().left,
            imgWidth: this.$el.find('img.main').width(),
            imgHeight: this.$el.find('img.main').height()
        };
    },
    resizeMap: function() {
        var xRatio = this.props.containerWidth / this.props.imgWidth;
        var yRatio = this.props.containerHeight / this.props.imgHeight;
        this.mapView.resizeViewport(xRatio, yRatio);
    },
    updateMap: function() {
        var pos = this.$el.find('img.main').position();
        var xOffset = pos.left / this.props.imgWidth;
        var yOffset = pos.top / this.props.imgHeight;
        this.mapView.updateViewport(xOffset, yOffset);
    },
    dragged: function() {
        this.updateMap();
    },
    dragStopped: function() {
        this.enforceContainment();
    },
    mapDragged: function(xOffset, yOffset) {
        this.setOffset(xOffset, yOffset);
    },
    mapDragStopped: function() {
        this.enforceContainment();
    },
    zoomSet: function(zoom) {
        var center = this.getCenter();
        this.$el.find('img.main').css({
            width: zoom + '%'
        });
        this.resize();
        this.setCenter(center);
        this.updateContainment();
        this.resizeMap();
        this.updateMap();
    },
    zoomIn: function() {
        this.zoom *= 1.25;
        Widget.app.trigger('zoom:set', this.zoom);
    },
    zoomOut: function() {
        this.zoom /= 1.25;
        this.zoom = Math.max(100, this.zoom);
        Widget.app.trigger('zoom:set', this.zoom);
    },
    resetZoom: function() {
        this.zoom = 100;
        Widget.app.trigger('zoom:set', this.zoom);
    },
    getCenter: function() {
        var pos = this.$el.find('img.main').position();
        var xOffset =
            (-pos.left + this.props.containerWidth / 2) / this.props.imgWidth;
        var yOffset =
            (-pos.top + this.props.containerHeight / 2) / this.props.imgHeight;
        return {
            left: xOffset,
            top: yOffset
        }
    },
    setCenter: function(center) {
        var xOffset = center.left
            - (this.props.containerWidth / 2) / this.props.imgWidth;
        var yOffset = center.top
            - (this.props.containerHeight / 2) / this.props.imgHeight;
        this.setOffset(xOffset, yOffset);
    },
    setOffset: function(xOffset, yOffset) {
        this.$el.find('img.main').css({
            top: (-yOffset * this.props.imgHeight) + 'px',
            left: (-xOffset * this.props.imgWidth) + 'px'
        });
        this.enforceContainment();
    }
});
