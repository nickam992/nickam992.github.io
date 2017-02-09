Widget = Widget || {};

Widget.MainImageSectionView = Widget.SectionView.extend({
    template: '#main-image-section-template',
    initialize: function() {
        Widget.SectionView.prototype.initialize.apply(this, arguments);
        this.largeImageView = new Widget.ImageView({
            model: this.model,
            imageKey: 'largeImage'
        });
    },
    render: function() {
        var templateText = $(this.template).html();
        var template = _.template(templateText);
        var html = template();
        this.$el.html(html);
        this.$el.find('.main-image .image')
                .html(this.largeImageView.render().el);
        return this;
    }
});