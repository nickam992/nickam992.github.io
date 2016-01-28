(function() {
    'use strict';

    angular
        .module('player.notes')
        .factory('annotationUtil', annotationUtil);

    annotationUtil.$inject = [
        '$document',
        '$log',
        'lazy',
        'rangy',
        'iframe',
    ];

    /**
     * @ngdoc service
     * @name player.notes.factory:annotationUtil
     * @requires jQuery
     * @requires $document
     * @requires $log
     * @requires rangy
     * @requires lazy
     * @requires iframe
     * @description
     *
     * The `annotationUtil` provides annotation manipulation functionality for notes and highlights.
     *
     * @returns { Object } Return object
     */
    function annotationUtil(
        $document,
        $log,
        lazy,
        rangy,
        iframe) {

        /**
         * @ngdoc property
         * @name parentClass
         * @propertyOf player.notes.factory:annotationUtil
         * @description
         * The class that indicates a mark is either a highlight or a note
         */
        var parentClass = 'annotation';

        /**
         * @ngdoc property
         * @name highlightClass
         * @propertyOf player.notes.factory:annotationUtil
         * @description
         * The class that indicates a mark is a highlight
         */
        var highlightClass = 'highlight';

        /**
         * @ngdoc property
         * @name noteClass
         * @propertyOf player.notes.factory:annotationUtil
         * @description
         * The class that indicates a mark is a note
         */
        var noteClass = 'note';

        /**
         * @ngdoc property
         * @name hotSpotClass
         * @propertyOf player.notes.factory:annotationUtil
         * @description
         * The class that indicates a mark is a hotSpot
         */
        var hotSpotClass = 'hotSpot';

        var data = {
            showHighlights: true,
            showHeatMap: false
        };

        var factory = {
            data: data,

            // Properties
            parentClass: parentClass,
            highlightClass: highlightClass,
            noteClass: noteClass,
            hotSpotClass: hotSpotClass,

            // Methods
            getSelection: getSelection,
            removeSelection: removeSelection,
            clearSelection: clearSelection,
            removeAllHighlights: removeAllHighlights,
            getSelectedHighlight: getSelectedHighlight,
            rangeForHighlight: rangeForHighlight,
            reserializeHighlights: reserializeHighlights,

            removeHeatMap: removeHeatMap,
            getSelectedHotSpot: getSelectedHotSpot,

            // Testing
            removeMark: removeMark,
            rangeForMarks: rangeForMarks,
        };

        return factory;

        /////////////

        /**
         * @ngdoc method
         * @methodOf player.notes.factory:annotationUtil
         * @name getIframeContentDocument
         *
         * @description
         * # getIframeContentDocument
         * The `getIframeContentDocument` method
         *
         * @returns {Object} the contentDocument of the attached iframe
         */
        function getIframeContentDocument() {
            return iframe.getIframe().contentDocument;
        }

        /**
         * @ngdoc method
         * @methodOf player.notes.factory:annotationUtil
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
         * @methodOf player.notes.factory:annotationUtil
         * @name getBase
         *
         * @description
         * # getBase
         * The `getBase` method
         *
         * @param {Object} range param
         * @returns {Object} the base
         */
        function getBase(range) {
            var base = range.commonAncestorContainer;
            var baseParent = base.parentNode || base.parentElement; // Need element for phantomJS
            while (!base.id && baseParent) {
                base = baseParent;
                baseParent = base.parentNode || base.parentElement; // Need element for phantomJS
            }
            return base;
        }

        /**
         * @ngdoc method
         * @methodOf player.notes.factory:annotationUtil
         * @name removeMark
         *
         * @description
         * # removeMark
         * The `removeMark` method
         *
         * @param {Object} mark param
         */
        function removeMark(doc, mark) {
            var base = mark ? mark.parentNode : false;
            if (base) {
                var range = rangy.createRange(doc);
                range.selectNode(mark);
                mark.outerHTML = mark.innerHTML;
                try {
                    range.normalizeBoundaries();
                } catch (e) {
                    //$log.debug('Failed to normalize', mark, e);
                }
                base.normalize();
            }
        }

        /**
         * @ngdoc method
         * @methodOf player.notes.factory:annotationUtil
         * @name getFirstMark
         *
         * @description
         * # getFirstMark
         * The `getFirstMark` method
         *
         * @param {Object} node param
         * @param {Object} markClass param
         * @returns {Object} the firstMark
         */
        function getFirstMark(node, markClass) {
            return node.getElementsByClassName(markClass)[0];
        }

        /**
         * @ngdoc method
         * @methodOf player.notes.factory:annotationUtil
         * @name removeAllHighlights
         *
         * @description
         * # removeAllHighlights
         * The `removeAllHighlights` method
         */
        function removeAllHighlights() {
            var doc = getIframeContentDocument();
            lazy.generate(angular.bind(factory, getFirstMark, doc, parentClass),
                          doc.getElementsByClassName(parentClass).length)
                .each(angular.bind(factory, removeMark, doc));
        }

        /**
         * @ngdoc method
         * @methodOf player.notes.factory:annotationUtil
         * @name getMarksForSelection
         *
         * @description
         * # getMarksForSelection
         * The `getMarksForSelection` method
         *
         * @param {Object} $doc param
         * @param {Object} id param
         * @returns {Object} the marksForSelection
         */
        function getMarksForSelection($doc, id) { // requires jquery
            var annotations = $doc[0].getElementsByClassName(parentClass);

            return lazy(Array.prototype.slice.apply(annotations))
                .filter(function (annotation) { return annotation.id === id; }).toArray();
        }

        /**
         * @ngdoc method
         * @methodOf player.notes.factory:annotationUtil
         * @name rangeForMarks
         *
         * @description
         * # rangeForMarks
         * The `rangeForMarks` method
         *
         * @param {Object} $doc param
         * @param {Object} marks param
         * @returns {Object} the rangeForMarks
         */
        function rangeForMarks($doc, marks) {
            var range = rangy.createRange($doc[0]);
            if (marks && marks.length > 0) {
                range.selectNode(marks[0]);
                lazy(marks).each(angular.bind(range, range.setEndAfter));
            }
            return range;
        }

        /**
         * @ngdoc method
         * @methodOf player.notes.factory:annotationUtil
         * @name rangeForHighlight
         *
         * @description
         * # rangeForHighlight
         * The `rangeForHighlight` method
         *
         * @param {Object} $doc param
         * @param {Object} highlight param
         * @returns {Object} the rangeForHighlight
         */
        function rangeForHighlight($doc, highlight) {
            return rangeForMarks($doc, getMarksForSelection($doc, highlight.$id));
        }

        /**
         * @ngdoc method
         * @methodOf player.notes.factory:annotationUtil
         * @name reserializeHighlight
         *
         * @description
         * # reserializeHighlight
         * The `reserializeHighlight` method
         *
         * @param {Object} $doc param
         * @param {Object} highlight param
         * @returns {Object} the reserializeHighlight
         */
        function reserializeHighlight($doc, highlight) {
            var range = rangeForHighlight($doc, highlight);
            return {
                $id: highlight.$id,
                // TODO: Sometimes, this produces bad ranges and they get saved, figure out why
                range: range.getBookmark($doc[0]),
                base: highlight.selection.split(/;/)[0]
            };
        }

        /**
         * @ngdoc method
         * @methodOf player.notes.factory:annotationUtil
         * @name reserializeHighlights
         *
         * @description
         * # reserializeHighlights
         * The `reserializeHighlights` method
         *
         * @param {Object} selections param
         * @returns {Object} the reserialized highlights
         */
        function reserializeHighlights($doc, highlights) {
            return lazy(highlights)
                .map(angular.bind(factory, reserializeHighlight, $doc))
                .indexBy('$id')
                .toObject();
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
        function buildHighlighter(id, doc, index) {
            var highlighter = rangy.createHighlighter(doc);

            highlighter.addClassApplier(rangy.createClassApplier('hidden' + id, {
                ignoreWhiteSpace: true,
                elementTagName: 'mark',
                tagNames: ['mark'],
                elementAttributes: {
                    id: id,
                    'data-highlight-id': id,
                    'data-highlight-index': index,
                },
                elementProperties: {
                    className: 'hidden ' + parentClass
                }
            }));

            return highlighter;
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
        function addStubMark(id, range, index) {
            var doc = getIframeContentDocument();
            var highlighter = buildHighlighter(id, doc, index);

            highlighter.highlightRanges('hidden' + id, [range], {
                exclusive: false
            });
        }

        /**
         * @ngdoc method
         * @methodOf player.notes.factory:annotationUtil
         * @name updateSelectionPaths
         *
         * @description
         * # updateSelectionPaths
         * The `updateSelectionPaths` method
         *
         * @param {Object} saved param
         * @param {Object} selection param
         * @param {Object} index param
         * @returns {Object} the updateSelectionPaths
         */
        function updateSelectionPaths(saved, selection, index) {
            var doc = getIframeContentDocument();
            var indices = saved[selection.$id];
            var highlighter = buildHighlighter(selection.$id, doc, index);

            try {
                var range = rangy.createRange(doc);
                range.moveToBookmark(indices.range);
                var base = getBase(range);

                var serialized = rangy.serializeRange(range, true, base);

                addStubMark(selection.$id, range, index);

                selection.selection = base.id + ';' + serialized;
            } catch (e) {
                $log.debug('Failed to reapply temp highlight', JSON.stringify(serialized), e);
            }

            return selection;
        }

        /**
         * @ngdoc method
         * @methodOf player.notes.factory:annotationUtil
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
            var doc = getIframeContentDocument();

            if (selection && doc) {
                var $doc = angular.element(doc);

                // Serialize all existing highlights as page offsets
                var saved = reserializeHighlights($doc, factory.data.selections);

                // remove all the marks
                removeAllHighlights();

                // update each mark in turn and add stubs
                var updates = lazy(factory.data.selections)
                    .reject({$id: selection.$id})
                    .map(angular.bind(factory, updateSelectionPaths, saved))
                    .toArray();

                // remove all the stubs
                removeAllHighlights();

                return updates;
            }

            return [];
        }

        /**
         * @ngdoc method
         * @methodOf player.notes.factory:annotationUtil
         * @name getActiveSelection
         *
         * @description
         * # getActiveSelection
         * The `getActiveSelection` method
         *
         * @returns {Object} the activeSelection
         */
        function getActiveSelection() {
            var doc = getIframeContentDocument();
            if (!doc) {
                return null;
            }

            var docSelection = rangy.getSelection(doc);

            return docSelection && !docSelection.isCollapsed ? docSelection : rangy.getSelection();
        }

        /**
         * @ngdoc method
         * @methodOf player.notes.factory:annotationUtil
         * @name getSelection
         *
         * @description
         * # getSelection
         * The `getSelection` method
         *
         * @returns {Object} the selection
         */
        function getSelection() {
            var selection = getActiveSelection();

            if (!selection || selection.isCollapsed) {
                return null;
            }

            var base = getBase(selection.getRangeAt(0));

            return {
                // TODO: Change to false when/if checksums are consistent
                selection: base.id + ';' + rangy.serializeSelection(selection, true , base),
                text: selection.text(),
                html: selection.toHtml(),
            };
        }

        /**
         * @ngdoc method
         * @methodOf player.notes.factory:annotationUtil
         * @name clearSelection
         *
         * @description
         * # clearSelection
         * The `clearSelection` method
         *
         * @returns {Object} the clearSelection
         */
        function clearSelection() {
            var selection = getActiveSelection();
            if (selection) {
                selection.removeAllRanges();
            }
        }

        /**
         * @ngdoc method
         * @methodOf player.notes.factory:annotationUtil
         * @name isAnnotation
         *
         * @description
         * # isAnnotation
         * The `isAnnotation` method
         *
         * @param {Object} element param
         * @returns {Object} the annotation
         */
        function isAnnotation(element) {
            return element && element.classList.contains(parentClass);
        }

        /**
         * @ngdoc method
         * @methodOf player.notes.factory:annotationUtil
         * @name getSelectedHighlight
         *
         * @description
         * # getSelectedHighlight
         * The `getSelectedHighlight` method walks up from the target of an event to find the
         * topmost mark tag which is the "innermost" annotation
         *
         * @param {Object} event param
         * @returns {Object} the selectedHighlight
         */
        function getSelectedHighlight(event, selections) {
            var mark = event.target;
            while (isAnnotation(mark.parentElement)) {
                mark = mark.parentElement;
            }
            if (isAnnotation(mark)) {
                return getSelectionById(mark.id);
            }
            return undefined;
        }

        /**
         * @ngdoc method
         * @methodOf player.notes.factory:annotationUtil
         * @name isHotSpot
         *
         * @description
         * # isHotSpot
         * The `isHotSpot` method
         *
         * @param {Object} element param
         * @returns {Object} the hotSpot
         */
        function isHotSpot(element) {
            return element && element.classList.contains(hotSpotClass);
        }

        /**
         * @ngdoc method
         * @methodOf player.notes.factory:annotationUtil
         * @name getSelectedHotSpot
         *
         * @description
         * # getSelectedHotSpot
         * The `getSelectedHotSpot` method walks up from the target of an event to find the
         * topmost mark tag which is the "innermost" annotation
         *
         * @param {Object} event param
         * @returns {Object} the selectedHotSpot
         */
        function getSelectedHotSpot(event, hotSpots) {
            var mark = event.target;
            while (isHotSpot(mark.parentElement)) {
                mark = mark.parentElement;
            }
            if (isHotSpot(mark)) {
                return hotSpots[mark.id];
            }
            return undefined;
        }

        /**
         * @ngdoc method
         * @methodOf player.notes.factory:annotationUtil
         * @name removeHeatMap
         *
         * @description
         * # removeHeatMap
         * The `removeHeatMap` method
         */
        function removeHeatMap() {
            var doc = getIframeContentDocument();
            lazy.generate(angular.bind(factory, getFirstMark, doc, hotSpotClass),
                          doc.getElementsByClassName(hotSpotClass).length)
                .each(angular.bind(factory, removeMark, doc));
        }
    }

})();
