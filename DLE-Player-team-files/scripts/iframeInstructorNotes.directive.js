(function() {
    'use strict';
    angular
        .module('player.notes')
        .directive('iframeInstructorNotes', iframeInstructorNotes);

    var collapseClass = 'collapse';

    iframeInstructorNotes.$inject = [];

    /**
     * @ngdoc directive
     * @name player.notes.directive:iframeInstructorNotes
     * @description
     *
     * The `iframeInstructorNotes` directive removes scrolling from an iframe by scaling it to its
     * content
     *
     * @returns { Object } Return object {link, restrict: 'A'}
     */
    function iframeInstructorNotes () {
        var vm;

        var directive = {
            restrict: 'A',
            link: link,
            controller: iframeInstructorNotesController,
            controllerAs: 'inc',
            bindToController: true
        };
        return directive;

        //////////////////////////

        /**
         * @ngdoc method
         * @methodOf player.notes.directive:iframeInstructorNotes
         * @name link
         *
         * @description
         * # link
         * The `link` method links the document to the directive
         *
         * @param {Object} scope param
         * @param {Object} element param
         * @param {Object} attrs param
         * @returns {Object} the link
         */
        function link (scope, element, attrs) {
            vm = scope.inc;

            vm.onReady(element);
        }
    }

    iframeInstructorNotesController.$inject = [
        '$timeout',
        '$scope',
        'lazy',
        'orchestration',
        'notes',
        'highlights',
        'heatMap',
        'follow',
    ];

    /**
     * @ngdoc controller
     * @name player.notes.controller:iframeInstructorNotes
     * @requires $scope
     * @requires orchestration
     *
     * @description
     *  Functionality backing the instructorNotes directive. Includes navigation and informational
     *  interfaces
     */
    function iframeInstructorNotesController(
        $timeout,
        $scope,
        lazy,
        orchestration,
        notes,
        highlights,
        heatMap,
        follow
    ) {
        var element;

        /* jshint validthis: true */
        var vm = this;

        this.data = notes.data;

        vm.highlights = highlights.data;
        vm.heatMap = heatMap.data;

        vm.onReady = onReady;

        // orchestration listeners
        vm.iframeLoaded = iframeLoaded;

        // Testing
        vm.onClickNote = onClickNote;
        vm.onSelectionUpdate = onSelectionUpdate;

        orchestration.registerDelegate(vm);

        ////////////

        /**
         * @ngdoc method
         * @methodOf player.notes.directive:iframeInstructorNotes
         * @name getContentDocument
         *
         * @description
         * # getContentDocument
         * The `getContentDocument` method
         *
         * @returns {Object} the contentDocument of the attached iframe
         */
        function getContentDocument() {
            return element[0].contentDocument;
        }

        /**
         * @ngdoc method
         * @methodOf player.notes.directive:iframeInstructorNotes
         * @name onReady
         *
         * @description
         * # onReady
         * The `onReady` method is called when the directive is linked to an element

         * @param {Object} elem param
         */
        function onReady(elem) {
            element = elem;

            // Listen for all the things that change the note DOM
            $scope.$watch('inc.highlights.selections',      onSelectionUpdate, true);
            $scope.$watch('inc.heatMap.heatMap.selections', onSelectionUpdate, true);
            $scope.$watch('inc.heatMap.showHeatMap',        onSelectionUpdate, true);
        }

        /**
         * @ngdoc method
         * @methodOf player.notes.directive:iframeInstructorNotes
         * @name collapseAll
         *
         * @description
         * # collapseAll
         * The `collapseAll` method
         */
        function collapseAll() {
            var doc = getContentDocument();
            var notes = doc.getElementsByClassName('teacher');
            angular.element(notes).addClass(collapseClass);
        }

        /**
         * @ngdoc method
         * @methodOf player.notes.directive:iframeInstructorNotes
         * @name iframeLoaded
         *
         * @description
         * # iframeLoaded
         * The `iframeLoaded` method
         */
        function iframeLoaded(iframe) {
            element = iframe;
            var doc = getContentDocument();
            doc.addEventListener('mouseup', onClickNote);
            doc.addEventListener('touchend', onClickNote);
            collapseAll();
        }

        /**
         * @ngdoc method
         * @methodOf player.notes.directive:iframeInstructorNotes
         * @name onClickNote
         *
         * @description
         * # onClickNote
         * The `onClickNote` method
         *
         * @param {Object} event param
         */
        function onClickNote(event) {
            var note = angular.element(event.target).closest('.teacher');
            if (note.length > 0) {
                var collapsed = note.hasClass(collapseClass);
                collapseAll();
                note.toggleClass(collapseClass, !collapsed);
                note[0].scrollTop = 0;
            }
        }

        /**
         * @ngdoc method
         * @methodOf player.notes.directive:iframeInstructorNotes
         * @name onSelectionUpdate
         *
         * @description
         * # onSelectionUpdate
         * The `onSelectionUpdate` method
         *
         * @returns {Object} the onSelectionUpdate
         */
        function onSelectionUpdate() {
            var open = lazy(follow.data.elements).findWhere({shown: true});
            $timeout(function() {
                notes.onNavUpdate();
                if (open) {
                    var note = lazy(follow.data.elements).findWhere({noteId: open.noteId});
                    if (note) {
                        follow.toggleFollowerVisibility(note, true);
                    }
                }
            }, 0);
        }
    }

})();
