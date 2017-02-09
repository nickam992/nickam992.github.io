Widget = Widget || {};

Widget.CaptionSectionView = Widget.SectionView.extend({
    template: '#caption-section-template',
    initialize: function() {
        Widget.SectionView.prototype.initialize.apply(this, arguments);
        _.bindAll(this, 'captionChanged');
    },
    render: function() {
        var templateText = $(this.template).html();
        var template = _.template(templateText);
        var html = template({
            caption: this.model.get('caption')
        });
        this.$el.html(html);
        this.editor = this.$el.find('textarea.caption')
                              .ckeditor(Widget.utils.ckEditorConfig)
                              .editor;
        this.editor.on('change', this.captionChanged);
        this.editor.on('instanceReady', function(ev) {
            ev.editor.resize('100%', '70');
        });
        return this;
    },
    captionChanged: function() {
        var caption = this.$el.find('textarea.caption').val();
        this.model.set('caption', caption);
    }
});
