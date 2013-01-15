// keeping stuff out of the global namespace
(function() {
	/*
	 * this sets it so angular will use our app module.
	 * we need ng-app="urgentCareFinder" in the opening
	 * <html> tag
	 */
	var app = angular.module("urgentCareFinder", []).

	/*
	 * by using the run function, we can get access to the
	 * applications $rootScope. here we can catch events as
	 * they are bubbled up
	 */
	run(function($rootScope) {
		/*
		 * create a geocoder that we can use later
		 */
		var geocoder = new google.maps.Geocoder();

		/*
		 * listen for the LocationEntered event
		 */
		$rootScope.$on("LocationEntered", function() {
			console.log("this worked");
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

		/*
		 * try to get the location from the browser
		 */
		var initGeolocation = function() {
			/*
			 * check to see if we have geolocation
			 */
			if (Modernizr.geolocation) {
				navigator.geolocation.getCurrentPosition(geocodePosition, getPositionError);
			}
		};

		var geocodePosition = function(position) {
			var request = null;

			if (position.address) {
				request = {
					address : position.address
				};
			} else {
				request = {
					location : new google.maps.LatLng(position.coords.latitude, position.coords.longitude)
				};

				$rootScope.$broadcast("LocationFound", request.location);
			}

			geocoder.geocode(request, function(results, status) {
				if (status === google.maps.GeocoderStatus.OK) {
					console.log(results);
				}
			});
		};

		var getPositionError = function(error) {
			console.log(error);
		};

		$(window).resize(resizePanes);
		resizePanes();
		initGeolocation();
	});
})();