(function() {
	"use strict";

	angular.module("urgentCareFinder").controller("UrgentCareResultListCtrl", ["$scope", function UrgentCareResultListCtrl($scope) {
		/*
		 * handles display of results from the places search
		 */
		
		/*
		 * listen for when the results list is updated
		 */
		$scope.$on("ResultsListUpdated", function(event, data) {
			$scope.results = data;
		});

		$scope.select = function(providerNumber) {
			$scope.$emit("ResultListSelection", providerNumber);
		};
	}]);
})();