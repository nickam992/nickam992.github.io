Widget = Widget || {};

Widget.SectionView = Backbone.View.extend({
    events: {
        'click .js-show-hide-section': 'showHideClicked',
        'click .js-pin-unpin-section': 'pinUnpinClicked'
    },
    initialize: function() {
        _.extend(this.events, Widget.SectionView.prototype.events);
        this.pinned = false;
        this.listenTo(Widget.app, 'section:open', this.sectionOpened, this);
    },
    showHideClicked: function() {
        this.$el.toggleClass('open');
        if (this.$el.hasClass('open')) {
            Widget.app.trigger('section:open', this);
        }
    },
    pinUnpinClicked: function() {
        this.pinned = !this.pinned;
        if (this.pinned) {
            this.$el.addClass('pinned');
        } else {
            this.$el.removeClass('pinned');
        }
    },
    sectionOpened: function(view) {
        if (!this.pinned && view != this) {
            this.$el.removeClass('open');
        }
    }
});
