Widget = Widget || {};

Widget.ViewerView = Backbone.View.extend({
    template: '#viewer-template',
    className: 'widget-content',
    initialize: function() {
        _.bindAll(this, 'changed');
        this.largeImageView = new Widget.LargeImageView({
            model: this.model
        });
        this.listenTo(this.model, 'change', this.changed);
    },
    render: function() {
        var templateText = $(this.template).html();
        var template = _.template(templateText);
        var html = template({
            title: this.model.get('title'),
            caption: this.model.get('caption')
        });
        this.$el.html(html);
        this.$el.find('img').load(function() {
            Widget.app.resized();
        });
        this.$el.find('#large-image').html(this.largeImageView.render().el);
        this.largeImageView.delegateEvents();
        MathJax.Hub.Queue(['Typeset', MathJax.Hub, this.el]);
        MathJax.Hub.Queue(function() {
            Widget.app.resized();
        });
        return this;
    },
    changed: function() {
        this.render();
    }
});
