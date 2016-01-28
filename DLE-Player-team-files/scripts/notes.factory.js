(function() {
    'use strict';
    angular
        .module('player.notes')
        .factory('notes', notesFactory);

    notesFactory.$inject = [
        '$timeout',
        '$sce',
        'lazy',
        'navigation',
        'iframe',
        'iframeInjector',
        'absoluteLinksFilter',
        'user',
        'follow',
    ];

    var noteClasses = ['answer', 'diff-resource', 'example', 'teach-notes'];

    var noteTitles = {
        'answer':
            {text: 'Answer', translate: 'teaching_notes.answer'},
        'diff-resource':
            {text: 'Differentiated&nbsp;Resource', translate: 'teaching_notes.diff_resource'},
        'example':
            {text: 'Example', translate: 'teaching_notes.example'},
        'teach-notes':
            {text: 'Teaching Notes', translate: 'teaching_notes.teach_notes'}
    };

    var elementNamespace = 'teachingNotes';

    /**
     * @ngdoc service
     * @name player.notes.factory:notes
     * @requires $timeout
     * @requires $sce
     * @requires lazy
     * @requires iframe
     * @requires iframeInjector
     * @requires navigation
     * @requires scrollSpy
     * @requires absoluteLinksFilter
     * @requires user
     * @description
     *
     * The `Notes` factory adds a scrolling note to the UI which is linked to
     * content (clo part) inside of an iframe.
     *
     * @returns { Object } Return object
     */
    function notesFactory(
        $timeout,
        $sce,
        lazy,
        navigation,
        iframe,
        iframeInjector,
        absoluteLinksFilter,
        user,
        follow
    ) {
        var noteDefaults = {
            noteClass: 'collapse',
            shown: false
        };

        var data = {
            scrollTop: 0,
            viewHeight: 0,
            viewHeightOffset: 64,
            iconHeight: 67,
            elements: []
        };

        var factory = {
            data: data,

            setInlineNotesVisibility: setInlineNotesVisibility,
            onNavUpdate: onNavUpdate,

            // orchestration listeners
            iframeLoaded:   iframeLoaded,
            updateSection:  onNavUpdate,
            updateExhibits: onNavUpdate,

            // follow listeners
            setFollowVisibility: setInlineNotesVisibility,

            // testing
            domElementToNote: domElementToNote,
        };

        setInlineNotesVisibility(false);
        navigation.registerDelegate(factory);
        follow.registerDelegate(factory);

        return factory;

        /////////////

        /**
         * @ngdoc method
         * @methodOf player.notes.factory:notes
         * @name setInlineNotesVisibility
         *
         * @description
         * # setInlineNotesVisibility
         * The `setInlineNotesVisibility` method
         *
         * @param {Object} showNotes param
         * @returns {Object} the setInlineNotesVisibility
         */
        function setInlineNotesVisibility(showFollow) {
            factory.data.showNotes = !showFollow && user.isInstructorMode();
            var style = [
                    '.teacher { display: ',
                    factory.data.showNotes ? 'block' : 'none',
                    '; }',
                ].join('');
            iframeInjector.appendStyle(style, 'instructorStyle');
        }

        /**
         * @ngdoc method
         * @methodOf player.notes.factory:notes
         * @name filterNoteClasses
         *
         * @description
         * # filterNoteClasses
         * The `filterNoteClasses` method
         *
         * @param {Object} classes param
         * @returns {Object} the filterNoteClasses
         */
        function filterNoteClasses(classes) {
            return lazy(classes)
                .intersection(noteClasses)
                .join(' ');
        }

        /**
         * @ngdoc method
         * @methodOf player.notes.factory:notes
         * @name domElementToNote
         *
         * @description
         * # domElementToNote
         * The `domElementToNote` method creates a note summary object from a note DOM element
         *
         * @param {Object} noteDom param
         * @returns {Object} the Note
         */
        function domElementToNote(noteDom) {
            // Get first non-script elder
            var noteId = noteDom.id;
            var target = noteDom.previousElementSibling || noteDom.parentNode;
            while (!target.id ||
                   target.tagName === 'SCRIPT' ||
                   target.classList.contains('teacher')) {
                target = target.previousElementSibling || target.parentNode;
            }

            var noteClass = filterNoteClasses(noteDom.classList);

            // Pull its content and ID and attach to the element
            var note = angular.extend({
                content: $sce.trustAsHtml(
                    absoluteLinksFilter(noteDom.outerHTML, factory.data.baseUrl)),
                targetId: target.id,
                noteId: noteId
            }, noteDefaults, {
                noteClass: noteDefaults.noteClass + ' ' + noteClass,
                title: noteTitles[noteClass]
            });

            follow.anchorElement(note);

            return note;
        }

        /**
         * @ngdoc method
         * @methodOf player.notes.factory:notes
         * @name parseNotesFromIframe
         *
         * @description
         * # parseNotesFromIframe
         * The `parseNotesFromIframe` method reads the iframe content and records teacher notes
         *
         * @returns {Object} the parseNotesFromIframe
         */
        function parseNotesFromIframe() {
            var notes = iframe.getIframe().contentDocument.getElementsByClassName('teacher');
            // getElementsByClassName returns a funky object, so change it to an array
            notes = Array.prototype.slice.apply(notes);
            return lazy(notes).map(domElementToNote).toArray();
        }

        /**
         * @ngdoc method
         * @methodOf player.notes.factory:notes
         * @name onNavUpdate
         *
         * @description
         * # onNavUpdate
         * The `onNavUpdate` method is delegated from navigation
         */
        function onNavUpdate() {
            var exhibit = navigation.getActiveExhibit();
            if (exhibit && iframe.isLoaded()) {
                follow.addElementGroup(parseNotesFromIframe(), elementNamespace,
                                       angular.bind(user, user.isInstructorMode));
            }
            else {
                follow.removeElementGroup(elementNamespace);
            }
        }

        /**
         * @ngdoc method
         * @methodOf player.notes.factory:notes
         * @name setIframe
         *
         * @description
         * # setIframe
         * The `setIframe` method
         *
         * @param {Object} iframe param
         */
        function iframeLoaded() {
            //Jump to the back of the line to make sure highlighting is in place
            $timeout(onNavUpdate, 0);
        }
    }

})();
