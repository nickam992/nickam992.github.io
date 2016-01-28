(function() {
    'use strict';

    angular
        .module('player.notes')
        .factory('heatMap', heatMapFactory);

    heatMapFactory.$inject = [
        '$rootScope',
        '$location',
        '$timeout',
        '$',
        'firebase',
        'lazy',
        'auth',
        'iframe',
        'annotationUtil',
    ];

    /**
     * @ngdoc service
     * @name player.notes.factory:heatMap
     * @requires jQuery
     * @requires $location
     * @requires $timeout
     * @requires $q
     * @requires firebase
     * @requires lazy
     * @requires auth
     * @requires iframe
     * @requires dialogHelper
     * @requires annotationUtil
     * @description
     *
     * The `heatMap` factory stores highlights for a user.
     *
     * @returns { Object } Return object
     */
    function heatMapFactory(
        $rootScope,
        $location,
        $timeout,
        $,
        firebase,
        lazy,
        auth,
        iframe,
        annotationUtil) {

        /**
         * @ngdoc property
         * @name colors
         * @propertyOf player.notes.factory:heatMap
         * @description
         * The colors to be used with a hot spot
         */
        var colors = [
            'rgb(249, 229, 102)',
            'rgb(245, 199, 97)',
            'rgb(245, 170, 86)',
            'rgb(239, 140, 83)',
            'rgb(238, 109, 80)',
            'rgb(236, 90, 77)',
        ];

        var data = angular.extend(annotationUtil.data, {
            heatMapColors: colors,
        });

        var factory = {
            data: data,

            summarizeHighlightSets: summarizeHighlightSets,
            onSelection: onSelection,

            // Testing
            buildIntervals: buildIntervals,
            calculateHeatMapRange: calculateHeatMapRange,
            pullHighlights: pullHighlights,
        };

        pullHighlights();

        return factory;

        /////////////

        /**
         * @ngdoc method
         * @methodOf player.notes.factory:heatMap
         * @name firebaseObjectToArray
         *
         * @description
         * # firebaseObjectToArray
         * The `firebaseObjectToArray` method
         *
         * @param {Object} object param
         * @param {Object} key param
         * @returns {Object} the firebaseObjectToArray
         */
        function firebaseObjectToArray(object, key) {
            return angular.extend({$id: key}, object);
        }

        /**
         * @ngdoc method
         * @methodOf player.notes.factory:heatMap
         * @name getUserKeys
         *
         * @description
         * # getUserKeys
         * The `getUserKeys` method
         *
         * @returns {Object} the userKeys
         */
        function getUserKeys() {
            return lazy(Object.keys(factory.data.userSelections))
                .filter(function(key) {
                    return key && key.indexOf('user:') === 0;
                }).toArray();
        }

        /**
         * @ngdoc method
         * @methodOf player.notes.factory:heatMap
         * @name summarizeUserHighlights
         *
         * @description
         * # summarizeUserHighlights
         * The `summarizeUserHighlights` method
         *
         * @param {Object} $doc param
         * @param {Object} selections param
         * @returns {Object} the summarizeUserHighlights
         */
        function summarizeUserHighlights($doc, selections) {
            var userSelections = lazy(selections).map(firebaseObjectToArray).toArray();

            factory.data.selections = userSelections;
            $rootScope.$apply();

            return annotationUtil.reserializeHighlights($doc, userSelections);
        }

        /**
         * @ngdoc method
         * @methodOf player.notes.factory:heatMap
         * @name sanitizeHighlightSummary
         *
         * @description
         * # sanitizeHighlightSummary
         * The `sanitizeHighlightSummary` method
         *
         * @param {Object} summary param
         * @param {Object} key param
         * @returns {Object} the sanitizeHighlightSummary
         */
        function sanitizeHighlightSummary(summary, key) {
            return {
                id:   key,
                start: summary.range.start,
                end:   summary.range.end
            };
        }

        /**
         * @ngdoc method
         * @methodOf player.notes.factory:heatMap
         * @name buildIntervals
         *
         * @description
         * # buildIntervals
         * The `buildIntervals` method
         *
         * @param {Object} rangeSeq param
         * @returns {Object} the buildIntervals
         */
        function buildIntervals(rangeSeq) {
            var offset = iframe.getContentOffset();

            var starts = rangeSeq.pluck('start').map(function(index) {
                return {
                    start: true,
                    index: index - offset
                };
            });
            var ends = rangeSeq.pluck('end').map(function(index) {
                return {
                    start: false,
                    index: index - offset
                };
            });

            var open = [];
            var closed = [];
            starts.concat(ends).sortBy('index').each(function(boundary) {
                if (boundary.start) {
                    open.push({
                        start: boundary.index
                    });
                }
                else if (open.length > 0) {
                    var interval = open.pop();
                    interval.end = boundary.index;
                    if (interval.end - interval.start > 0) {
                        interval.count = open.length + 1;
                        closed.push(interval);
                    }
                }
            });

            return closed;
        }

        /**
         * @ngdoc method
         * @methodOf player.notes.factory:heatMap
         * @name buildHighlightSummaries
         *
         * @description
         * # buildHighlightSummaries
         * The `buildHighlightSummaries` method
         *
         * @param {Object} users param
         * @returns {Object} the buildHighlightSummaries
         */
        function buildHighlightSummaries($doc, users) {
            var summaries = lazy(users)
                .map(function(key) {
                    return factory.data.userSelections[key];
                })
                .map(angular.bind(factory, summarizeUserHighlights, $doc))
                .reduce(angular.extend);

            summaries = lazy(summaries).map(sanitizeHighlightSummary).filter(function (boundary) {
                return boundary.start !== boundary.end;
            });

            return buildIntervals(summaries);
        }

        /**
         * @ngdoc method
         * @methodOf player.notes.factory:heatMap
         * @name calculateHeatMapRange
         *
         * @description
         * # calculateHeatMapRange
         * The `calculateHeatMapRange` method updates the base and scale of the heat map range
         */
        function calculateHeatMapRange() {
            if (factory.data.heatMap.selections.length > 0) {
                var first = factory.data.heatMap.selections[0];
                var base = first.count, max = first.count;
                lazy(factory.data.heatMap.selections)
                    .pluck('count')
                    .each(function (count) {
                        base = Math.min(base, count);
                        max = Math.max(max, count);
                    });
                factory.data.heatMap.heatMapBaseValue = base;
                factory.data.heatMap.heatMapScale = 1.0 * colors.length /
                    Math.max(max - base, colors.length);
            }
        }

        /**
         * @ngdoc method
         * @methodOf player.notes.factory:heatMap
         * @name summarizeHighlightSets
         *
         * @description
         * # summarizeHighlightSets
         * The `summarizeHighlightSets` method
         */
        function summarizeHighlightSets() {
            if (!auth.isAdministrator()) {
                return;
            }

            // make sure we're in highlight mode and save off the current highlights
            var baseSelections = factory.data.selections;
            factory.data.showHeatMap = false;
            factory.data.showHighlights = true;
            $rootScope.$apply();

            var $doc = $(iframe.getIframe().contentDocument);

            var users = getUserKeys();

            factory.data.heatMap.users  = users.length;
            factory.data.heatMap.selections = buildHighlightSummaries($doc, users);

            calculateHeatMapRange();

            factory.data.heatMap.$save();

            // Reset highlights and switch to view heatMap
            factory.data.selections = baseSelections;
            factory.data.showHeatMap = true;
            factory.data.showHighlights = false;
            $rootScope.$apply();
        }

        /**
         * @ngdoc method
         * @methodOf player.notes.factory:heatMap
         * @name pullHighlights
         *
         * @description
         * # pullHighlights
         * The `pullHighlights` method
         */
        function pullHighlights() {
            if (!auth.ltiContext) {
                return;
            }
            var userSelections = false;
            if (auth.isAdministrator()) {
                factory.data.userSelectionsRef = firebase.getFirebaseRef([
                        'selections',
                        $location.path()
                    ].join('/'));
                userSelections = firebase.$firebaseObject(factory.data.userSelectionsRef);
            }

            factory.data.heatMapRef = firebase.getFirebaseRef([
                    'heatmap',
                    $location.path()
                ].join('/'));
            var heatMap = firebase.$firebaseObject(factory.data.heatMapRef);

            // The object starts out empty, don't save it until it has a chance to fill
            $timeout(function() {
                factory.data.userSelections = userSelections;
                factory.data.heatMap = heatMap;
            }, 0);
        }

        /**
         * @ngdoc method
         * @methodOf player.notes.factory:heatMap
         * @name onSelection
         *
         * @description
         * # onSelection
         * The `onSelection` method
         *
         * @param {Object} event param
         * @param {Object} hotSpot param
         */
        function onSelection(event, hotSpot) {
        }
    }

})();
