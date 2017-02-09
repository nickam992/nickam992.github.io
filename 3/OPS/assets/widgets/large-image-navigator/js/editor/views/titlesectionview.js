Widget = Widget || {};

Widget.TitleSectionView = Widget.SectionView.extend({
    template: '#title-section-template',
    initialize: function() {
        Widget.SectionView.prototype.initialize.apply(this, arguments);
        _.bindAll(this, 'titleChanged');
    },
    render: function() {
        var templateText = $(this.template).html();
        var template = _.template(templateText);
        var html = template({
            title: this.model.get('title')
        });
        this.$el.html(html);
        this.editor = this.$el.find('textarea.title')
                              .ckeditor(Widget.utils.ckEditorConfig)
                              .editor;
        this.editor.on('change', this.titleChanged);
        this.editor.on('instanceReady', function(ev) {
            ev.editor.resize('100%', '70');
        });
        return this;
    },
    titleChanged: function() {
        var title = this.$el.find('textarea.title').val();
        this.model.set('title', title);
    }
});
