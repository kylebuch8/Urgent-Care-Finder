// keeping stuff out of the global namespace
(function() {
	/*
	 * this sets it so angular will use our app module.
	 * we need ng-app="urgentCareFinder" in the opening
	 * <html> tag
	 */
	var app = angular.module("urgentCareFinder", []);

	/*
	 * by using the run function, we can get access to the
	 * applications $rootScope. here we can catch events as
	 * they are bubbled up
	 */
	app.run(function($rootScope) {
		/*
		 * listen for the LocationEntered event
		 */
		$rootScope.$on("LocationEntered", function() {
			console.log("this worked");
		});
	});

	// controller for the location input form
	app.controller("FormInput", ["$scope", function FormInput($scope) {
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