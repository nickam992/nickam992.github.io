Widget = Widget || {};

Widget.ConfigSectionView = Widget.SectionView.extend({
    template: '#config-section-template',
    events: {
        'change #thumbnail-corner': 'thumbnailCornerChanged'
    },
    initialize: function() {
        Widget.SectionView.prototype.initialize.apply(this, arguments);
    },
    render: function() {
        var templateText = $(this.template).html();
        var template = _.template(templateText);
        var html = template({
            thumbnailCorner: this.model.get('thumbnailCorner')
        });
        this.$el.html(html);
        return this;
    },
    thumbnailCornerChanged: function() {
        var corner = this.$el.find('#thumbnail-corner').val();
        this.model.set('thumbnailCorner', corner);
    }
});
