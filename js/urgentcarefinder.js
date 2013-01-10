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
			console.log("The location input form has been submitted");
		};
	}]);
})();