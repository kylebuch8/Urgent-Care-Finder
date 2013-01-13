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

	app.controller("UrgentCareResultListCtrl", ["$scope", function UrgentCareResultListCtrl($scope) {
		/*
		 * handles display of results from the places search
		*/
		$scope.results = [ /*
			{"provider_id":498228,"name":"Haymount Urgent Care PC","phone_number":"(910) 484-1210","street_address1":"1909 Bragg Blvd.","street_address2":"Suite 94","city":"Fayetteville","state_code":"NC","zip_code":"28303","latitude":35.0689414,"longitude":-78.9102155,"handicap_accessible":true},
			{"provider_id":498754,"name":"Roxboro Med Access PLLC","phone_number":"(336) 330-0400","street_address1":"3762 Durham Rd.","street_address2":"Suite A","city":"Roxboro","state_code":"NC","zip_code":"27573","latitude":36.341315,"longitude":-78.982451,"handicap_accessible":true},
			{"provider_id":505890,"name":"Duke Urgent Care Knightdale","phone_number":"(919) 232-5205","street_address1":"162 Legacy Oaks Drive","street_address2":"Suite 101","city":"Knightdale","state_code":"NC","zip_code":"27545","latitude":35.797663,"longitude":-78.517647,"handicap_accessible":true},
			{"provider_id":512721,"name":"Rex Express Care of Knightdale","phone_number":"(919) 747-5210","street_address1":"6602 Knightdale Blvd.","street_address2":"Suite 102","city":"Knightdale","state_code":"NC","zip_code":"27545","latitude":35.795243,"longitude":-78.507744,"handicap_accessible":true},
			{"provider_id":516185,"name":"Community Immediate Care Center","phone_number":"(919) 528-7171","street_address1":"1614 NC Hwy 56","street_address2":"","city":"Creedmoor","state_code":"NC","zip_code":"27522","latitude":36.143907,"longitude":-78.7214842,"handicap_accessible":true},
			{"provider_id":516807,"name":"Duke Urgent Care Brier Creek","phone_number":"(919) 206-4889","street_address1":"10211 Alm Street","street_address2":"Suite 1200","city":"Raleigh","state_code":"NC","zip_code":"27617","latitude":35.900576,"longitude":-78.798196,"handicap_accessible":true},
			{"provider_id":521887,"name":"Medcenter Urgent Care Kernersville","phone_number":"(336) 992-4800","street_address1":"1635 NC Highway 66 South","street_address2":"Suite 235","city":"Kernersville","state_code":"NC","zip_code":"27284","latitude":36.080696,"longitude":-80.061821,"handicap_accessible":true},
			{"provider_id":523084,"name":"Onslow Urgent Care PLLC","phone_number":"(910) 577-1555","street_address1":"325 Western Blvd.","street_address2":"","city":"Jacksonville","state_code":"NC","zip_code":"28546","latitude":34.764645,"longitude":-77.383663,"handicap_accessible":true},
			{"provider_id":523084,"name":"Onslow Urgent Care PLLC","phone_number":"(910) 269-2053","street_address1":"4222 Long Beach Rd.","street_address2":"","city":"Southport","state_code":"NC","zip_code":"28461","latitude":33.933417,"longitude":-78.066337,"handicap_accessible":true},
			{"provider_id":523084,"name":"Onslow Urgent Care PLLC","phone_number":"(919) 639-9001","street_address1":"511 N. Raleigh Street","street_address2":"","city":"Angier","state_code":"NC","zip_code":"27501","latitude":35.514638,"longitude":-78.741199,"handicap_accessible":true},
			{"provider_id":52956,"name":"Cox Road Urgent Care","phone_number":"(704) 852-9561","street_address1":"603 Cox Rd.","street_address2":"","city":"Gastonia","state_code":"NC","zip_code":"28054","latitude":35.26924,"longitude":-81.1346318,"handicap_accessible":true},
			{"provider_id":530742,"name":"Priority Care","phone_number":"(910) 590-2916","street_address1":"522 Beaman Street","street_address2":"","city":"Clinton","state_code":"NC","zip_code":"28328","latitude":35.0082181,"longitude":-78.3238435,"handicap_accessible":true},
			{"provider_id":53159,"name":"Piedmont Urgent Care of NC","phone_number":"(828) 431-4955","street_address1":"2972 N. Center Street","street_address2":"","city":"Hickory","state_code":"NC","zip_code":"28601","latitude":35.7715303,"longitude":-81.329799,"handicap_accessible":true},
			{"provider_id":53532,"name":"Pine Ridge Urgent Care & Occupation","phone_number":"(919) 775-3020","street_address1":"1413 Greenway Court","street_address2":"","city":"Sanford","state_code":"NC","zip_code":"27330","latitude":35.5057281,"longitude":-79.1775673,"handicap_accessible":true},
			{"provider_id":53539,"name":"Wake Forest Urgent Care","phone_number":"(919) 570-2000","street_address1":"2115-A South Main Street","street_address2":"","city":"Wake Forest","state_code":"NC","zip_code":"27587","latitude":35.947752,"longitude":-78.534201,"handicap_accessible":true},
			{"provider_id":53649,"name":"White Oak Urgent Care","phone_number":"(336) 495-1001","street_address1":"608 W. Academy Street","street_address2":"","city":"Randleman","state_code":"NC","zip_code":"27317","latitude":35.820754,"longitude":-79.816216,"handicap_accessible":true},
			{"provider_id":537516,"name":"Southeastern Urgent Care Pembroke","phone_number":"(910) 521-0564","street_address1":"812 Candy Park Rd.","street_address2":"","city":"Pembroke","state_code":"NC","zip_code":"28372","latitude":34.6600984,"longitude":-79.1818059,"handicap_accessible":true},
			{"provider_id":53786,"name":"Lakeview Urgent Care","phone_number":"(910) 423-7771","street_address1":"3622 N. Main Street","street_address2":"","city":"Hope Mills","state_code":"NC","zip_code":"28348","latitude":34.972814,"longitude":-78.947238,"handicap_accessible":true},
			{"provider_id":53786,"name":"Lakeview Urgent Care","phone_number":"(910) 486-0044","street_address1":"726 Ramsey Street","street_address2":"","city":"Fayetteville","state_code":"NC","zip_code":"28304","latitude":35.0649336,"longitude":-78.8771496,"handicap_accessible":true},
			{"provider_id":538089,"name":"Carolinas Healthcareurgent Care","phone_number":"(980) 212-7000","street_address1":"275 Hwy 16 North","street_address2":"Suite 104","city":"Denver","state_code":"NC","zip_code":"28037","latitude":35.4395573,"longitude":-81.0068498,"handicap_accessible":true}
			*/
		];
	}]);

	// controller for the map view
	app.controller("UrgentCareMapCtrl", ["$scope", function UrgentCareMapCtrl($scope) {
		var initMap = function() {
			/*
			 * the map is centered on an area near Jordan Lake
			 */
			var mapOptions = {
					center : new google.maps.LatLng(35.759573,-79.0193),
					zoom : 8,
					mapTypeId : google.maps.MapTypeId.ROADMAP
				},
				map = new google.maps.Map(document.getElementById("map"), mapOptions);
		};

		initMap();
	}]);
})();