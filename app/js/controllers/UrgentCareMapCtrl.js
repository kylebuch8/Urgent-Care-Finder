(function() {
	"use strict";

	angular.module("urgentCareFinder").controller("UrgentCareMapCtrl", ["$scope", "$compile", function UrgentCareMapCtrl($scope, $compile) {
		var initMap = function() {
			$scope.markers = [];
			$scope.openInfoWindow = null;

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

			/*
			 * listen for when the results list is populated. we can populate
			 * the map with markers at this point
			 */
			$scope.$on("ResultsListUpdated", function(event, centers) {
				setMarkers(centers);
			});

			var setMarkers = function(centers) {
				/*
				 * delete any markers that might already be on the map
				 */
				if ($scope.markers.length > 0) {
					deleteMarkers();
				}

				for (var i in centers) {
					placeMarker(centers[i]);
				}
			};

			var placeMarker = function(center) {
				var marker = new google.maps.Marker({
					map : map,
					position : new google.maps.LatLng(center.location.latitude, center.location.longitude)
				});

				var infoWindow = new google.maps.InfoWindow();

				marker.center = center;
				$scope.markers.push(marker);

				/*
				 * listen for clicks on the markers
				 *
				 * this was helpful in learning how to do this
				 * http://plnkr.co/edit/zGDdw1?p=preview
				 */
				google.maps.event.addListener(marker, "click", (function(marker, $scope) {
					return function() {
						/*
						 * close the open infowindow if there is one
						 */
						if ($scope.openInfoWindow) {
							$scope.openInfoWindow.close();
						}

						/*
						 * build the template, pass in the data and then
						 * open the infowindow
						 */
						$scope.center = marker.center;

						var content = '<div id="infowindow_content" ng-include src="\'/infowindow.html\'"></div>',
							compiled = $compile(content)($scope);

						$scope.$apply();
						infoWindow.setContent(compiled[0].innerHTML);
						infoWindow.open(map, marker);

						$scope.openInfoWindow = infoWindow;
					};
				})(marker, $scope));
			};

			var deleteMarkers = function() {
				for (var i in $scope.markers) {
					$scope.markers[i].setMap(null);
				}

				$scope.markers.length = 0;
			};
		};

		initMap();
	}]);
})();