(function() {
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
	angular.module("urgentCareFinder").filter("phone", function() {
		return function(phone) {
			phone = phone.replace(/[\- ()]/g, "");

			return "1" + phone;
		};
	});
})();