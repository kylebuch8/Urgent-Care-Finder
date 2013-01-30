(function() {
	"use strict";

	angular.module("urgentCareFinder").controller("UrgentCareMapCtrl", ["$scope", "$compile", "LocationService", "CentersService", function UrgentCareMapCtrl($scope, $compile, LocationService, CentersService) {
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
			 * watch for when a location is found. once we have a location
			 * center the map on that location. the data that is passed is a
			 * google maps LatLng object
			 */
			$scope.LocationService = LocationService;
			$scope.$watch("LocationService.location", function(newLocation, oldLocation, scope) {
				if (newLocation) {
					map.setZoom(12);
					map.setCenter(newLocation);
				}
			});

			/*
			 * use the CentersService to watch when we have data. we can populate
			 * the map with markers at this point.
			 */
			$scope.CentersService = CentersService;
			$scope.$watch("CentersService.centers", function(newCenters, oldCenters, scope) {
				if (newCenters.length > 0) {
					setMarkers(newCenters);
				}
			});

			$scope.$on("app:ResultListSelection", function(event, providerNumber) {
				for (var i = 0, length = $scope.markers.length; i < length; i += 1) {
					var center = $scope.markers[i].center;

					if (providerNumber === center.providerNo) {
						google.maps.event.trigger($scope.markers[i], "click", {
							marker : $scope.markers[i]
						});
						break;
					}
				}
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

				marker.center = center;
				$scope.markers.push(marker);

				/*
				 * listen for clicks on the markers
				 *
				 * if feel like i sold out here. i added the underscore
				 * library to handle the template instead of using the
				 * angularjs template.
				 *
				 * i could not figure out how to get this to work using purely
				 * angular. i opened a question on stackoverflow to try to get
				 * an answer.
				 *
				 * http://stackoverflow.com/questions/14490908/angularjs-google-maps-and-infowindows
				 */
				google.maps.event.addListener(marker, "click", function(event) {
					if ($scope.openInfoWindow) {
						$scope.openInfoWindow.close();
					}

					if (event.marker) {
						marker = event.marker;
						$scope.center = event.marker.center;
					} else {
						$scope.center = marker.center;
					}

					var template = _.template($("#infoWindowTmpl").html()),
						compiled = template($scope);

					var infoWindow = new google.maps.InfoWindow({
						content : compiled
					});

					infoWindow.open(map, marker);

					$scope.openInfoWindow = infoWindow;
				});
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