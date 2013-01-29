(function() {
	"use strict";

	angular.module("urgentCareFinder").controller("UrgentCareResultListCtrl", ["$scope", "CentersService", function UrgentCareResultListCtrl($scope, CentersService) {
		/*
		 * handles display of results from the places search
		 */
		
		/*
		 * use the CentersService and watch for when it changes.
		 * once it does change and have data, we'll set the $scope.results
		 * to the newCenters from the service
		 */
		$scope.CentersService = CentersService;
		$scope.$watch("CentersService.centers", function(newCenters, oldCenters, scope) {
			if (newCenters.length > 0) {
				$scope.results = newCenters;
			}
		});

		$scope.select = function(providerNumber) {
			$scope.$emit("ResultListSelection", providerNumber);
		};
	}]);
})();