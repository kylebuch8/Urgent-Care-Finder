(function() {
	"use strict";

	angular.module("urgentCareFinder").factory("LocationService", function($rootScope) {
		var LocationService = {
			location : null,
			geocodePosition : geocodePosition
		};

		/*
		 * create a geocoder that we can use later
		 */
		var geocoder = new google.maps.Geocoder();

		/*
		 * check to see if we have geolocation
		 */
		if (Modernizr.geolocation) {
			navigator.geolocation.getCurrentPosition(geocodePosition, getPositionError);
		}

		function geocodePosition(position) {
			var request = null;

			if (position.address) {
				request = {
					address : position.address
				};
			} else {
				request = {
					location : new google.maps.LatLng(position.coords.latitude, position.coords.longitude)
				};

				LocationService.location = request.location;
				$rootScope.$apply();
			}

			geocoder.geocode(request, function(results, status) {
				if (status === google.maps.GeocoderStatus.OK) {
					/*
					 * if this is an address, we need to send the result to
					 * the map so it can be centered.
					 */
					if (request.address) {
						var locationObj = results[0].geometry.location,
							latlng = new google.maps.LatLng(locationObj.lat(), locationObj.lng());

						LocationService.location = latlng;
						$rootScope.$apply();
					}
				}
			});
		}

		function getPositionError(error) {

		}

		return LocationService;
	});
})();