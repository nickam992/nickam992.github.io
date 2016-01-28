(function() {
    /**
     * @ngdoc directive
     * @name player.notes.directive:iframeHighlight
     * @description
     *
     * The `iframeHighlight` directive removes scrolling from an iframe by scaling it to its
     * content
     *
     * @returns { Object } Return object {link, restrict: 'A'}
     */
    'use strict';

    angular
        .module('player.layout')
        .directive('iframeHighlight', iframeHighlight);

    iframeHighlight.$inject = [];

    function iframeHighlight () {
        var vm;

        var directive = {
            restrict: 'A',
            link: link,
            controller: highlightsController,
            controllerAs: 'hl',
            bindToController: true
        };
        return directive;

        //////////////////////////

        /**
         * @ngdoc method
         * @methodOf player.notes.directive:iframeHighlight
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
            vm = scope.hl;

            vm.onReady(element);
        }
    }

    highlightsController.$inject = [
        '$log',
        '$timeout',
        '$scope',
        '$element',
        'lazy',
        'rangy',
        'orchestration',
        'highlights',
        'annotationUtil',
        'notes',
    ];

    /**
     * @ngdoc controller
     * @name player.notes.controller:iframeHighlight
     * @requires $log
     * @requires $scope
     * @requires $timeout
     * @requires lazy
     * @requires rangy
     * @requires orchestration
     * @requires highlights
     *
     * @description
     *  Functionality backing the instructorNotes directive. Includes navigation and informational
     *  interfaces
     */
    function highlightsController(
        $log,
        $timeout,
        $scope,
        $element,
        lazy,
        rangy,
        orchestration,
        highlights,
        annotationUtil,
        notes) {

        var element;

        /* jshint validthis: true */
        var vm = this;
        vm.data = highlights.data;
        vm.notesData = notes.data;

        vm.onReady = onReady;
        vm.onSelectionUpdate = onSelectionUpdate;

        // orchestration listeners
        vm.iframeLoaded = iframeLoaded;

        // Testing
        vm.onMouseup = onMouseup;
        vm.noteClasses = noteClasses;
        vm.addHighlight = addHighlight;

        orchestration.registerDelegate(vm);

        ////////////

        /**
         * @ngdoc method
         * @methodOf player.notes.controller:iframeHighlight
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
         * @methodOf player.notes.controller:iframeHighlight
         * @name onReady
         *
         * @description
         * # onReady
         * The `onReady` method is called when the directive is linked to an element

         * @param {Object} elem param
         */
        function onReady(elem) {
            element = elem;
            onSelectionUpdate();
        }

        /**
         * @ngdoc method
         * @methodOf player.notes.controller:iframeHighlight
         * @name iframeLoaded
         *
         * @description
         * # iframeLoaded
         * The `iframeLoaded` method
         */
        function iframeLoaded(iframe) {
            element = iframe;
            var doc = getContentDocument();
            doc.addEventListener('mouseup', onMouseup);
            doc.addEventListener('touchend', onMouseup);
            $scope.$watch('hl.data.selections', onSelectionUpdate, true);
            $scope.$watch('hl.data.showHighlights', onSelectionUpdate);
            onSelectionUpdate();
        }

        /**
         * @ngdoc method
         * @methodOf player.notes.controller:iframeHighlight
         * @name onMouseup
         *
         * @description
         * # onMouseup
         * The `onMouseup` method
         *
         * @param {Object} event param
         */
        function onMouseup(event) {
            return highlights.onSelection(event,
                annotationUtil.getSelectedHighlight(event, vm.data.selections));
        }

        /**
         * @ngdoc method
         * @methodOf player.notes.controller:iframeHighlight
         * @name noteClasses
         *
         * @description
         * # noteClasses
         * The `noteClasses` method
         *
         * @param {Object} highlight param
         * @returns {Object} the noteClasses
         */
        function noteClasses(highlight) {
            var classes = [annotationUtil.parentClass];
            if (highlight.note) {
                classes.push(annotationUtil.noteClass);
            }
            if (highlight.highlight) {
                classes.push(annotationUtil.highlightClass);
            }
            if (highlight.color) {
                classes.push(highlight.color);
            }
            return classes;
        }

        /**
         * @ngdoc method
         * @methodOf player.notes.directive:iframeHighlight
         * @name buildHighlighter
         *
         * @description
         * # buildHighlighter
         * The `buildHighlighter` method
         *
         * @param {Object} highlight param
         * @param {Object} doc param
         * @returns {Object} the buildHighlighter
         */
        function buildHighlighter(highlight, doc, index) {
            var highlighter = rangy.createHighlighter(doc);

            var classes = noteClasses(highlight).join(' ');

            highlighter.addClassApplier(rangy.createClassApplier(
                annotationUtil.parentClass + highlight.$id, {
                    ignoreWhiteSpace: true,
                    elementTagName: 'mark',
                    tagNames: ['mark'],
                    elementAttributes: {
                        id: highlight.$id,
                        'data-highlight-id': highlight.$id,
                        'data-highlight-index': index,
                    },
                    elementProperties: {
                        className: classes
                    }
                }));

            return highlighter;
        }

        /**
         * @ngdoc method
         * @methodOf player.notes.controller:iframeHighlight
         * @name placeMark
         *
         * @description
         * # placeMark
         * The `placeMark` method
         *
         * @param {Object} highlight param
         * @param {Object} range param
         * @param {Object} doc param
         * @returns {Object} the placeMark
         */
        function placeMark(highlight, selection, doc, index) {
            var highlighter = buildHighlighter(highlight, doc, index);

            highlighter.highlightSelection(annotationUtil.parentClass + highlight.$id, {
                selection: selection,
                exclusive: false
            });
        }

        /**
         * @ngdoc method
         * @methodOf player.notes.controller:iframeHighlight
         * @name addHighlight
         *
         * @description
         * # addHighlight
         * The `addHighlight` method
         *
         * @param {Object} highlight param
         */
        function addHighlight(highlight, index) {
            var doc = getContentDocument();

            var serialized = highlight.selection.split(/;/, 2);

            var base = doc.getElementById(serialized[0]) || doc;

            try {
                var selection = rangy.deserializeSelection(serialized[1], base);

                placeMark(highlight, selection, doc, index);

                selection.removeAllRanges();
            } catch (e) {
                //$log.debug('Failed to reapply highlight', JSON.stringify(highlight), e);
            }
        }

        /**
         * @ngdoc method
         * @methodOf player.notes.directive:iframeHighlight
         * @name onSelectionUpdate
         *
         * @description
         * # onSelectionUpdate
         * The `onSelectionUpdate` method
         *
         * @returns {Object} the onSelectionUpdate
         */
        function onSelectionUpdate() {
            var shown = vm.notesData.showNotes;
            notes.setInlineNotesVisibility(false);

            annotationUtil.removeAllHighlights();

            var selections = vm.data.selections;
            if (selections && vm.data.showHighlights) {
                lazy(selections).each(addHighlight);
            }

            notes.setInlineNotesVisibility(!shown);
        }
    }

})();
