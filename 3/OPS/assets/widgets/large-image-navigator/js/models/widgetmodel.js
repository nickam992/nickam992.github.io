Widget = Widget || {};

Widget.WidgetModel = Backbone.Model.extend({
    defaults: {
        largeImage: null,
        thumbnail: null,
        title: '',
        caption: '',
        viewportColor: 'ff0000',
        thumbnailCorner: 'bottom-left'
    }
});
