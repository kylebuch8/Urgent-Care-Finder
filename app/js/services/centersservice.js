(function() {
	"use strict";

	/*
	 * we'll use this service to fetch all of the urgent care centers
	 * that are close to the location that is passed
	 *
	 * this service requires that a location object is passed to it
	 * in the following format:
	 *
	 * {
	 *   lat : xx,
	 *   lng : yy
	 * }
	 */
	angular.module("urgentCareFinder").factory("CentersService", ["$http", function($http) {
		var centers = [];

		var CentersService = {
			fetch : function(location) {
				var method = "GET",
					latlngStr = location.lat + "," + location.lng,
					url = "http://localhost:3000/centers/?latlng=" + latlngStr;

				$http({
					method : method,
					url : url
				}).success(function(data, status) {
					centers = data;
				}).error(function(data, status) {
					//console.log("error", status);
				});
			},
			setSelectedCenter : function(center) {
				CentersService.selectedCenter = center;
			},
			selectedCenter : null,
			centers : function() {
				return centers;
			}
		};

		return CentersService;
	}]);
})();