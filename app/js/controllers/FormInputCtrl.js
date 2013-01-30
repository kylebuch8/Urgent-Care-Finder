(function() {
	"use strict";

	angular.module("urgentCareFinder").controller("FormInputCtrl", ["$scope", "LocationService", function FormInputCtrl($scope, LocationService) {
		/*
		 * build a places autocomplete that is powered by google
		 * https://developers.google.com/maps/documentation/javascript/places#places_autocomplete
		 *
		 * we'll restrict the autocomplete to the united states.
		 * if the user uses an autocompleted location, we'll need
		 * to figure out what to do with the place that is returned
		 */
		var initAutocomplete = function() {
			var element = $("#locationInput"),
				options = {
					componentRestrictions : {
						"country" : "us"
					}
				},
				autocomplete = new google.maps.places.Autocomplete(element[0], options);

			google.maps.event.addDomListener(element[0], "keydown", function(event) {
				if (event.keyCode == 13) {
					event.preventDefault();
				}
			});

			google.maps.event.addListener(autocomplete, "place_changed", function() {
				var place = autocomplete.getPlace(),
					position = null;
				
				if (place.geometry) {
					position = {
						coords : {
							latitude : place.geometry.location.lat(),
							longitude : place.geometry.location.lng()
						}
					};
				} else {
					position = {
						address : place.name
					};
				}

				LocationService.geocodePosition(position);
			});
		};

		initAutocomplete();
	}]);
})();