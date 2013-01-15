(function() {
	"use strict";

	angular.module("urgentCareFinder").controller("FormInputCtrl", ["$scope", function FormInputCtrl($scope) {
		/*
		 * build a places autocomplete that is powered by google
		 * https://developers.google.com/maps/documentation/javascript/places#places_autocomplete
		 *
		 * we'll restrict the autocomplete to the united states.
		 * if the user uses an autocompleted location, we'll need
		 * to figure out what to do with the place that is returned
		 */
		var initAutocomplete = function() {
			var input = document.getElementById("locationInput"),
				options = {
					componentRestrictions : {
						"country" : "us"
					}
				},
				autocomplete = new google.maps.places.Autocomplete(input, options);

			google.maps.event.addListener(autocomplete, "place_changed", function() {
				var place = autocomplete.getPlace();
				console.log("place", place);
			});
		};

		$scope.submit = function() {
			/*
			 * if we have a location, we'll emit an event so anyone
			 * that is listening can do something with the data
			 */
			if (this.location !== "") {
				$scope.$emit("LocationEntered", this.location);
			}
		};

		initAutocomplete();
	}]);
})();