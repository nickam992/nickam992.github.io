var Widget = Widget || {};

Widget.EditorView = Backbone.View.extend({
    template: '#editor-template',
    events: {
        'click .save': 'saveWidgetData'
    },
    initialize: function() {
        this.configSectionView = new Widget.ConfigSectionView({
            model: this.model
        });
        this.titleSectionView = new Widget.TitleSectionView({
            model: this.model
        });
        this.mainImageSectionView = new Widget.MainImageSectionView({
            model: this.model
        });
        this.thumbnailSectionView = new Widget.ThumbnailSectionView({
            model: this.model
        });
        this.captionSectionView = new Widget.CaptionSectionView({
            model: this.model
        });
        this.previewView = new Widget.ViewerView({
            model: this.model
        });
        this.listenTo(Widget.app, 'upload:start', this.uploadStarted);
        this.listenTo(Widget.app, 'upload:end', this.uploadEnded);
    },
    render: function() {
        var templateText = $(this.template).html();
        var template = _.template(templateText);
        var html = template({
            showSave: Widget.app.debug
        });
        this.$el.html(html);
        this.$el.find('#config-section')
                .html(this.configSectionView.render().el);
        this.$el.find('#title-section')
                .html(this.titleSectionView.render().el);
        this.$el.find('#main-image-section')
                .html(this.mainImageSectionView.render().el);
        this.$el.find('#thumbnail-section')
                .html(this.thumbnailSectionView.render().el);
        this.$el.find('#caption-section')
                .html(this.captionSectionView.render().el);
        this.$el.find('#preview').html(this.previewView.render().el);
        return this;
    },
    saveWidgetData: function(ev) {
        Widget.persistence._file();
    },
    uploadStarted: function() {
        this.$el.find('.file-upload-overlay').show();
    },
    uploadEnded: function() {
        this.$el.find('.file-upload-overlay').hide();
    }
});
