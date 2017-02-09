Widget = Widget || {};

Widget.ThumbnailSectionView = Widget.SectionView.extend({
    template: '#thumbnail-section-template',
    events: {
        'change #viewport-color': 'viewportColorChanged'
    },
    initialize: function() {
        Widget.SectionView.prototype.initialize.apply(this, arguments);
        this.thumbnailView = new Widget.ImageView({
            model: this.model,
            imageKey: 'thumbnail'
        });
    },
    render: function() {
        var templateText = $(this.template).html();
        var template = _.template(templateText);
        var html = template({
            viewportColor: this.model.get('viewportColor')
        });
        this.$el.html(html);
        this.$el.find('.thumb .image')
                .html(this.thumbnailView.render().el);
        return this;
    },
    viewportColorChanged: function() {
        var color = this.$el.find('#viewport-color').val().replace('#', '');
        this.model.set('viewportColor', color);
    }
});
