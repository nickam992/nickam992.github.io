(function() {
    'use strict';

    angular
        .module('player.notes')
        .factory('highlights', highlightsFactory);

    highlightsFactory.$inject = [
        '$location',
        '$timeout',
        '$q',
        'firebase',
        'lazy',
        'auth',
        'navigation',
        'iframe',
        'dialogHelper',
        'annotationUtil',
    ];

    /**
     * @ngdoc service
     * @name player.notes.factory:highlights
     * @requires jQuery
     * @requires $location
     * @requires $timeout
     * @requires $q
     * @requires firebase
     * @requires lazy
     * @requires auth
     * @requires navigation
     * @requires iframe
     * @requires dialogHelper
     * @requires annotationUtil
     * @description
     *
     * The `highlights` factory stores highlights for a user.
     *
     * @returns { Object } Return object
     */
    function highlightsFactory(
        $location,
        $timeout,
        $q,
        firebase,
        lazy,
        auth,
        navigation,
        iframe,
        dialogHelper,
        annotationUtil
    ) {

        /**
         * @ngdoc property
         * @name colors
         * @propertyOf player.notes.factory:highlights
         * @description
         * The colors to be used with a highlight
         */
        var colors = [
            new HighlightColor('yellow', '#FFF098', 'Yellow Highlight'),
            new HighlightColor('blue', '#BDD7FC', 'Blue Highlight'),
            new HighlightColor('green', '#CFFF53', 'Green Highlight'),
            new HighlightColor('pink', '#FFBEDC', 'Pink Highlight')
        ];

        /**
         * @ngdoc property
         * @name colorOptions
         * @propertyOf player.notes.factory:highlights
         * @description
         * The colors to be used with a highlight as options for multi-select directive
         */
        var colorOptions = lazy(colors).map(highlightColorToSelect).toArray();

        /**
         * @ngdoc property
         * @name highlightDefaults
         * @propertyOf player.notes.factory:highlights
         * @description
         * Default values to be used for notes. Used for load from firebase.
         */
        var highlightDefaults = {
            color: colors[0].classes,
        };

        var data = annotationUtil.data;

        angular.extend(data, {
            colors: colors,
            firebaseRef: null,
            selections: [],
        });

        var factory = {
            data: data,
            onSelection: onSelection,
            clearSelections: clearSelections,

            // navigation listeners
            iframeLoaded:   refreshFirebaseRef,
            updateSection:  refreshFirebaseRef,
            updateExhibits: refreshFirebaseRef,
            onNavUpdate:    refreshFirebaseRef,

            // Testing
            refreshFirebaseRef: refreshFirebaseRef,
            handleNoteUpdate:   handleNoteUpdate,
        };

        refreshFirebaseRef();

        navigation.registerDelegate(factory);

        return factory;

        /////////////

        /**
         * @ngdoc method
         * @methodOf player.notes.factory:highlights
         * @name highlightColorToSelect
         *
         * @description
         * # highlightColorToSelect
         * The `highlightColorToSelect` method
         *
         * @param {Object} highlight param
         * @returns {Object} the highlightColorToSelect
         */
        function highlightColorToSelect(highlightColor) {
            return {
                aria: highlightColor.displayText,      // multiSelect
                classes: highlightColor.selectClasses, // multiSelect
                menuClasses: highlightColor.menuClasses, // contextMenu
                highlight: highlightColor,
            };
        }

        /**
         * @ngdoc method
         * @methodOf player.notes.factory:highlights
         * @name refreshFirebaseRef
         *
         * @description
         * # refreshFirebaseRef
         * The `refreshFirebaseRef` method
         *
         * @returns {Object} the refreshFirebaseRef
         */
        function refreshFirebaseRef() {
            var exhibit = navigation.getActiveExhibit();
            if (exhibit && auth.ltiContext['user_id']) {
                factory.data.firebaseRef = firebase.getFirebaseRef([
                    'selections',
                    $location.path(),
                    'user:' + auth.ltiContext['user_id']
                ].join('/'));
                var selections = firebase.$firebaseArray(factory.data.firebaseRef);

                // The array starts out empty, don't save it until it has a chance to fill
                $timeout(function() {
                    factory.data.selections = selections;
                }, 0);
            }
            else {
                factory.data.firebaseRef = null;
                factory.data.selections = [];
            }
        }

        /**
         * @ngdoc method
         * @methodOf player.notes.factory:highlights
         * @name getSelectionById
         *
         * @description
         * # getSelectionById
         * The `getSelectionById` method
         *
         * @param {Object} id param
         * @returns {Object} the selectionById
         */
        function getSelectionById(id) {
            return factory.data.selections.$getRecord(id);
        }

        /**
         * @ngdoc method
         * @methodOf player.notes.factory:highlights
         * @name addSelection
         *
         * @description
         * # addSelection
         * The `addSelection` method
         *
         * @param {Object} selection param
         * @returns {Object} the addSelection
         */
        function addSelection(selection) {
            if (selection.$id) {
                return factory.data.selections.$save(selection);
            }
            return factory.data.selections.$add(selection);
        }

        /**
         * @ngdoc method
         * @methodOf player.notes.factory:highlights
         * @name removeSelection
         *
         * @description
         * # removeSelection
         * The `removeSelection` method
         *
         * @param {Object} selection param
         * @returns {Object} the removeSelection
         */
        function removeSelection(selection) {
            var updated = annotationUtil.removeSelection(selection);

            var promises = lazy(updated)
                .map(addSelection)
                .concat(factory.data.selections.$remove(selection))
                .toArray();

            return $q.all(promises);
        }

        /**
         * @ngdoc method
         * @methodOf player.notes.factory:highlights
         * @name clearSelections
         *
         * @description
         * # clearSelections
         * The `clearSelections` method
         *
         * @returns {Object} the clearSelections
         */
        function clearSelections () {
            return firebase.clearArray(factory.data.selections);
        }

        /**
         * @ngdoc method
         * @methodOf player.notes.factory:highlights
         * @name handleNoteUpdate
         *
         * @description
         * # handleNoteUpdate
         * The `handleNoteUpdate` method processes changes made in the
         * context menu and saves them to firebase
         *
         * @param {Object} newVal param
         * @param {Object} oldVal param
         */
        function handleNoteUpdate(newVal, oldVal) {
            // New/Edit note
            if (newVal.highlight || newVal.hasNote) {
                var base = {
                    highlight: newVal.highlight ? true : false,
                    color: newVal.color ? newVal.color.highlight.classes : null,
                };

                var properties = angular.extend(newVal.selection,
                    angular.extend({}, highlightDefaults, newVal.selection, base));

                if (newVal.hasNote && newVal.noteText) {
                    properties.note =  newVal.noteText;
                }
                else {
                    delete properties.note;
                }

                return addSelection(properties).then(function(sel) {
                    newVal.selection = getSelectionById(sel.key());
                    return newVal;
                });
            }

            // Remove note
            if (newVal.selection && newVal.selection.$id) {
                return removeSelection(newVal.selection).then(function(sel) {
                    delete newVal.selection.$id;
                    delete newVal.highlight;
                    return newVal;
                });
            }
        }

        /**
         * @ngdoc method
         * @methodOf player.notes.factory:highlights
         * @name getColorForClass
         *
         * @description
         * # getColorForClass
         * The `getColorForClass` method
         *
         * @param {Object} class param
         * @returns {Object} the colorForClass
         */
        function getColorForClass(classes) {
            return lazy(colorOptions).filter(function(option) {
                return option.highlight.classes === classes;
            }).first();
        }

        /**
         * @ngdoc method
         * @methodOf player.notes.factory:highlights
         * @name buildContextMenuProperties
         *
         * @description
         * # buildContextMenuProperties
         * The `buildContextMenuProperties` method
         *
         * @param {Object} selection param
         * @param {Object} event param
         * @returns {Object} the buildContextMenuProperties
         */
        function buildContextMenuProperties(event, selection) {
            var properties = {
                selection: selection || annotationUtil.getSelection(),
                highlight: selection ? selection.highlight : undefined,
                color: selection ? getColorForClass(selection.color) : undefined,
                colorOptions: colorOptions,
            };

            if (selection && selection.note) {
                properties.noteText = selection.note;
            }

            if (properties.selection && event) {
                properties.click = iframe
                    .getClientPosition(event.clientX, event.clientY, event.target);
            }

            return properties;
        }

        /**
         * @ngdoc method
         * @methodOf player.notes.factory:highlights
         * @name onSelection
         *
         * @description
         * # onSelection
         * The `onSelection` method shows a context menu to enable/disable highlights, set color,
         * and add notes.
         *
         * @param {Object} event param
         * @param {Object} selection param
         * @returns {Object} the onSelection
         */
        function onSelection(event, selection) {
            // It's critical that any information we don't want wiped out is set in the
            // properties object
            var properties = buildContextMenuProperties(event, selection);

            if (properties.selection) {
                if (factory.data.quickHighlight && !selection) {
                    properties.highlight = properties.selection;
                    properties.color = getColorForClass(highlightDefaults.color);
                    factory.handleNoteUpdate(properties);
                    dialogHelper.showReadSpeakerQuickControls(properties);
                    event.stopPropagation();
                    event.stopImmediatePropagation();
                    return false;
                }
                else {
                    dialogHelper.showContextMenu(properties, factory.handleNoteUpdate)
                        .finally(annotationUtil.clearSelection);
                    event.stopPropagation();
                    event.stopImmediatePropagation();
                    return false;
                }
            }

            return true;
        }

        ////////////////////////////////////

        function HighlightColor(name, color, displayText) {
            /* jshint validthis: true */
            var highlightColor = this;

            highlightColor.name = name;
            highlightColor.color = color;
            highlightColor.displayText = displayText;

            highlightColor.classes = name + '-highlight';
            highlightColor.selectClasses = 'colorSelect ' + name;
            highlightColor.menuClasses = name;
        }

    }

})();
