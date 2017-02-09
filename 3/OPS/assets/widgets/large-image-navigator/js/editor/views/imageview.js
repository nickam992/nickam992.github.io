var Widget = Widget || {};

Widget.ImageView = Backbone.View.extend({
    template: '#image-template',
    events: {
        'change input[type=file]': 'fileChanged',
        'click .js-delete': 'deleteClicked'
    },
    initialize: function(opts) {
        this.imageKey = opts.imageKey;
        _.bindAll(this, 'uploadEnded');
        this.listenTo(this.model, 'change:' + this.imageKey,
            this.imageChanged);
    },
    render: function(opts) {
        opts = opts || {};
        _.defaults(opts, {
            state: this.model.get(this.imageKey) == null ? 'empty' : 'existing'
        });
        var templateText = $(this.template).html();
        var template = _.template(templateText);
        var html = template({
            state: opts.state,
            name: this.model.get(this.imageKey) != null
                ? Widget.utils.truncateFilename(
                    this.model.get(this.imageKey).name)
                : null
        });
        this.$el.html(html);
        return this;
    },
    fileChanged: function(e) {
        var file = e.target.files[0];
        this._name = file.name;
        this.listenToOnce(Widget.app, 'upload:end', this.uploadEnded);
        this.render({
            state: 'uploading'
        });
        Widget.app.uploadImage(file);
    },
    uploadEnded: function(path) {
        var name = this._name;
        this._name = null;
        this.model.set(this.imageKey, {
            path: path,
            name: name
        });
    },
    imageChanged: function() {
        this.render();
    },
    deleteClicked: function() {
        this.model.set(this.imageKey, null);
    }
});
