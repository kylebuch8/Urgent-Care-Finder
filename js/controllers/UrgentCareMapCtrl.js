(function() {
	"use strict";

	angular.module("urgentCareFinder").controller("UrgentCareMapCtrl", ["$scope", function UrgentCareMapCtrl($scope) {
		var initMap = function() {
			/*
			 * the map is centered on an area near Jordan Lake
			 */
			var mapOptions = {
					center : new google.maps.LatLng(35.759573,-79.0193),
					zoom : 8,
					mapTypeId : google.maps.MapTypeId.ROADMAP
				},
				map = new google.maps.Map(document.getElementById("map"), mapOptions);

			/*
			 * listen for when a location is found. once we have a location
			 * center the map on that location. the data that is passed is a
			 * google maps LatLng object
			 */
			$scope.$on("LocationFound", function(event, latlng) {
				map.setZoom(12);
				map.setCenter(latlng);
			});
		};

		initMap();
	}]);
})();