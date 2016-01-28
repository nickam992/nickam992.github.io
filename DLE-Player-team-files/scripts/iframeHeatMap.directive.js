(function() {
    /**
     * @ngdoc directive
     * @name player.notes.directive:iframeHeatMap
     * @description
     *
     * The `iframeHeatMap` directive removes scrolling from an iframe by scaling it to its
     * content
     *
     * @returns { Object } Return object {link, restrict: 'A'}
     */
    'use strict';

    angular
        .module('player.layout')
        .directive('iframeHeatMap', iframeHeatMap);

    iframeHeatMap.$inject = [];

    function iframeHeatMap () {
        var vm;

        var directive = {
            restrict: 'A',
            link: link,
            controller: heatMapController,
            controllerAs: 'hm',
            bindToController: true
        };
        return directive;

        //////////////////////////

        /**
         * @ngdoc method
         * @methodOf player.notes.directive:iframeHeatMap
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
            vm = scope.hm;

            vm.onReady(element);
        }
    }

    heatMapController.$inject = [
        '$log',
        '$scope',
        'lazy',
        'rangy',
        'orchestration',
        'heatMap',
        'annotationUtil',
        'iframe',
        'notes',
    ];

    /**
     * @ngdoc controller
     * @name player.notes.controller:iframeHeatMap
     * @requires $log
     * @requires $scope
     * @requires $timeout
     * @requires lazy
     * @requires rangy
     * @requires orchestration
     * @requires heatMap
     *
     * @description
     *  Functionality backing the instructorNotes directive. Includes navigation and informational
     *  interfaces
     */
    function heatMapController(
        $log,
        $scope,
        lazy,
        rangy,
        orchestration,
        heatMap,
        annotationUtil,
        iframe,
        notes) {

        var element;

        /* jshint validthis: true */
        var vm = this;
        vm.data = heatMap.data;

        vm.onReady = onReady;
        vm.onHeatMapUpdate = onHeatMapUpdate;

        // orchestration listeners
        vm.iframeLoaded = iframeLoaded;

        // Testing
        vm.onMouseup = onMouseup;
        vm.hotSpotClasses = hotSpotClasses;
        vm.addHotSpot = addHotSpot;

        orchestration.registerDelegate(vm);

        ////////////

        /**
         * @ngdoc method
         * @methodOf player.notes.controller:iframeHeatMap
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
         * @methodOf player.notes.controller:iframeHeatMap
         * @name onReady
         *
         * @description
         * # onReady
         * The `onReady` method is called when the directive is linked to an element

         * @param {Object} elem param
         */
        function onReady(elem) {
            element = elem;
            onHeatMapUpdate();
        }

        /**
         * @ngdoc method
         * @methodOf player.notes.controller:iframeHeatMap
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

            // Need to watch a sub-part of the object because some browsers
            //      *cough* firefox and IE *cough*
            // don't deal well with firebase object comparisons
            $scope.$watch('hm.data.heatMap.selections', onHeatMapUpdate, true);
            $scope.$watch('hm.data.showHeatMap', onHeatMapUpdate);
        }

        /**
         * @ngdoc method
         * @methodOf player.notes.controller:iframeHeatMap
         * @name onMouseup
         *
         * @description
         * # onMouseup
         * The `onMouseup` method
         *
         * @param {Object} event param
         */
        function onMouseup(event) {
            return heatMap.onSelection(event,
                annotationUtil.getSelectedHotSpot(event, vm.data.heatMap));
        }

        /**
         * @ngdoc method
         * @methodOf player.notes.directive:iframeHeatMap
         * @name hotSpotClasses
         *
         * @description
         * # hotSpotClasses
         * The `hotSpotClasses` method
         *
         * @param {Object} hotSpot param
         * @returns {Object} the hotSpotClasses
         */
        function hotSpotClasses(hotSpot) {
            var classes = annotationUtil.hotSpotClass;
            if (hotSpot.count >= vm.data.heatMap.heatMapBaseValue) {
                var colorIndex = vm.data.heatMap.heatMapScale *
                    (hotSpot.count - vm.data.heatMap.heatMapBaseValue) + 1;
                return classes + ' ' + annotationUtil.hotSpotClass + '-' +
                    Math.floor(Math.min(colorIndex, vm.data.heatMapColors.length));
            }
            return classes;
        }

        /**
         * @ngdoc method
         * @methodOf player.notes.directive:iframeHeatMap
         * @name buildHighlighter
         *
         * @description
         * # buildHighlighter
         * The `buildHighlighter` method
         *
         * @param {Object} hotSpot param
         * @param {Object} doc param
         * @param {Object} index param
         * @returns {Object} the buildHighlighter
         */
        function buildHighlighter(hotSpot, doc, index) {
            var highlighter = rangy.createHighlighter(doc);

            var classes = hotSpotClasses(hotSpot);

            highlighter.addClassApplier(rangy.createClassApplier(
                annotationUtil.hotSpotClass, {
                    ignoreWhiteSpace: true,
                    elementTagName: 'mark',
                    tagNames: ['mark'],
                    elementAttributes: {
                        id: 'hotspot-' + index,
                        'data-hot-spot-index': index,
                    },
                    elementProperties: {
                        className: classes,
                    }
                }));

            return highlighter;
        }

        /**
         * @ngdoc method
         * @methodOf player.notes.controller:iframeHeatMap
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
        function placeMark(hotSpot, range, doc, index) {
            var highlighter = buildHighlighter(hotSpot, doc, index);

            highlighter.highlightRanges(annotationUtil.hotSpotClass, [range], {
                exclusive: false
            });
        }

        /**
         * @ngdoc method
         * @methodOf player.notes.controller:iframeHeatMap
         * @name addHeatMap
         *
         * @description
         * # addHeatMap
         * The `addHeatMap` method
         *
         * @param {Object} highlight param
         */
        function addHotSpot(hotSpot, index) {
            var doc = getContentDocument();
            var offset = iframe.getContentOffset();

            try {
                var range = rangy.createRange(doc);

                var bookmark = range.getBookmark(doc);
                bookmark.start = hotSpot.start + offset;
                bookmark.end = hotSpot.end + offset;
                range.moveToBookmark(bookmark);

                placeMark(hotSpot, range, doc, index);
            } catch (e) {
                $log.error('Failed to apply hotSpot', JSON.stringify(hotSpot), e);
            }
        }

        /**
         * @ngdoc method
         * @methodOf player.notes.directive:iframeHeatMap
         * @name onHeatMapUpdate
         *
         * @description
         * # onHeatMapUpdate
         * The `onHeatMapUpdate` method
         *
         * @returns {Object} the onHeatMapUpdate
         */
        function onHeatMapUpdate() {
            var shown = notes.data.showNotes;
            notes.setInlineNotesVisibility(false);

            annotationUtil.removeHeatMap();

            var hotSpots = vm.data.heatMap;
            if (hotSpots && vm.data.showHeatMap) {
                lazy(hotSpots.selections).each(addHotSpot);
            }

            notes.setInlineNotesVisibility(!shown);
        }
    }

})();
