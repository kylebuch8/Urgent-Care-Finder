// keeping stuff out of the global namespace
(function() {
	/*
	 * this sets it so angular will use our app module.
	 * we need ng-app="urgentCareFinder" in the opening
	 * <html> tag
	 */
	var app = angular.module("urgentCareFinder", [])

	/*
	 * by using the run function, we can get access to the
	 * applications $rootScope. here we can catch events as
	 * they are bubbled up
	 */
	.run(function($rootScope, LocationService, CentersService) {
		/*
		 * watch for when a location is found. this can happen either through
		 * geolocation or when a user enters a location
		 */
		$rootScope.LocationService = LocationService;
		$rootScope.$watch("LocationService.location", function(newLocation, oldLocation, scope) {
			if (newLocation) {
				CentersService.fetch({
					lat : newLocation.lat(),
					lng : newLocation.lng()
				});
			}
		});

		/*
		 * listen for when a result list selection has been made
		 */
		$rootScope.$on("ResultListSelection", function(event, providerNumber) {
			$rootScope.$broadcast("app:ResultListSelection", providerNumber);
		});

		/*
		 * we need to set the height of the left and right panes
		 * and listen for resize events in the browser so we can
		 * readjust the height
		 */
		var resizePanes = function() {
			var $map = $("#map"),
				$footer = $("footer"),
				mapOffset = $map.offset().top,
				footerHeight = $footer.height();

			$map.height($(window).height() - mapOffset - footerHeight);
			$("#results").height($(window).height() - mapOffset - footerHeight);
		};

		$(window).resize(resizePanes);
		resizePanes();
	})
	/*
	 * create a filter to remove all dashes for phone
	 * numbers and put a 1 at the beginning of the string.
	 * this is needed for the phone buttons href
	 *
	 * tel://xxx-yyy-zzzz
	 *
	 * becomes
	 *
	 * tel://1xxxyyyzzzz
	 */
	.filter("phone", function() {
		return function(phone) {
			phone = phone.replace(/[- ()]/g, "");

			return "1" + phone;
		};
	});
})();