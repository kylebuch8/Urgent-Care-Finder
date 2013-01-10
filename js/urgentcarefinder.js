// keeping stuff out of the global namespace
(function() {
	/*
	 * this sets it so angular will use our app module.
	 * we need ng-app="urgentCareFinder" in the opening
	 * <html> tag
	 */
	var app = angular.module("urgentCareFinder", []);

	// controller for the location input form
	app.controller("FormInput", ["$scope", function FormInput($scope) {
		$scope.submit = function() {
			/*
			 * if we have a location, we'll emit an event so anyone
			 * that is listening can do something with the data
			 */
			if (this.location !== "") {
				$scope.$emit("LocationEntered", this.location);
			}
		};
	}]);
})();