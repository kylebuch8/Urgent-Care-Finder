var mongo = require("mongodb");
 
var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;
 
var server = new Server("localhost", 27017, {auto_reconnect : true});
db = new Db("urgentcare", server, {safe : true});

db.open(function(err, db) {
	if (!err) {
		console.log("Connected to 'urgentcare' database");

		db.createCollection("centers", {strict : true}, function(err, collection) {
			if (!err) {
				console.log("The 'centers' collection doesn't exist. Creating it with sample data...");
				//populateDb();
			}
		});
	}
});

exports.findAll = function(req, res) {
	/*
	 * we need to do some error checking here to make sure
	 * that the latlng is required and in the following
	 * format lat,lng and that the limit is a number
	 */
	var latlng = req.query.latlng.split(","),
		limit = (req.query.limit) ? +req.query.limit : 50;

	console.log(latlng[0]);
	console.log(latlng[1]);

	db.collection("centers", function(err, collection) {
		collection.find({
			location : {
				$near : [+latlng[0], +latlng[1]]
			}
		}).limit(limit).toArray(function(err, items) {
            /*
             * loop through each of the items and calculate the distance
             * between the urgent care center and the latlng
             */
            for (var i = 0, length = items.length; i < length; i += 1) {
                var item = items[i];

                item.distance = Math.round(distanceFrom(latlng[0], latlng[1], item.location.latitude, item.location.longitude) * 10) / 10;
            }

            // sort the items based on distance
            items.sort(function(a, b) {
                return (a.distance > b.distance) ? 1 : (b.distance > a.distance) ? -1 : 0;
            });

            // return the items
			res.send(items);
		});
	});
};

var distanceFrom = function(lat1, lon1, lat2, lon2) {
    var R = 3958.75, // earths radius in miles
        dLat = (lat2-lat1) * (Math.PI / 180),
        dLon = (lon2-lon1) * (Math.PI / 180),
        lat1 = lat1 * (Math.PI / 180),
        lat2 = lat2 * (Math.PI / 180);

    var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2), 
        c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)),
        d = Math.abs(R * c);

    return d;
};

exports.findById = function(req, res) {
	res.send({
		id : req.params.id,
		name : "The Name",
		description : "description"
	});
};

/*
 * if the centers collection doesn't exist when the application starts,
 * we'll fill it up with some data.
 *
 * this SHOULD NOT be used in production
 */
var populateDb = function() {
	/*var centers = [
		{"provider_id":498228,"name":"Haymount Urgent Care PC","phone_number":"(910) 484-1210","street_address1":"1909 Bragg Blvd.","street_address2":"Suite 94","city":"Fayetteville","state_code":"NC","zip_code":"28303","location":{"latitude":35.0689414,"longitude":-78.9102155},"handicap_accessible":true},
		{"provider_id":498754,"name":"Roxboro Med Access PLLC","phone_number":"(336) 330-0400","street_address1":"3762 Durham Rd.","street_address2":"Suite A","city":"Roxboro","state_code":"NC","zip_code":"27573","location":{"latitude":36.341315,"longitude":-78.982451},"handicap_accessible":true},
		{"provider_id":505890,"name":"Duke Urgent Care Knightdale","phone_number":"(919) 232-5205","street_address1":"162 Legacy Oaks Drive","street_address2":"Suite 101","city":"Knightdale","state_code":"NC","zip_code":"27545","location":{"latitude":35.797663,"longitude":-78.517647},"handicap_accessible":true},
		{"provider_id":512721,"name":"Rex Express Care of Knightdale","phone_number":"(919) 747-5210","street_address1":"6602 Knightdale Blvd.","street_address2":"Suite 102","city":"Knightdale","state_code":"NC","zip_code":"27545","location":{"latitude":35.795243,"longitude":-78.507744},"handicap_accessible":true},
		{"provider_id":516185,"name":"Community Immediate Care Center","phone_number":"(919) 528-7171","street_address1":"1614 NC Hwy 56","street_address2":"","city":"Creedmoor","state_code":"NC","zip_code":"27522","location":{"latitude":36.143907,"longitude":-78.7214842},"handicap_accessible":true},
		{"provider_id":516807,"name":"Duke Urgent Care Brier Creek","phone_number":"(919) 206-4889","street_address1":"10211 Alm Street","street_address2":"Suite 1200","city":"Raleigh","state_code":"NC","zip_code":"27617","location":{"latitude":35.900576,"longitude":-78.798196},"handicap_accessible":true},
		{"provider_id":521887,"name":"Medcenter Urgent Care Kernersville","phone_number":"(336) 992-4800","street_address1":"1635 NC Highway 66 South","street_address2":"Suite 235","city":"Kernersville","state_code":"NC","zip_code":"27284","location":{"latitude":36.080696,"longitude":-80.061821},"handicap_accessible":true},
		{"provider_id":523084,"name":"Onslow Urgent Care PLLC","phone_number":"(910) 577-1555","street_address1":"325 Western Blvd.","street_address2":"","city":"Jacksonville","state_code":"NC","zip_code":"28546","location":{"latitude":34.764645,"longitude":-77.383663},"handicap_accessible":true},
		{"provider_id":523084,"name":"Onslow Urgent Care PLLC","phone_number":"(910) 269-2053","street_address1":"4222 Long Beach Rd.","street_address2":"","city":"Southport","state_code":"NC","zip_code":"28461","location":{"latitude":33.933417,"longitude":-78.066337},"handicap_accessible":true},
		{"provider_id":523084,"name":"Onslow Urgent Care PLLC","phone_number":"(919) 639-9001","street_address1":"511 N. Raleigh Street","street_address2":"","city":"Angier","state_code":"NC","zip_code":"27501","location":{"latitude":35.514638,"longitude":-78.741199},"handicap_accessible":true},
		{"provider_id":52956,"name":"Cox Road Urgent Care","phone_number":"(704) 852-9561","street_address1":"603 Cox Rd.","street_address2":"","city":"Gastonia","state_code":"NC","zip_code":"28054","location":{"latitude":35.26924,"longitude":-81.1346318},"handicap_accessible":true},
		{"provider_id":530742,"name":"Priority Care","phone_number":"(910) 590-2916","street_address1":"522 Beaman Street","street_address2":"","city":"Clinton","state_code":"NC","zip_code":"28328","location":{"latitude":35.0082181,"longitude":-78.3238435},"handicap_accessible":true},
		{"provider_id":53159,"name":"Piedmont Urgent Care of NC","phone_number":"(828) 431-4955","street_address1":"2972 N. Center Street","street_address2":"","city":"Hickory","state_code":"NC","zip_code":"28601","location":{"latitude":35.7715303,"longitude":-81.329799},"handicap_accessible":true},
		{"provider_id":53532,"name":"Pine Ridge Urgent Care & Occupation","phone_number":"(919) 775-3020","street_address1":"1413 Greenway Court","street_address2":"","city":"Sanford","state_code":"NC","zip_code":"27330","location":{"latitude":35.5057281,"longitude":-79.1775673},"handicap_accessible":true},
		{"provider_id":53539,"name":"Wake Forest Urgent Care","phone_number":"(919) 570-2000","street_address1":"2115-A South Main Street","street_address2":"","city":"Wake Forest","state_code":"NC","zip_code":"27587","location":{"latitude":35.947752,"longitude":-78.534201},"handicap_accessible":true},
		{"provider_id":53649,"name":"White Oak Urgent Care","phone_number":"(336) 495-1001","street_address1":"608 W. Academy Street","street_address2":"","city":"Randleman","state_code":"NC","zip_code":"27317","location":{"latitude":35.820754,"longitude":-79.816216},"handicap_accessible":true},
		{"provider_id":537516,"name":"Southeastern Urgent Care Pembroke","phone_number":"(910) 521-0564","street_address1":"812 Candy Park Rd.","street_address2":"","city":"Pembroke","state_code":"NC","zip_code":"28372","location":{"latitude":34.6600984,"longitude":-79.1818059},"handicap_accessible":true},
		{"provider_id":53786,"name":"Lakeview Urgent Care","phone_number":"(910) 423-7771","street_address1":"3622 N. Main Street","street_address2":"","city":"Hope Mills","state_code":"NC","zip_code":"28348","location":{"latitude":34.972814,"longitude":-78.947238},"handicap_accessible":true},
		{"provider_id":53786,"name":"Lakeview Urgent Care","phone_number":"(910) 486-0044","street_address1":"726 Ramsey Street","street_address2":"","city":"Fayetteville","state_code":"NC","zip_code":"28304","location":{"latitude":35.0649336,"longitude":-78.8771496},"handicap_accessible":true},
		{"provider_id":538089,"name":"Carolinas Healthcareurgent Care","phone_number":"(980) 212-7000","street_address1":"275 Hwy 16 North","street_address2":"Suite 104","city":"Denver","state_code":"NC","zip_code":"28037","location":{"latitude":35.4395573,"longitude":-81.0068498},"handicap_accessible":true}
	];*/

	var centers = [
    {
      "providerNo": "B900A",
      "orgName": "After Hours Pediatrics",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "3294 Cove Bend Dr",
        "address2": "",
        "city": "Tampa",
        "state": "FL",
        "postalCode": "33613-2752",
        "phoneNo": "813-910-8888",
        "faxNo": "813-971-9514"
      },
      "location": {
        "latitude": 28.081243,
        "longitude": -82.423712
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B900B",
      "orgName": "MedExpress Urgent Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "2810 W Martin Luther King Blvd",
        "address2": "",
        "city": "Tampa",
        "state": "FL",
        "postalCode": "33607-0000",
        "phoneNo": "813-877-8450",
        "faxNo": "813-877-6513"
      },
      "location": {
        "latitude": 27.9811832,
        "longitude": -82.4898414
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B900C",
      "orgName": "MedExpress Urgent Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "206 E Brandon Blvd",
        "address2": "",
        "city": "Brandon",
        "state": "FL",
        "postalCode": "33511-5221",
        "phoneNo": "813-681-5571",
        "faxNo": "813-689-8128"
      },
      "location": {
        "latitude": 27.9378675,
        "longitude": -82.28392490000002
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B900D",
      "orgName": "MedExpress Urgent Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "13610 Bruce B Downs Blvd",
        "address2": "",
        "city": "Tampa",
        "state": "FL",
        "postalCode": "33613-4650",
        "phoneNo": "813-977-2777",
        "faxNo": "813-977-3488"
      },
      "location": {
        "latitude": 28.0709276,
        "longitude": -82.4265458
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B900E",
      "orgName": "MedExpress Urgent Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "26812 US Highway 19 N",
        "address2": "",
        "city": "Clearwater",
        "state": "FL",
        "postalCode": "33761-3405",
        "phoneNo": "727-799-2727",
        "faxNo": "727-210-0810"
      },
      "location": {
        "latitude": 28.0160629,
        "longitude": -82.73813299999999
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B900F",
      "orgName": "MedExpress Urgent Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "13856 N Dale Mabry Hwy",
        "address2": "",
        "city": "Tampa",
        "state": "FL",
        "postalCode": "33618-2420",
        "phoneNo": "813-264-1885",
        "faxNo": "813-968-6438"
      },
      "location": {
        "latitude": 28.070428,
        "longitude": -82.50735499999999
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B900G",
      "orgName": "Solantic Baptist Urgent Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "2140 Kingsley Ave",
        "address2": "",
        "city": "Orange Park",
        "state": "FL",
        "postalCode": "32073-5180",
        "phoneNo": "904-213-0600",
        "faxNo": ""
      },
      "location": {
        "latitude": 30.1646586,
        "longitude": -81.74134819999999
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B900H",
      "orgName": "Solantic Baptist Urgent Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "410 Atlantic Blvd",
        "address2": "",
        "city": "Neptune Beach",
        "state": "FL",
        "postalCode": "32266-4022",
        "phoneNo": "904-241-0117",
        "faxNo": "904-241-4488"
      },
      "location": {
        "latitude": 30.324143,
        "longitude": -81.399233
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B900J",
      "orgName": "Solantic Baptist Urgent Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "12303 San Jose Blvd",
        "address2": "",
        "city": "Jacksonville",
        "state": "FL",
        "postalCode": "32223-2640",
        "phoneNo": "904-288-0277",
        "faxNo": "904-241-4488"
      },
      "location": {
        "latitude": 30.144941,
        "longitude": -81.631923
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B900K",
      "orgName": "Solantic Baptist Urgent Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "2401 Monument Rd",
        "address2": "",
        "city": "Jacksonville",
        "state": "FL",
        "postalCode": "32225-2520",
        "phoneNo": "904-642-0337",
        "faxNo": "904-241-4488"
      },
      "location": {
        "latitude": 30.3586071,
        "longitude": -81.5027562
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B900L",
      "orgName": "7th Avenue Urgent Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "200 NW 7th Ave",
        "address2": "",
        "city": "Fort Lauderdale",
        "state": "FL",
        "postalCode": "33311-9026",
        "phoneNo": "954-759-6794",
        "faxNo": "954-759-6785"
      },
      "location": {
        "latitude": 26.1249527,
        "longitude": -80.1504459
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B900M",
      "orgName": "Broward Health Weston",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "2300 N Commerce Pkwy",
        "address2": "Ste 103",
        "city": "Weston",
        "state": "FL",
        "postalCode": "33326-3255",
        "phoneNo": "954-217-5000",
        "faxNo": "954-217-5704"
      },
      "location": {
        "latitude": 26.090334,
        "longitude": -80.369056
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B900N",
      "orgName": "Florida Hospital Centra Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "5810 S Semoran Blvd",
        "address2": "",
        "city": "Orlando",
        "state": "FL",
        "postalCode": "32822-4812",
        "phoneNo": "407-207-0601",
        "faxNo": "407-207-2118"
      },
      "location": {
        "latitude": 28.4784193,
        "longitude": -81.3103591
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B9010",
      "orgName": "Helix Medical Centers",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "750 S Federal Hwy",
        "address2": "",
        "city": "Deerfield Beach",
        "state": "FL",
        "postalCode": "33441-5767",
        "phoneNo": "954-421-8181",
        "faxNo": "954-426-2967"
      },
      "location": {
        "latitude": 26.3073564,
        "longitude": -80.0924114
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B900P",
      "orgName": "Florida Hospital Centra Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "4320 W Vine St",
        "address2": "",
        "city": "Kissimmee",
        "state": "FL",
        "postalCode": "34746-6313",
        "phoneNo": "407-390-1888",
        "faxNo": "407-390-1881"
      },
      "location": {
        "latitude": 28.3039171,
        "longitude": -81.4540251
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B900Q",
      "orgName": "Florida Hospital Centra Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "4451 W State Road 46",
        "address2": "",
        "city": "Sanford",
        "state": "FL",
        "postalCode": "32771-9082",
        "phoneNo": "407-330-3412",
        "faxNo": "407-330-6849"
      },
      "location": {
        "latitude": 28.8114617,
        "longitude": -81.3302624
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B9014",
      "orgName": "441 Urgent Care Center",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "17820 SE 109th Ave",
        "address2": "Ste 108",
        "city": "Summerfield",
        "state": "FL",
        "postalCode": "34491-8968",
        "phoneNo": "352-274-4307",
        "faxNo": "352-693-2345"
      },
      "location": {
        "latitude": 28.962735,
        "longitude": -81.97019100000001
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B900T",
      "orgName": "Comprehensive Healthcare Inc",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "671 NW 119th St",
        "address2": "",
        "city": "North Miami",
        "state": "FL",
        "postalCode": "33168-2522",
        "phoneNo": "305-688-0861",
        "faxNo": "305-687-5881"
      },
      "location": {
        "latitude": 25.884063,
        "longitude": -80.20984299999999
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B9016",
      "orgName": "Haines City HMA Urgent Care LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "7375 Cypress Gardens Blvd",
        "address2": "",
        "city": "Winter Haven",
        "state": "FL",
        "postalCode": "33884-3246",
        "phoneNo": "863-325-8185",
        "faxNo": "863-825-8185"
      },
      "location": {
        "latitude": 27.9789702,
        "longitude": -81.65317379999999
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B9018",
      "orgName": "Emergency Physicians Medical Center",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "2445 SW 76th St",
        "address2": "Ste 110",
        "city": "Gainesville",
        "state": "FL",
        "postalCode": "32608-0350",
        "phoneNo": "352-872-5111",
        "faxNo": ""
      },
      "location": {
        "latitude": 29.630104,
        "longitude": -82.423608
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B900X",
      "orgName": "US Health Works Medical Group of Florida Inc",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "7676 Peters Rd",
        "address2": "Ste C",
        "city": "Plantation",
        "state": "FL",
        "postalCode": "33324-4032",
        "phoneNo": "954-474-4403",
        "faxNo": "954-454-4706"
      },
      "location": {
        "latitude": 26.103865,
        "longitude": -80.251828
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B900Z",
      "orgName": "Florida Hospital Centra Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "855 S US Highway 17 92",
        "address2": "",
        "city": "Longwood",
        "state": "FL",
        "postalCode": "32750-5581",
        "phoneNo": "407-699-8400",
        "faxNo": "407-699-4258"
      },
      "location": {
        "latitude": 28.711865,
        "longitude": -81.324218
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B901A",
      "orgName": "Florida Hospital Centra Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "440 W State Road 436",
        "address2": "",
        "city": "Altamonte Sprin",
        "state": "FL",
        "postalCode": "32714-4136",
        "phoneNo": "407-788-2000",
        "faxNo": "407-788-2024"
      },
      "location": {
        "latitude": 28.6617343,
        "longitude": -81.3981029
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B901B",
      "orgName": "Florida Hospital Centra Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "509 S Semoran Blvd",
        "address2": "",
        "city": "Orlando",
        "state": "FL",
        "postalCode": "32807-4334",
        "phoneNo": "407-277-0550",
        "faxNo": "407-381-4237"
      },
      "location": {
        "latitude": 28.5366176,
        "longitude": -81.3102062
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B901C",
      "orgName": "Martin Memorial Medicenter of Palm City",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "3066 SW Martin Downs Blvd",
        "address2": "",
        "city": "Palm City",
        "state": "FL",
        "postalCode": "34990-2683",
        "phoneNo": "772-781-2781",
        "faxNo": "772-781-2782"
      },
      "location": {
        "latitude": 27.1723959,
        "longitude": -80.2951531
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B901F",
      "orgName": "Florida Hospital Centra Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "2301 Sand Lake Rd",
        "address2": "",
        "city": "Orlando",
        "state": "FL",
        "postalCode": "32809-7639",
        "phoneNo": "407-851-6478",
        "faxNo": "407-240-1970"
      },
      "location": {
        "latitude": 28.4508793,
        "longitude": -81.41244429999999
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B901G",
      "orgName": "Florida Hospital Centra Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "12500 S Apopka Vineland Rd",
        "address2": "",
        "city": "Orlando",
        "state": "FL",
        "postalCode": "32836-6723",
        "phoneNo": "407-934-2273",
        "faxNo": "407-954-2279"
      },
      "location": {
        "latitude": 28.3840877,
        "longitude": -81.5059701
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B901J",
      "orgName": "Florida Hospital Centra Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "2540 Lee Rd",
        "address2": "",
        "city": "Winter Park",
        "state": "FL",
        "postalCode": "32789-1746",
        "phoneNo": "407-629-9281",
        "faxNo": "407-629-5739"
      },
      "location": {
        "latitude": 28.605215,
        "longitude": -81.38314199999999
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B901L",
      "orgName": "Florida Hospital Centra Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "8201 W Irlo Bronson Memorial Hwy",
        "address2": "",
        "city": "Kissimmee",
        "state": "FL",
        "postalCode": "34747-8202",
        "phoneNo": "407-397-7032",
        "faxNo": "407-397-7041"
      },
      "location": {
        "latitude": 28.3471373,
        "longitude": -81.61156559999999
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B901M",
      "orgName": "After Hours Pediatrics",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "3450 E Lake Rd",
        "address2": "",
        "city": "Palm Harbor",
        "state": "FL",
        "postalCode": "34685-2411",
        "phoneNo": "727-789-8887",
        "faxNo": "727-771-2998"
      },
      "location": {
        "latitude": 28.0611965,
        "longitude": -82.7078147
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B901N",
      "orgName": "After Hours Pediatrics",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "131 W Robertson St",
        "address2": "",
        "city": "Brandon",
        "state": "FL",
        "postalCode": "33511-5111",
        "phoneNo": "877-239-0216",
        "faxNo": "813-643-8222"
      },
      "location": {
        "latitude": 27.9357966,
        "longitude": -82.2874448
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B9020",
      "orgName": "Medi Partners of South Florida LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "9600 NE 2nd Ave",
        "address2": "",
        "city": "Miami Shores",
        "state": "FL",
        "postalCode": "33138-2722",
        "phoneNo": "305-603-7650",
        "faxNo": "305-456-5741"
      },
      "location": {
        "latitude": 25.863812,
        "longitude": -80.193753
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B901P",
      "orgName": "After Hours Pediatrics",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "3838 W Neptune St",
        "address2": "Ste D6",
        "city": "Tampa",
        "state": "FL",
        "postalCode": "33629-5841",
        "phoneNo": "813-254-4209",
        "faxNo": "813-254-4239"
      },
      "location": {
        "latitude": 27.9301234,
        "longitude": -82.50708999999999
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B901Q",
      "orgName": "Scheiner Clinic LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "1880 Eagle Harbor Pkwy",
        "address2": "",
        "city": "Fleming Island",
        "state": "FL",
        "postalCode": "32003-8323",
        "phoneNo": "904-213-8277",
        "faxNo": "904-213-8278"
      },
      "location": {
        "latitude": 30.1051335,
        "longitude": -81.71163020000002
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B9022",
      "orgName": "S F Health Solutions Inc",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "1855 NE 8th St",
        "address2": "",
        "city": "Homestead",
        "state": "FL",
        "postalCode": "33033-4705",
        "phoneNo": "305-242-8025",
        "faxNo": "305-823-4474"
      },
      "location": {
        "latitude": 25.4774476,
        "longitude": -80.4522701
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B901R",
      "orgName": "MPM ImMediate Care Centers LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "1306 Seven Springs Blvd",
        "address2": "",
        "city": "New Port Richey",
        "state": "FL",
        "postalCode": "34655-5643",
        "phoneNo": "727-372-3143",
        "faxNo": "727-372-3143"
      },
      "location": {
        "latitude": 28.1780786,
        "longitude": -82.69738199999999
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B9023",
      "orgName": "Solantic of Orlando LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "2323 S Orange Ave",
        "address2": "",
        "city": "Orlando",
        "state": "FL",
        "postalCode": "32806-3059",
        "phoneNo": "904-223-2330",
        "faxNo": "904-425-4356"
      },
      "location": {
        "latitude": 28.516061,
        "longitude": -81.375908
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B901S",
      "orgName": "Solantic Baptist Urgent Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "5915 Normandy Blvd",
        "address2": "",
        "city": "Jacksonville",
        "state": "FL",
        "postalCode": "32205-6200",
        "phoneNo": "904-378-0121",
        "faxNo": "904-241-4488"
      },
      "location": {
        "latitude": 30.30697529999999,
        "longitude": -81.750838
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B9024",
      "orgName": "Shands-Solantic Joint Venture LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "720 SW 2nd Ave",
        "address2": "",
        "city": "Gainesville",
        "state": "FL",
        "postalCode": "32601-6271",
        "phoneNo": "904-223-2330",
        "faxNo": "904-425-4356"
      },
      "location": {
        "latitude": 29.651497,
        "longitude": -82.332458
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B9025",
      "orgName": "Mediquick Urgent Care Centers Inc",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "140 Pinnacles Dr",
        "address2": "",
        "city": "Palm Coast",
        "state": "FL",
        "postalCode": "32164-2322",
        "phoneNo": "386-447-6615",
        "faxNo": "386-447-1266"
      },
      "location": {
        "latitude": 29.474607,
        "longitude": -81.19031600000001
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B901U",
      "orgName": "Florida Hospital Centra Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "250 N Alafaya Trl",
        "address2": "Ste 135",
        "city": "Orlando",
        "state": "FL",
        "postalCode": "32828-4318",
        "phoneNo": "407-381-4810",
        "faxNo": "407-396-8023"
      },
      "location": {
        "latitude": 28.548248,
        "longitude": -81.20458699999999
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B901X",
      "orgName": "Sacred Heart Hospital of Pensacola",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "6665 Pensacola Blvd",
        "address2": "",
        "city": "Pensacola",
        "state": "FL",
        "postalCode": "32505-1705",
        "phoneNo": "850-416-2000",
        "faxNo": "850-416-2005"
      },
      "location": {
        "latitude": 30.486396,
        "longitude": -87.259199
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B902B",
      "orgName": "Lake Regional Urgent Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "8404 US Highway 441",
        "address2": "",
        "city": "Leesburg",
        "state": "FL",
        "postalCode": "34788-4016",
        "phoneNo": "352-315-8881",
        "faxNo": "352-315-8883"
      },
      "location": {
        "latitude": 28.8322035,
        "longitude": -81.81828130000001
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B902C",
      "orgName": "After Hours Pediatric Practices Inc",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "5018 Dr Phillips Blvd",
        "address2": "",
        "city": "Orlando",
        "state": "FL",
        "postalCode": "32819-3310",
        "phoneNo": "407-363-5753",
        "faxNo": "407-351-2141"
      },
      "location": {
        "latitude": 28.4911617,
        "longitude": -81.49093820000002
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B902F",
      "orgName": "UrgentMed",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "716 S Goldenrod Rd",
        "address2": "",
        "city": "Orlando",
        "state": "FL",
        "postalCode": "32822-8108",
        "phoneNo": "407-658-1719",
        "faxNo": "407-658-2536"
      },
      "location": {
        "latitude": 28.5360811,
        "longitude": -81.2865746
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B902L",
      "orgName": "Emergency Medical Center",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "6121 NW 1st Pl",
        "address2": "",
        "city": "Gainesville",
        "state": "FL",
        "postalCode": "32607-2093",
        "phoneNo": "352-331-4357",
        "faxNo": "352-332-9424"
      },
      "location": {
        "latitude": 29.6529158,
        "longitude": -82.4087351
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B902M",
      "orgName": "First Care West",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "3649 Cortez Rd W",
        "address2": "",
        "city": "Bradenton",
        "state": "FL",
        "postalCode": "34210-3106",
        "phoneNo": "941-753-7585",
        "faxNo": "941-758-2153"
      },
      "location": {
        "latitude": 27.462052,
        "longitude": -82.601213
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B902N",
      "orgName": "New Tampa Urgent Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "1644 Bruce B Downs Blvd",
        "address2": "",
        "city": "Wesley Chapel",
        "state": "FL",
        "postalCode": "33544-8600",
        "phoneNo": "813-929-3600",
        "faxNo": "813-929-3113"
      },
      "location": {
        "latitude": 28.210001,
        "longitude": -82.36077999999999
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B902Q",
      "orgName": "Bayfront Convenient Care Clinics Inc",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "7000 4th St N",
        "address2": "",
        "city": "Saint Petersbur",
        "state": "FL",
        "postalCode": "33702-5903",
        "phoneNo": "727-526-3627",
        "faxNo": "727-528-2222"
      },
      "location": {
        "latitude": 27.836092,
        "longitude": -82.6389116
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B902R",
      "orgName": "Bayfront Convenient Care Clinics Inc",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "3251 66th St N",
        "address2": "",
        "city": "Saint Petersbur",
        "state": "FL",
        "postalCode": "33710-1510",
        "phoneNo": "727-526-3627",
        "faxNo": "727-347-9818"
      },
      "location": {
        "latitude": 27.8015706,
        "longitude": -82.72955650000002
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B902S",
      "orgName": "Bayfront Convenient Care Clinics Inc",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "7601 Seminole Blvd",
        "address2": "",
        "city": "Seminole",
        "state": "FL",
        "postalCode": "33772-4868",
        "phoneNo": "727-397-5666",
        "faxNo": "727-398-2857"
      },
      "location": {
        "latitude": 27.841657,
        "longitude": -82.786272
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B902T",
      "orgName": "Bayfront Convenient Care Clinics Inc",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "6455 Gulf Blvd",
        "address2": "",
        "city": "Saint Petersbur",
        "state": "FL",
        "postalCode": "33706-2140",
        "phoneNo": "727-367-5666",
        "faxNo": "727-367-7808"
      },
      "location": {
        "latitude": 27.7357457,
        "longitude": -82.7470282
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B902U",
      "orgName": "Bayfront Convenient Care Clinics Inc",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "1550 Pasadena Ave S",
        "address2": "",
        "city": "South Pasadena",
        "state": "FL",
        "postalCode": "33707-3718",
        "phoneNo": "727-381-3627",
        "faxNo": "727-343-0537"
      },
      "location": {
        "latitude": 27.7520464,
        "longitude": -82.73862199999999
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B902V",
      "orgName": "Bayfront Convenient Care Clinics Inc",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "13163 66th St",
        "address2": "",
        "city": "Largo",
        "state": "FL",
        "postalCode": "33773-1812",
        "phoneNo": "727-531-2273",
        "faxNo": "727-535-8930"
      },
      "location": {
        "latitude": 27.891729,
        "longitude": -82.727795
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B902W",
      "orgName": "Express Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "2700 Professional Pkwy",
        "address2": "",
        "city": "Ocoee",
        "state": "FL",
        "postalCode": "34761-2964",
        "phoneNo": "407-656-2055",
        "faxNo": "407-656-4177"
      },
      "location": {
        "latitude": 28.5478779,
        "longitude": -81.5411831
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B902X",
      "orgName": "Solantic Baptist Urgent Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "2032 Dunn Ave",
        "address2": "",
        "city": "Jacksonville",
        "state": "FL",
        "postalCode": "32218-4716",
        "phoneNo": "904-757-2008",
        "faxNo": "904-223-3149"
      },
      "location": {
        "latitude": 30.43701,
        "longitude": -81.67723500000001
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B902Z",
      "orgName": "MedExpress Urgent Care LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "1021 N State Road 7",
        "address2": "",
        "city": "Royal Palm Beac",
        "state": "FL",
        "postalCode": "33411-5117",
        "phoneNo": "561-333-9331",
        "faxNo": "561-792-2918"
      },
      "location": {
        "latitude": 26.703837,
        "longitude": -80.201866
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B903B",
      "orgName": "Late Hours Urgent Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "3444 Lithia Pinecrest Rd",
        "address2": "",
        "city": "Valrico",
        "state": "FL",
        "postalCode": "33596-6301",
        "phoneNo": "813-643-9393",
        "faxNo": "813-643-8465"
      },
      "location": {
        "latitude": 27.8908658,
        "longitude": -82.24115119999999
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B903C",
      "orgName": "Premier Urgent Care at Suntree",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "6300 N Wickham Rd",
        "address2": "Ste 108",
        "city": "Melbourne",
        "state": "FL",
        "postalCode": "32940-2023",
        "phoneNo": "321-253-2169",
        "faxNo": "321-253-1720"
      },
      "location": {
        "latitude": 28.2125533,
        "longitude": -80.6734443
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B903D",
      "orgName": "Buena Vista Urgent Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "8216 World Center Dr",
        "address2": "Ste D",
        "city": "Orlando",
        "state": "FL",
        "postalCode": "32821-5412",
        "phoneNo": "407-465-1110",
        "faxNo": "407-465-1222"
      },
      "location": {
        "latitude": 28.3568482,
        "longitude": -81.49480059999999
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B903E",
      "orgName": "After Hours Pediatric Practices Inc",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "4101 Town Center Blvd",
        "address2": "",
        "city": "Orlando",
        "state": "FL",
        "postalCode": "32837-5846",
        "phoneNo": "407-850-3497",
        "faxNo": "407-851-0421"
      },
      "location": {
        "latitude": 28.3621649,
        "longitude": -81.42923809999999
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B903F",
      "orgName": "Helix Medical Centers",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "1 Main St",
        "address2": "Ste 102",
        "city": "Tequesta",
        "state": "FL",
        "postalCode": "33469-4710",
        "phoneNo": "561-747-4464",
        "faxNo": "561-747-5598"
      },
      "location": {
        "latitude": 26.95875,
        "longitude": -80.08656599999999
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B903H",
      "orgName": "Atlantis Urgent Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "2194 Highway A1A",
        "address2": "Ste 106",
        "city": "Indian Harbour",
        "state": "FL",
        "postalCode": "32937-4955",
        "phoneNo": "321-777-2273",
        "faxNo": "321-779-7425"
      },
      "location": {
        "latitude": 28.1439461,
        "longitude": -80.58239999999999
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B903J",
      "orgName": "MPM ImMediate Care Centers LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "13670 Walsingham Rd",
        "address2": "",
        "city": "Largo",
        "state": "FL",
        "postalCode": "33774-3532",
        "phoneNo": "727-593-9848",
        "faxNo": "727-596-4532"
      },
      "location": {
        "latitude": 27.8803052,
        "longitude": -82.827596
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B903L",
      "orgName": "Treasure Coast Medical Associates",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "1607 NW Federal Hwy",
        "address2": "Ste B",
        "city": "Stuart",
        "state": "FL",
        "postalCode": "34994-9688",
        "phoneNo": "772-692-8082",
        "faxNo": "772-232-9383"
      },
      "location": {
        "latitude": 27.2249317,
        "longitude": -80.2643135
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B903M",
      "orgName": "Doctors After Hours Urgent Care Center",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "11479 SW 40th St",
        "address2": "",
        "city": "Miami",
        "state": "FL",
        "postalCode": "33165-3311",
        "phoneNo": "305-228-1414",
        "faxNo": "305-220-1847"
      },
      "location": {
        "latitude": 25.7321826,
        "longitude": -80.3807585
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B903N",
      "orgName": "Plantation Urgent Care Group LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "901 S State Road 7",
        "address2": "",
        "city": "Plantation",
        "state": "FL",
        "postalCode": "33317-4522",
        "phoneNo": "954-797-2900",
        "faxNo": "954-792-4601"
      },
      "location": {
        "latitude": 26.110479,
        "longitude": -80.202208
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B903P",
      "orgName": "Health Care Services LC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "931 SE Ocean Blvd",
        "address2": "Ste A",
        "city": "Stuart",
        "state": "FL",
        "postalCode": "34994-2425",
        "phoneNo": "772-288-6300",
        "faxNo": "772-288-6374"
      },
      "location": {
        "latitude": 27.197902,
        "longitude": -80.236927
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B903Q",
      "orgName": "Palm Harbor Pediatric Urgent Care Center Inc",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "36458 US Hwy 19 N",
        "address2": "",
        "city": "Palm Harbor",
        "state": "FL",
        "postalCode": "34684-1330",
        "phoneNo": "727-787-5439",
        "faxNo": "727-787-6221"
      },
      "location": {
        "latitude": 28.0729565,
        "longitude": -82.7388369
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B903S",
      "orgName": "Exceptional Urgent Care Center",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "11950 County Road 101",
        "address2": "Ste 101",
        "city": "The Villages",
        "state": "FL",
        "postalCode": "32162-9333",
        "phoneNo": "352-391-5200",
        "faxNo": "352-391-5903"
      },
      "location": {
        "latitude": 28.9304422,
        "longitude": -82.0163548
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B903T",
      "orgName": "Pinnacle Urgent Care Center",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "315 75th St W",
        "address2": "",
        "city": "Bradenton",
        "state": "FL",
        "postalCode": "34209-3201",
        "phoneNo": "941-761-1616",
        "faxNo": ""
      },
      "location": {
        "latitude": 27.49802,
        "longitude": -82.63609699999999
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B903U",
      "orgName": "Express Care of Tampa Bay LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "6015 Rex Hall Ln",
        "address2": "",
        "city": "Apollo Beach",
        "state": "FL",
        "postalCode": "33572-2657",
        "phoneNo": "813-641-0068",
        "faxNo": "813-645-3816"
      },
      "location": {
        "latitude": 27.764049,
        "longitude": -82.396265
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B903V",
      "orgName": "After Hours Pediatric Practices Inc",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "651 N Alafaya Trl",
        "address2": "",
        "city": "Orlando",
        "state": "FL",
        "postalCode": "32828-7045",
        "phoneNo": "407-363-5753",
        "faxNo": "407-351-2141"
      },
      "location": {
        "latitude": 28.5567106,
        "longitude": -81.2069326
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B903X",
      "orgName": "Mediquick Urgent Care Centers Inc",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "6 Office Park Dr",
        "address2": "",
        "city": "Palm Coast",
        "state": "FL",
        "postalCode": "32137-3808",
        "phoneNo": "386-447-6615",
        "faxNo": "386-447-1266"
      },
      "location": {
        "latitude": 29.558817,
        "longitude": -81.203689
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B903Y",
      "orgName": "Jupiter Urgent Care Inc",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "1335 W Indiantown Rd",
        "address2": "",
        "city": "Jupiter",
        "state": "FL",
        "postalCode": "33458-4631",
        "phoneNo": "561-744-9995",
        "faxNo": "561-744-8215"
      },
      "location": {
        "latitude": 26.9343554,
        "longitude": -80.1196973
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B903Z",
      "orgName": "UrgentMed Inc",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "2337 S University Dr",
        "address2": "",
        "city": "Davie",
        "state": "FL",
        "postalCode": "33324-5842",
        "phoneNo": "954-423-9234",
        "faxNo": "954-423-9231"
      },
      "location": {
        "latitude": 26.0921749,
        "longitude": -80.2513714
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B904A",
      "orgName": "Fast Care LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "20601 E Dixie Hwy",
        "address2": "Ste 340",
        "city": "Aventura",
        "state": "FL",
        "postalCode": "33180-1542",
        "phoneNo": "786-923-4000",
        "faxNo": "786-923-4001"
      },
      "location": {
        "latitude": 25.966604,
        "longitude": -80.146784
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B904C",
      "orgName": "US Healthworks Medical Group of FL Inc",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "1786 NW 2nd Ave",
        "address2": "",
        "city": "Boca Raton",
        "state": "FL",
        "postalCode": "33432-1616",
        "phoneNo": "561-368-6920",
        "faxNo": "561-368-6194"
      },
      "location": {
        "latitude": 26.3660802,
        "longitude": -80.09022929999999
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B904D",
      "orgName": "US Healthworks Medical Group of FL Inc",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "8290 N University Dr",
        "address2": "",
        "city": "Tamarac",
        "state": "FL",
        "postalCode": "33321-1710",
        "phoneNo": "954-722-7186",
        "faxNo": "954-722-0499"
      },
      "location": {
        "latitude": 26.2260755,
        "longitude": -80.252335
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B904E",
      "orgName": "US Healthworks Medical Group of FL Inc",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "1100 W Commercial Blvd",
        "address2": "Ste 120",
        "city": "Fort Lauderdale",
        "state": "FL",
        "postalCode": "33309-3748",
        "phoneNo": "954-564-2592",
        "faxNo": "954-564-2705"
      },
      "location": {
        "latitude": 26.187275,
        "longitude": -80.1585489
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B904F",
      "orgName": "Oaks Medical Plaza and Urgent Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "308 53rd Ave E",
        "address2": "",
        "city": "Bradenton",
        "state": "FL",
        "postalCode": "34203-4706",
        "phoneNo": "941-751-5551",
        "faxNo": "941-751-5515"
      },
      "location": {
        "latitude": 27.447473,
        "longitude": -82.5611897
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B904J",
      "orgName": "Melbourne Urgent Care Inc",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "395 S Wickham Rd",
        "address2": "",
        "city": "West Melbourne",
        "state": "FL",
        "postalCode": "32904-1135",
        "phoneNo": "321-953-9981",
        "faxNo": "321-953-0219"
      },
      "location": {
        "latitude": 28.101006,
        "longitude": -80.6724188
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B904L",
      "orgName": "Express Family Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "13188 E Colonial Dr",
        "address2": "Ste B5",
        "city": "Orlando",
        "state": "FL",
        "postalCode": "32826-4648",
        "phoneNo": "407-382-5400",
        "faxNo": "407-382-5415"
      },
      "location": {
        "latitude": 28.5652458,
        "longitude": -81.184883
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B904M",
      "orgName": "First Help Urgent Care Clinic",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "320 1st St S",
        "address2": "",
        "city": "Winter Haven",
        "state": "FL",
        "postalCode": "33880-3501",
        "phoneNo": "863-299-8485",
        "faxNo": "863-293-8450"
      },
      "location": {
        "latitude": 28.0177317,
        "longitude": -81.7266739
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B904N",
      "orgName": "Collier Urgent Care Centers",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "7955 Airport Pulling Rd N",
        "address2": "Ste 102",
        "city": "Naples",
        "state": "FL",
        "postalCode": "34109-1794",
        "phoneNo": "239-593-3232",
        "faxNo": "239-593-3237"
      },
      "location": {
        "latitude": 26.2422894,
        "longitude": -81.7697167
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B904Q",
      "orgName": "Now Care Walk In Clinic Inc",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "1009 W Baker St",
        "address2": "",
        "city": "Plant City",
        "state": "FL",
        "postalCode": "33563-4431",
        "phoneNo": "813-759-1232",
        "faxNo": "813-754-0430"
      },
      "location": {
        "latitude": 28.016682,
        "longitude": -82.13273
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B904S",
      "orgName": "Sinai Walk In Clinic",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "2070 US Highway 1",
        "address2": "Ste 102",
        "city": "Rockledge",
        "state": "FL",
        "postalCode": "32955-3745",
        "phoneNo": "321-637-0033",
        "faxNo": "321-637-0025"
      },
      "location": {
        "latitude": 28.3205919,
        "longitude": -80.71331440000002
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B904T",
      "orgName": "Solantic of South Florida LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "9035 Pines Blvd",
        "address2": "",
        "city": "Pembroke Pines",
        "state": "FL",
        "postalCode": "33024-6440",
        "phoneNo": "954-378-0333",
        "faxNo": "954-378-0330"
      },
      "location": {
        "latitude": 26.0088663,
        "longitude": -80.2650872
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B9057",
      "orgName": "US Healthworks Medical Group of Florida",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "312 S Lake St",
        "address2": "",
        "city": "Leesburg",
        "state": "FL",
        "postalCode": "34748-5920",
        "phoneNo": "352-314-9300",
        "faxNo": "352-787-4977"
      },
      "location": {
        "latitude": 28.808181,
        "longitude": -81.866557
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B904V",
      "orgName": "South  Florida Urgent Care Centers LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "17901 NW 5th St",
        "address2": "Ste 101",
        "city": "Pembroke Pines",
        "state": "FL",
        "postalCode": "33029-2810",
        "phoneNo": "954-442-8380",
        "faxNo": "954-442-8661"
      },
      "location": {
        "latitude": 26.0094175,
        "longitude": -80.38505909999999
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B9058",
      "orgName": "US Healthworks Medical Group of Florida",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "4780 N Orange Blossom Trl",
        "address2": "",
        "city": "Orlando",
        "state": "FL",
        "postalCode": "32810-1601",
        "phoneNo": "407-206-3326",
        "faxNo": "407-206-3316"
      },
      "location": {
        "latitude": 28.600554,
        "longitude": -81.419309
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B904W",
      "orgName": "MD Now Medical Centers",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "4570 Lantana Rd",
        "address2": "",
        "city": "Lake Worth",
        "state": "FL",
        "postalCode": "33463-6908",
        "phoneNo": "561-963-9881",
        "faxNo": "561-963-1390"
      },
      "location": {
        "latitude": 26.588498,
        "longitude": -80.115802
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B9059",
      "orgName": "US Healthworks Medical Group of Florida",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "9500 Satellite Blvd",
        "address2": "Ste 100",
        "city": "Orlando",
        "state": "FL",
        "postalCode": "32837-8461",
        "phoneNo": "407-859-5656",
        "faxNo": "407-859-2124"
      },
      "location": {
        "latitude": 28.420638,
        "longitude": -81.402028
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B904Z",
      "orgName": "Doctors After Hours Urgent Care Center Inc",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "551 E 49th St",
        "address2": "First Floor",
        "city": "Hialeah",
        "state": "FL",
        "postalCode": "33013-1904",
        "phoneNo": "305-688-1177",
        "faxNo": "305-687-2306"
      },
      "location": {
        "latitude": 25.8618743,
        "longitude": -80.2711588
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B905A",
      "orgName": "Fast Track Urgent Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "11969 Sheldon Rd",
        "address2": "",
        "city": "Tampa",
        "state": "FL",
        "postalCode": "33626-3644",
        "phoneNo": "813-925-1903",
        "faxNo": "813-749-8370"
      },
      "location": {
        "latitude": 28.0581327,
        "longitude": -82.5824767
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B905B",
      "orgName": "Solantic of Orlando LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "2555 S Kirkman Rd",
        "address2": "",
        "city": "Orlando",
        "state": "FL",
        "postalCode": "32811-2346",
        "phoneNo": "407-362-2030",
        "faxNo": "407-362-2040"
      },
      "location": {
        "latitude": 28.5152778,
        "longitude": -81.45908419999999
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B905C",
      "orgName": "Urgent Care USA LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "5464 Lithia Pinecrest Rd",
        "address2": "",
        "city": "Lithia",
        "state": "FL",
        "postalCode": "33547-2853",
        "phoneNo": "813-681-2111",
        "faxNo": "813-681-2611"
      },
      "location": {
        "latitude": 27.863514,
        "longitude": -82.20254000000001
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B905D",
      "orgName": "MedExpress Urgent Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "801 W Dr Martin L King Blvd",
        "address2": "",
        "city": "Seffner",
        "state": "FL",
        "postalCode": "33584-0000",
        "phoneNo": "813-684-4424",
        "faxNo": "813-684-0797"
      },
      "location": {
        "latitude": 27.9816998,
        "longitude": -82.2875815
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B905E",
      "orgName": "NTC Urgent Care Centers LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "1371 Citrus Tower Blvd",
        "address2": "",
        "city": "Clermont",
        "state": "FL",
        "postalCode": "34711-1924",
        "phoneNo": "352-394-2205",
        "faxNo": "352-394-4214"
      },
      "location": {
        "latitude": 28.5491348,
        "longitude": -81.72333909999999
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B905F",
      "orgName": "NTC Urgent Care Centers LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "1503 Sunrise Plaza Dr",
        "address2": "",
        "city": "Clermont",
        "state": "FL",
        "postalCode": "34714-6200",
        "phoneNo": "352-243-3555",
        "faxNo": "352-243-6614"
      },
      "location": {
        "latitude": 28.368015,
        "longitude": -81.681792
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B905G",
      "orgName": "Florida Hospital Centra Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "8010 Red Bug Lake Rd",
        "address2": "",
        "city": "Oviedo",
        "state": "FL",
        "postalCode": "32765-8084",
        "phoneNo": "786-972-0591",
        "faxNo": ""
      },
      "location": {
        "latitude": 28.65747,
        "longitude": -81.239891
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B905H",
      "orgName": "FL Hospital Centra Care - Clermont",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "15701 Old Highway 50",
        "address2": "Ste 1",
        "city": "Clermont",
        "state": "FL",
        "postalCode": "34711-9081",
        "phoneNo": "352-394-7757",
        "faxNo": "407-200-1306"
      },
      "location": {
        "latitude": 28.5652606,
        "longitude": -81.6985538
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B905J",
      "orgName": "Solantic of South Florida LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "4450 N State Road 7",
        "address2": "",
        "city": "Coconut Creek",
        "state": "FL",
        "postalCode": "33073-3354",
        "phoneNo": "954-378-0333",
        "faxNo": "954-633-1433"
      },
      "location": {
        "latitude": 26.2846661,
        "longitude": -80.20195660000002
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B905K",
      "orgName": "Urgent Care Medical Center",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "11327 Okeechobee Blvd",
        "address2": "Ste 2",
        "city": "Royal Palm Beac",
        "state": "FL",
        "postalCode": "33411-8724",
        "phoneNo": "561-795-4565",
        "faxNo": "561-795-3992"
      },
      "location": {
        "latitude": 26.707151,
        "longitude": -80.221034
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B905M",
      "orgName": "After Hours Pediatric Practices Inc",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "745 Orienta Ave",
        "address2": "",
        "city": "Altamonte Sprin",
        "state": "FL",
        "postalCode": "32701-5619",
        "phoneNo": "407-332-6113",
        "faxNo": "407-332-5157"
      },
      "location": {
        "latitude": 28.66164999999999,
        "longitude": -81.36435399999999
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B905N",
      "orgName": "First Care Winter Haven LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "400 1st St N",
        "address2": "",
        "city": "Winter Haven",
        "state": "FL",
        "postalCode": "33881-4115",
        "phoneNo": "863-299-2420",
        "faxNo": "863-299-2460"
      },
      "location": {
        "latitude": 28.026098,
        "longitude": -81.726525
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B9060",
      "orgName": "Docs In Ergent Care LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "210 N Highway 27",
        "address2": "Ste 4",
        "city": "Clermont",
        "state": "FL",
        "postalCode": "34711-2411",
        "phoneNo": "352-243-4800",
        "faxNo": "888-520-7171"
      },
      "location": {
        "latitude": 28.567969,
        "longitude": -81.74442549999999
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B9061",
      "orgName": "Crestview Urgent Care Inc",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "1502 S Ferdon Blvd",
        "address2": "",
        "city": "Crestview",
        "state": "FL",
        "postalCode": "32536-8444",
        "phoneNo": "850-398-1079",
        "faxNo": "850-226-8233"
      },
      "location": {
        "latitude": 30.743839,
        "longitude": -86.5645569
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B905P",
      "orgName": "Night Owl Pediatrics Urgent Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "10359 Cross Creek Blvd",
        "address2": "Ste CD",
        "city": "Tampa",
        "state": "FL",
        "postalCode": "33647-2772",
        "phoneNo": "813-994-0044",
        "faxNo": "813-994-0055"
      },
      "location": {
        "latitude": 28.1450441,
        "longitude": -82.3128488
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B9062",
      "orgName": "MD Now Medical Centers Inc",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "2272 N Congress Ave",
        "address2": "",
        "city": "Boynton Beach",
        "state": "FL",
        "postalCode": "33426-8604",
        "phoneNo": "561-737-1927",
        "faxNo": "561-742-3436"
      },
      "location": {
        "latitude": 26.5481699,
        "longitude": -80.0904939
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B9064",
      "orgName": "Haines City HMA Urgent Care LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "3759 Pleasant Hill Rd",
        "address2": "",
        "city": "Kissimmee",
        "state": "FL",
        "postalCode": "34746-2937",
        "phoneNo": "407-344-5563",
        "faxNo": "407-343-1346"
      },
      "location": {
        "latitude": 28.1828214,
        "longitude": -81.43983589999999
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B905S",
      "orgName": "Solantic Baptist Urgent Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "8705 Perimeter Park Blvd",
        "address2": "Ste 2",
        "city": "Jacksonville",
        "state": "FL",
        "postalCode": "32216-6353",
        "phoneNo": "904-248-3910",
        "faxNo": ""
      },
      "location": {
        "latitude": 30.2568918,
        "longitude": -81.5559502
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B905T",
      "orgName": "Solantic of Orlando LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "11250 E Colonial Dr",
        "address2": "",
        "city": "Orlando",
        "state": "FL",
        "postalCode": "32817-4537",
        "phoneNo": "321-354-0112",
        "faxNo": ""
      },
      "location": {
        "latitude": 28.567892,
        "longitude": -81.21691299999999
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B9066",
      "orgName": "30 Minute Medical",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "8540 Argyle Forest Blvd",
        "address2": "Ste 6",
        "city": "Jacksonville",
        "state": "FL",
        "postalCode": "32244-6314",
        "phoneNo": "904-777-1650",
        "faxNo": "904-777-1665"
      },
      "location": {
        "latitude": 30.19352,
        "longitude": -81.794765
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B905U",
      "orgName": "Nite Owl Pediatrics Urgent Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "3242 S Florida Ave",
        "address2": "",
        "city": "Lakeland",
        "state": "FL",
        "postalCode": "33803-4574",
        "phoneNo": "863-644-7337",
        "faxNo": "863-644-4992"
      },
      "location": {
        "latitude": 28.0055225,
        "longitude": -81.956974
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B905V",
      "orgName": "Medstat Urgent Care Centers",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "6522 S Kanner Hwy",
        "address2": "",
        "city": "Stuart",
        "state": "FL",
        "postalCode": "34997-6396",
        "phoneNo": "772-463-1123",
        "faxNo": "772-463-3072"
      },
      "location": {
        "latitude": 27.131609,
        "longitude": -80.2513949
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B905W",
      "orgName": "WecareMed Inc",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "5901 Sun Blvd",
        "address2": "Ste 113",
        "city": "Saint Petersbur",
        "state": "FL",
        "postalCode": "33715-1165",
        "phoneNo": "727-867-7910",
        "faxNo": "727-867-6379"
      },
      "location": {
        "latitude": 27.7138493,
        "longitude": -82.715318
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B905X",
      "orgName": "Ritecare Medical Center",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "14201 S Dixie Hwy",
        "address2": "",
        "city": "Miami",
        "state": "FL",
        "postalCode": "33176-7224",
        "phoneNo": "786-242-2479",
        "faxNo": "786-242-3982"
      },
      "location": {
        "latitude": 25.6381939,
        "longitude": -80.33651259999999
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B905Y",
      "orgName": "Solantic of Orlando LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "1471 E Osceola Pkwy",
        "address2": "",
        "city": "Kissimmee",
        "state": "FL",
        "postalCode": "34744-1604",
        "phoneNo": "407-452-3700",
        "faxNo": "407-452-3710"
      },
      "location": {
        "latitude": 28.342965,
        "longitude": -81.3860289
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B905Z",
      "orgName": "Indian River Walk In Clinic",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "652 21st St",
        "address2": "",
        "city": "Vero Beach",
        "state": "FL",
        "postalCode": "32960-0937",
        "phoneNo": "772-299-1092",
        "faxNo": "772-978-1960"
      },
      "location": {
        "latitude": 27.6398778,
        "longitude": -80.38588279999999
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B906B",
      "orgName": "MedExpress Urgent Care of Boynton Beach LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "7593 Boynton Beach Blvd",
        "address2": "Ste 190",
        "city": "Boynton Beach",
        "state": "FL",
        "postalCode": "33437-6164",
        "phoneNo": "561-572-3200",
        "faxNo": "561-572-0445"
      },
      "location": {
        "latitude": 26.529106,
        "longitude": -80.165521
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B906C",
      "orgName": "Sunrise Associates LLP",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "13162 US Highway 301 S",
        "address2": "",
        "city": "Riverview",
        "state": "FL",
        "postalCode": "33578-7410",
        "phoneNo": "813-677-8788",
        "faxNo": "813-677-8806"
      },
      "location": {
        "latitude": 27.7914714,
        "longitude": -82.3350194
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B906E",
      "orgName": "Urgent Care Ctr of Port Orange LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "1690 Dunlawton Ave",
        "address2": "Ste 120",
        "city": "Port Orange",
        "state": "FL",
        "postalCode": "32127-8980",
        "phoneNo": "386-271-2273",
        "faxNo": "386-271-2274"
      },
      "location": {
        "latitude": 29.1146192,
        "longitude": -81.0244556
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B906F",
      "orgName": "Avecina Medical PA",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "1633 Race Track Rd",
        "address2": "Ste 1",
        "city": "Jacksonville",
        "state": "FL",
        "postalCode": "32259-3234",
        "phoneNo": "904-230-6988",
        "faxNo": "904-778-9740"
      },
      "location": {
        "latitude": 30.1220894,
        "longitude": -81.62153750000002
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B906G",
      "orgName": "MedExpress Urgent Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "22945 State Road 54",
        "address2": "",
        "city": "Lutz",
        "state": "FL",
        "postalCode": "33549-6900",
        "phoneNo": "813-909-9099",
        "faxNo": "813-909-1822"
      },
      "location": {
        "latitude": 28.1860732,
        "longitude": -82.4368434
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B906J",
      "orgName": "Helix Medical Centers",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "2311 10th Ave N",
        "address2": "Ste 14",
        "city": "Lake Worth",
        "state": "FL",
        "postalCode": "33461-6605",
        "phoneNo": "561-540-4446",
        "faxNo": "561-540-4430"
      },
      "location": {
        "latitude": 26.628621,
        "longitude": -80.07741299999999
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B906K",
      "orgName": "Gardens Urgent Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "3555 Northlake Blvd",
        "address2": "Ste 2",
        "city": "Palm Beach Gard",
        "state": "FL",
        "postalCode": "33403-1650",
        "phoneNo": "561-626-4878",
        "faxNo": "561-627-5112"
      },
      "location": {
        "latitude": 26.809365,
        "longitude": -80.09098399999999
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B906M",
      "orgName": "Bay Area Urgent Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "5504 Gateway Blvd",
        "address2": "",
        "city": "Wesley Chapel",
        "state": "FL",
        "postalCode": "33544-1900",
        "phoneNo": "813-948-5400",
        "faxNo": "813-907-2173"
      },
      "location": {
        "latitude": 28.2368706,
        "longitude": -82.3607506
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B906N",
      "orgName": "Heathrow Urgent Care Inc",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "1125 Townpark Ave",
        "address2": "Ste 1011",
        "city": "Lake Mary",
        "state": "FL",
        "postalCode": "32746-7605",
        "phoneNo": "407-804-9494",
        "faxNo": "407-804-9443"
      },
      "location": {
        "latitude": 28.7878479,
        "longitude": -81.356578
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B9071",
      "orgName": "Avecina Medical",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "9580 Applecross Rd",
        "address2": "Ste 106",
        "city": "Jacksonville",
        "state": "FL",
        "postalCode": "32222-5843",
        "phoneNo": "904-778-9180",
        "faxNo": "904-778-9740"
      },
      "location": {
        "latitude": 30.196322,
        "longitude": -81.82632799999999
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B906P",
      "orgName": "Premier Walk In Clinic",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "5676 S Florida Ave",
        "address2": "",
        "city": "Lakeland",
        "state": "FL",
        "postalCode": "33813-2526",
        "phoneNo": "863-644-3400",
        "faxNo": "863-619-2400"
      },
      "location": {
        "latitude": 27.9562431,
        "longitude": -81.967703
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B9072",
      "orgName": "Avecina Medical",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "13770 Beach Blvd",
        "address2": "Ste 6",
        "city": "Jacksonville",
        "state": "FL",
        "postalCode": "32224-7227",
        "phoneNo": "904-374-7116",
        "faxNo": "904-374-6427"
      },
      "location": {
        "latitude": 30.287085,
        "longitude": -81.454137
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B9073",
      "orgName": "Paramount Urgent Care Inc",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "628 Cagan View Rd",
        "address2": "Ste 3 \u0026 4",
        "city": "Clermont",
        "state": "FL",
        "postalCode": "34714-6566",
        "phoneNo": "352-674-9218",
        "faxNo": ""
      },
      "location": {
        "latitude": 28.4001568,
        "longitude": -81.7568253
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B906S",
      "orgName": "Treasure Coast Urgent and Family Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "1050 SE Monterey Rd",
        "address2": "Ste 101",
        "city": "Stuart",
        "state": "FL",
        "postalCode": "34994-4512",
        "phoneNo": "772-419-0560",
        "faxNo": "772-419-0557"
      },
      "location": {
        "latitude": 27.1763882,
        "longitude": -80.23828619999999
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B906T",
      "orgName": "Healthpoint Walk In Care LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "4211 Van Dyke Rd",
        "address2": "Ste 101C",
        "city": "Lutz",
        "state": "FL",
        "postalCode": "33558-8003",
        "phoneNo": "813-960-1813",
        "faxNo": "813-961-5641"
      },
      "location": {
        "latitude": 28.130357,
        "longitude": -82.508264
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B9076",
      "orgName": "Late Hours Urgent Care Center",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "3604 Harden Blvd",
        "address2": "",
        "city": "Lakeland",
        "state": "FL",
        "postalCode": "33803-5938",
        "phoneNo": "863-937-8860",
        "faxNo": "863-937-2864"
      },
      "location": {
        "latitude": 27.997435,
        "longitude": -81.973979
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B9078",
      "orgName": "MD Now Medical Center Inc",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "2007 Palm Beach Lakes Blvd",
        "address2": "",
        "city": "West Palm Beach",
        "state": "FL",
        "postalCode": "33409-6501",
        "phoneNo": "561-688-5808",
        "faxNo": "561-420-8560"
      },
      "location": {
        "latitude": 26.715969,
        "longitude": -80.0923428
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B906W",
      "orgName": "Solantic Baptist Urgent Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "464016 State Road 200",
        "address2": "",
        "city": "Yulee",
        "state": "FL",
        "postalCode": "32097-6339",
        "phoneNo": "904-261-3913",
        "faxNo": "904-261-3844"
      },
      "location": {
        "latitude": 30.6198478,
        "longitude": -81.5344738
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B9079",
      "orgName": "Dairy Road Urgent Care LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "2107 Dairy Rd",
        "address2": "",
        "city": "Melbourne",
        "state": "FL",
        "postalCode": "32904-5209",
        "phoneNo": "321-676-7860",
        "faxNo": "321-952-7224"
      },
      "location": {
        "latitude": 28.0762738,
        "longitude": -80.6375925
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B906X",
      "orgName": "Twilight Pediatrics",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "1688 W Granada Blvd",
        "address2": "Ste 1A",
        "city": "Ormond Beach",
        "state": "FL",
        "postalCode": "32174-1818",
        "phoneNo": "386-615-4414",
        "faxNo": "386-615-8466"
      },
      "location": {
        "latitude": 29.255006,
        "longitude": -81.119935
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B906Y",
      "orgName": "IMed Urgent Care Center",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "18100 NE 19th Ave",
        "address2": "",
        "city": "North Miami Bea",
        "state": "FL",
        "postalCode": "33162-1606",
        "phoneNo": "305-949-7990",
        "faxNo": "305-949-3523"
      },
      "location": {
        "latitude": 25.942621,
        "longitude": -80.163119
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B906Z",
      "orgName": "Baptist Walk In Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "9400 University Pkwy",
        "address2": "",
        "city": "Pensacola",
        "state": "FL",
        "postalCode": "32514-5752",
        "phoneNo": "850-208-6130",
        "faxNo": "850-208-6139"
      },
      "location": {
        "latitude": 30.53401,
        "longitude": -87.2188539
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B907H",
      "orgName": "MedExpress Urgent Care of Palm Beach Gardens LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "4520 Donald Ross Rd",
        "address2": "Ste 100",
        "city": "Palm Beach Gard",
        "state": "FL",
        "postalCode": "33418-5105",
        "phoneNo": "561-776-3090",
        "faxNo": ""
      },
      "location": {
        "latitude": 26.881393,
        "longitude": -80.1048129
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B907J",
      "orgName": "Medi Quick Urgent Care Lake Asbury",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "91 Branscomb Rd",
        "address2": "",
        "city": "Green Cove Spri",
        "state": "FL",
        "postalCode": "32043-7223",
        "phoneNo": "904-589-9570",
        "faxNo": "904-589-9575"
      },
      "location": {
        "latitude": 30.0493833,
        "longitude": -81.80891539999999
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B907K",
      "orgName": "MD Now Medical Centers Inc",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "11551 Southern Blvd",
        "address2": "",
        "city": "Royal Palm Beac",
        "state": "FL",
        "postalCode": "33411-4254",
        "phoneNo": "561-798-9411",
        "faxNo": "561-422-8161"
      },
      "location": {
        "latitude": 26.6815452,
        "longitude": -80.2289708
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B9081",
      "orgName": "US Healthworks Medical Group of Florida",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "5927 Webb Rd",
        "address2": "",
        "city": "Tampa",
        "state": "FL",
        "postalCode": "33615-3219",
        "phoneNo": "813-490-8231",
        "faxNo": "813-490-8237"
      },
      "location": {
        "latitude": 28.001427,
        "longitude": -82.57164499999999
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B9082",
      "orgName": "Indian River Medical Center Urgent Care Sebastian",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "801 Wellness Way",
        "address2": "",
        "city": "Sebastian",
        "state": "FL",
        "postalCode": "32958-3783",
        "phoneNo": "772-226-4200",
        "faxNo": "772-226-4203"
      },
      "location": {
        "latitude": 27.8311825,
        "longitude": -80.48125329999999
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B9083",
      "orgName": "Rockledge HMA Convenient Care LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "1500 E Merritt Island Cswy",
        "address2": "",
        "city": "Merritt Island",
        "state": "FL",
        "postalCode": "32952-2612",
        "phoneNo": "321-452-3400",
        "faxNo": "321-452-3488"
      },
      "location": {
        "latitude": 28.359305,
        "longitude": -80.668465
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B9084",
      "orgName": "Express Care of Tampa Bay LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "107 W Robertson St",
        "address2": "",
        "city": "Brandon",
        "state": "FL",
        "postalCode": "33511-5111",
        "phoneNo": "813-651-4100",
        "faxNo": "813-651-4111"
      },
      "location": {
        "latitude": 27.9356812,
        "longitude": -82.2862705
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B9085",
      "orgName": "New Smyrna Beach Urgent Care LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "1860 Renzulli Rd",
        "address2": "",
        "city": "New Smyrna Beac",
        "state": "FL",
        "postalCode": "32168-1726",
        "phoneNo": "386-663-3064",
        "faxNo": "386-663-3066"
      },
      "location": {
        "latitude": 29.015408,
        "longitude": -80.9452824
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B9086",
      "orgName": "Indian River Med Ctr Urgent Care Pointe West",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "1960 Pointe West Dr",
        "address2": "",
        "city": "Vero Beach",
        "state": "FL",
        "postalCode": "32966-1302",
        "phoneNo": "772-226-4250",
        "faxNo": "772-226-4253"
      },
      "location": {
        "latitude": 27.637769,
        "longitude": -80.484308
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B907U",
      "orgName": "Aloma Urgent Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "483 N Semoran Blvd",
        "address2": "Ste 103",
        "city": "Winter Park",
        "state": "FL",
        "postalCode": "32792-3800",
        "phoneNo": "407-215-6370",
        "faxNo": "407-937-2505"
      },
      "location": {
        "latitude": 28.5913325,
        "longitude": -81.30697959999999
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B907V",
      "orgName": "Urgent Care USA LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "413 N Alexander St",
        "address2": "",
        "city": "Plant City",
        "state": "FL",
        "postalCode": "33563-4305",
        "phoneNo": "813-752-7222",
        "faxNo": "813-752-7255"
      },
      "location": {
        "latitude": 28.0182464,
        "longitude": -82.1383369
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B907Y",
      "orgName": "Doctors Urgent Care LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "2404 US Highway 19",
        "address2": "",
        "city": "Holiday",
        "state": "FL",
        "postalCode": "34691-3943",
        "phoneNo": "727-945-0100",
        "faxNo": "727-945-0133"
      },
      "location": {
        "latitude": 28.193797,
        "longitude": -82.7390771
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B908M",
      "orgName": "Acevedo Urgent Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "2525 NW 54th St",
        "address2": "",
        "city": "Miami",
        "state": "FL",
        "postalCode": "33142-2947",
        "phoneNo": "305-633-9090",
        "faxNo": "305-633-9383"
      },
      "location": {
        "latitude": 25.823976,
        "longitude": -80.2390705
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B908N",
      "orgName": "Healing Urgent Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "4005 NW 114th Ave",
        "address2": "Unit 2",
        "city": "Doral",
        "state": "FL",
        "postalCode": "33178-4372",
        "phoneNo": "305-591-8817",
        "faxNo": "305-591-2995"
      },
      "location": {
        "latitude": 25.810617,
        "longitude": -80.380696
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B9091",
      "orgName": "Urgent Care Medical Center LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "4714 Okeechobee Blvd",
        "address2": "",
        "city": "West Palm Beach",
        "state": "FL",
        "postalCode": "33417-4626",
        "phoneNo": "561-640-7505",
        "faxNo": "561-640-7506"
      },
      "location": {
        "latitude": 26.7067275,
        "longitude": -80.1145305
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B908Q",
      "orgName": "Amelia Urgent Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "96279 Brady Point Rd",
        "address2": "",
        "city": "Fernandina Beac",
        "state": "FL",
        "postalCode": "32034-7076",
        "phoneNo": "904-321-0088",
        "faxNo": "904-321-0016"
      },
      "location": {
        "latitude": 30.6161902,
        "longitude": -81.5054136
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B9093",
      "orgName": "Prompt Care of Central Florida LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "1133 Saxon Blvd",
        "address2": "Ste 100",
        "city": "Orange City",
        "state": "FL",
        "postalCode": "32763-8425",
        "phoneNo": "386-878-4137",
        "faxNo": "386-878-4293"
      },
      "location": {
        "latitude": 28.911857,
        "longitude": -81.281058
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B908R",
      "orgName": "After Hours Pediatrics Practices Inc",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "6250 Lantana Rd",
        "address2": "Ste 11",
        "city": "Lake Worth",
        "state": "FL",
        "postalCode": "33463-6609",
        "phoneNo": "561-963-4874",
        "faxNo": "561-641-6856"
      },
      "location": {
        "latitude": 26.587778,
        "longitude": -80.142264
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B9094",
      "orgName": "Florida Hospital Zephyrhills Inc",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "5504 Gateway Blvd",
        "address2": "",
        "city": "Wesley Chapel",
        "state": "FL",
        "postalCode": "33544-1900",
        "phoneNo": "813-948-5400",
        "faxNo": "813-907-2173"
      },
      "location": {
        "latitude": 28.2368706,
        "longitude": -82.3607506
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B908S",
      "orgName": "Urgent Care Center of Southwest Florida LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "10201 Arcos Ave",
        "address2": "Ste 105",
        "city": "Estero",
        "state": "FL",
        "postalCode": "33928-9460",
        "phoneNo": "239-333-2273",
        "faxNo": "904-346-0113"
      },
      "location": {
        "latitude": 26.433439,
        "longitude": -81.786186
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B9095",
      "orgName": "StatMed Quick Quality Clinic Largo",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "1033 W Bay Dr",
        "address2": "",
        "city": "Largo",
        "state": "FL",
        "postalCode": "33770-3248",
        "phoneNo": "727-726-1962",
        "faxNo": ""
      },
      "location": {
        "latitude": 27.916701,
        "longitude": -82.7998994
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B908T",
      "orgName": "MedFast Urgent Care Centers LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "7925 N Wickham Rd",
        "address2": "Ste A",
        "city": "Melbourne",
        "state": "FL",
        "postalCode": "32940-8211",
        "phoneNo": "321-751-7222",
        "faxNo": "321-751-6655"
      },
      "location": {
        "latitude": 28.230236,
        "longitude": -80.702767
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B9096",
      "orgName": "Solantic Baptist Urgent Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "4498 Hendricks Ave",
        "address2": "",
        "city": "Jacksonville",
        "state": "FL",
        "postalCode": "32207-6326",
        "phoneNo": "904-854-1730",
        "faxNo": "904-402-8000"
      },
      "location": {
        "latitude": 30.2744543,
        "longitude": -81.6502793
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B908X",
      "orgName": "Emerald Coast Urgent Care LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "12598 US Highway 98 W",
        "address2": "Unit 101",
        "city": "Destin",
        "state": "FL",
        "postalCode": "32550-2102",
        "phoneNo": "850-654-8878",
        "faxNo": "850-654-8840"
      },
      "location": {
        "latitude": 30.3852156,
        "longitude": -86.3812588
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B908Y",
      "orgName": "Medone PLLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "6160 SW Highway 200",
        "address2": "",
        "city": "Ocala",
        "state": "FL",
        "postalCode": "34476-8307",
        "phoneNo": "352-694-6331",
        "faxNo": "352-694-6338"
      },
      "location": {
        "latitude": 29.096988,
        "longitude": -82.23981599999999
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B90A3",
      "orgName": "MedFast Urgent Care Centers LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "5005 Port St John Pkwy",
        "address2": "",
        "city": "Port Saint John",
        "state": "FL",
        "postalCode": "32927-4305",
        "phoneNo": "321-751-7222",
        "faxNo": "321-751-6655"
      },
      "location": {
        "latitude": 28.4538549,
        "longitude": -80.81734469999999
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B90A4",
      "orgName": "Solantic Baptist Urgent Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "13460 Beach Blvd",
        "address2": "",
        "city": "Jacksonville",
        "state": "FL",
        "postalCode": "32224-0290",
        "phoneNo": "904-854-1700",
        "faxNo": "904-233-5190"
      },
      "location": {
        "latitude": 30.28704699999999,
        "longitude": -81.463549
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B90A6",
      "orgName": "Solantic Baptist Urgent Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "1021 Cesery Blvd",
        "address2": "",
        "city": "Jacksonville",
        "state": "FL",
        "postalCode": "32211-5609",
        "phoneNo": "904-854-1730",
        "faxNo": "904-402-8000"
      },
      "location": {
        "latitude": 30.3315022,
        "longitude": -81.596676
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B90A8",
      "orgName": "FMC Urgent Care LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "38107 Market Sq",
        "address2": "",
        "city": "Zephyrhills",
        "state": "FL",
        "postalCode": "33542-7505",
        "phoneNo": "813-715-0374",
        "faxNo": ""
      },
      "location": {
        "latitude": 28.2537727,
        "longitude": -82.1860422
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B90A9",
      "orgName": "North Florida Medical Group LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "1702 Ohio Ave",
        "address2": "",
        "city": "Lynn Haven",
        "state": "FL",
        "postalCode": "32444-4290",
        "phoneNo": "850-571-5844",
        "faxNo": "850-571-5845"
      },
      "location": {
        "latitude": 30.2326043,
        "longitude": -85.64931150000001
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B90AB",
      "orgName": "Solantic of Orlando LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "5355 Red Bug Lake Rd",
        "address2": "",
        "city": "Winter Springs",
        "state": "FL",
        "postalCode": "32708-4909",
        "phoneNo": "321-304-3300",
        "faxNo": "321-604-3287"
      },
      "location": {
        "latitude": 28.6476507,
        "longitude": -81.2741168
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B90AG",
      "orgName": "TLC Urgent Care Center PLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "10205 W Hillsborough Ave",
        "address2": "Ste A",
        "city": "Tampa",
        "state": "FL",
        "postalCode": "33615-3671",
        "phoneNo": "813-884-2370",
        "faxNo": "813-884-2390"
      },
      "location": {
        "latitude": 28.0048331,
        "longitude": -82.5991449
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B90AH",
      "orgName": "Urgent Care of Naples PA",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "6400 Davis Blvd",
        "address2": "",
        "city": "Naples",
        "state": "FL",
        "postalCode": "34104-5321",
        "phoneNo": "239-775-2300",
        "faxNo": ""
      },
      "location": {
        "latitude": 26.137678,
        "longitude": -81.735067
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B90AK",
      "orgName": "Florida Hospital Flagler Urgent Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "21 Hospital Dr",
        "address2": "Ste 120",
        "city": "Palm Coast",
        "state": "FL",
        "postalCode": "32164-2453",
        "phoneNo": "386-586-4280",
        "faxNo": "386-586-4286"
      },
      "location": {
        "latitude": 29.4789926,
        "longitude": -81.1926676
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B90AS",
      "orgName": "Collier Urgent Care Centers",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "3601 Tamiami Trl N",
        "address2": "",
        "city": "Naples",
        "state": "FL",
        "postalCode": "34103-3728",
        "phoneNo": "239-593-3232",
        "faxNo": "239-593-3237"
      },
      "location": {
        "latitude": 26.190472,
        "longitude": -81.8006939
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B90AT",
      "orgName": "DE Urgent Care Jax PA",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "13457 Atlantic Blvd",
        "address2": "Ste 5",
        "city": "Jacksonville",
        "state": "FL",
        "postalCode": "32225-3294",
        "phoneNo": "904-221-9110",
        "faxNo": ""
      },
      "location": {
        "latitude": 30.321199,
        "longitude": -81.453597
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B90AU",
      "orgName": "Lavender Health Care of Florida LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "2901 S Tamiami Trl",
        "address2": "",
        "city": "Sarasota",
        "state": "FL",
        "postalCode": "34239-5106",
        "phoneNo": "866-239-0827",
        "faxNo": "941-364-4379"
      },
      "location": {
        "latitude": 27.3069168,
        "longitude": -82.5299678
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B90AY",
      "orgName": "Longwood Medical Group",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "450 W State Road 434",
        "address2": "Ste 101",
        "city": "Longwood",
        "state": "FL",
        "postalCode": "32750-5187",
        "phoneNo": "407-767-8200",
        "faxNo": "407-339-1200"
      },
      "location": {
        "latitude": 28.6977463,
        "longitude": -81.3542044
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B90AZ",
      "orgName": "Florida Hospital Centra Care - Colonial Town",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "630 N Bumby Ave",
        "address2": "",
        "city": "Orlando",
        "state": "FL",
        "postalCode": "32803-4917",
        "phoneNo": "407-896-1014",
        "faxNo": ""
      },
      "location": {
        "latitude": 28.552545,
        "longitude": -81.35231999999999
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B90C0",
      "orgName": "MedExpress  Urgent Care Largo",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "10500 Ulmerton Rd",
        "address2": "Ste 202",
        "city": "Largo",
        "state": "FL",
        "postalCode": "33771-3544",
        "phoneNo": "727-518-2273",
        "faxNo": ""
      },
      "location": {
        "latitude": 27.8929345,
        "longitude": -82.7848052
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B90C3",
      "orgName": "Florida ImMediate Care Centers",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "128 NW 137th Dr",
        "address2": "",
        "city": "Newberry",
        "state": "FL",
        "postalCode": "32669-2658",
        "phoneNo": "352-235-9114",
        "faxNo": ""
      },
      "location": {
        "latitude": 29.6463535,
        "longitude": -82.6065023
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B90C6",
      "orgName": "\"Quick Care Med",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "1907 Highway 44 W",
        "address2": "",
        "city": "Inverness",
        "state": "FL",
        "postalCode": "34453-3801",
        "phoneNo": "352-344-2273",
        "faxNo": "352-344-2273"
      },
      "location": {
        "latitude": 28.83644,
        "longitude": -82.35441999999999
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B90C8",
      "orgName": "Florida Hospital Centra Care - Mount Dora",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "19015 US Highway 441",
        "address2": "",
        "city": "Mount Dora",
        "state": "FL",
        "postalCode": "32757-6708",
        "phoneNo": "352-383-6479",
        "faxNo": "352-753-0309"
      },
      "location": {
        "latitude": 28.8241612,
        "longitude": -81.6415689
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B90CA",
      "orgName": "Florida Hospital Centra Care Winter Garden Village",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "3005 Daniels Rd",
        "address2": "",
        "city": "Winter Garden",
        "state": "FL",
        "postalCode": "34787-7002",
        "phoneNo": "407-654-4965",
        "faxNo": ""
      },
      "location": {
        "latitude": 28.5233573,
        "longitude": -81.5832028
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B90CG",
      "orgName": "Fast Track Urgent Care Center",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "3301 W Gandy Blvd",
        "address2": "",
        "city": "Tampa",
        "state": "FL",
        "postalCode": "33611-2931",
        "phoneNo": "813-925-1903",
        "faxNo": "813-749-8369"
      },
      "location": {
        "latitude": 27.894036,
        "longitude": -82.498824
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B90CJ",
      "orgName": "Urgent Medical Centers of America",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "12012 Miramar Pkwy",
        "address2": "",
        "city": "Miramar",
        "state": "FL",
        "postalCode": "33025-7000",
        "phoneNo": "954-435-7938",
        "faxNo": "954-816-3099"
      },
      "location": {
        "latitude": 25.9786631,
        "longitude": -80.3002076
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B90CN",
      "orgName": "MedFast Urgent Care Centers LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "275 W Cocoa Beach Cswy",
        "address2": "",
        "city": "Cocoa Beach",
        "state": "FL",
        "postalCode": "32931-3529",
        "phoneNo": "321-751-7222",
        "faxNo": "321-751-6655"
      },
      "location": {
        "latitude": 28.3585488,
        "longitude": -80.6100677
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B90E4",
      "orgName": "Paramount Urgent Care Inc",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "8972 Turkey Lake Rd",
        "address2": "Ste A400",
        "city": "Orlando",
        "state": "FL",
        "postalCode": "32819-7377",
        "phoneNo": "352-674-9218",
        "faxNo": "352-259-6069"
      },
      "location": {
        "latitude": 28.4428842,
        "longitude": -81.4755667
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B90EB",
      "orgName": "Bay Point Urgent Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "1155 S Dale Mabry Hwy",
        "address2": "",
        "city": "Tampa",
        "state": "FL",
        "postalCode": "33629-5035",
        "phoneNo": "813-281-1155",
        "faxNo": ""
      },
      "location": {
        "latitude": 27.9325314,
        "longitude": -82.5068063
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B90EF",
      "orgName": "Intercoastal Urgent Care Associates",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "1530 4th St N",
        "address2": "",
        "city": "Saint Petersbur",
        "state": "FL",
        "postalCode": "33704-4412",
        "phoneNo": "727-821-8700",
        "faxNo": "727-821-8770"
      },
      "location": {
        "latitude": 27.7876516,
        "longitude": -82.6386978
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B90EJ",
      "orgName": "Primecare at Twin Lakes LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "740 Dunlawton Ave",
        "address2": "Ste 100",
        "city": "Port Orange",
        "state": "FL",
        "postalCode": "32127-4241",
        "phoneNo": "386-767-2402",
        "faxNo": "386-274-1508"
      },
      "location": {
        "latitude": 29.1362451,
        "longitude": -80.9985181
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B90EP",
      "orgName": "Boca Regional Urgent Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "20665 Lyons Rd",
        "address2": "Ste A3",
        "city": "Boca Raton",
        "state": "FL",
        "postalCode": "33434-3911",
        "phoneNo": "561-883-6677",
        "faxNo": "561-640-9282"
      },
      "location": {
        "latitude": 26.369167,
        "longitude": -80.187322
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B90ER",
      "orgName": "Gardens Urgent Care of Lake Worth LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "7408 Lake Worth Rd",
        "address2": "Ste 700",
        "city": "Lake Worth",
        "state": "FL",
        "postalCode": "33467-2531",
        "phoneNo": "561-626-4878",
        "faxNo": "561-267-2550"
      },
      "location": {
        "latitude": 26.616406,
        "longitude": -80.164418
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B90F7",
      "orgName": "Primecare at Twin Lakes LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "1890 LPGA Blvd",
        "address2": "Ste 130",
        "city": "Daytona Beach",
        "state": "FL",
        "postalCode": "32117-7131",
        "phoneNo": "386-274-2212",
        "faxNo": "386-274-1508"
      },
      "location": {
        "latitude": 29.228869,
        "longitude": -81.085692
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B90EW",
      "orgName": "Urgent Care of Naples PA",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "5068 Annunciation Cir",
        "address2": "Unit 111",
        "city": "Ave Maria",
        "state": "FL",
        "postalCode": "34142-9668",
        "phoneNo": "239-304-0054",
        "faxNo": "239-348-0060"
      },
      "location": {
        "latitude": 26.3370633,
        "longitude": -81.43687129999999
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B90EY",
      "orgName": "Doctors Urgent Care LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "34621 US Highway 19 N",
        "address2": "",
        "city": "Palm Harbor",
        "state": "FL",
        "postalCode": "34684-2152",
        "phoneNo": "727-953-9888",
        "faxNo": "727-945-0133"
      },
      "location": {
        "latitude": 28.086433,
        "longitude": -82.738859
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B90FJ",
      "orgName": "Bayside Urgent Care Center",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "1001 S Fort Harrison Ave",
        "address2": "",
        "city": "Clearwater",
        "state": "FL",
        "postalCode": "33756-3905",
        "phoneNo": "727-441-5044",
        "faxNo": "727-441-5008"
      },
      "location": {
        "latitude": 27.9554549,
        "longitude": -82.79990959999999
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B90FN",
      "orgName": "Doctors Express of Tampa",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "6182 Gunn Hwy",
        "address2": "",
        "city": "Tampa",
        "state": "FL",
        "postalCode": "33625-4014",
        "phoneNo": "813-960-1100",
        "faxNo": "813-960-1101"
      },
      "location": {
        "latitude": 28.0640591,
        "longitude": -82.55139129999999
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B90FR",
      "orgName": "Urgent Care of The Palm Beaches PA",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "11951 US Highway 1",
        "address2": "Ste 108",
        "city": "North Palm Beac",
        "state": "FL",
        "postalCode": "33408-2804",
        "phoneNo": "561-429-6109",
        "faxNo": ""
      },
      "location": {
        "latitude": 26.851296,
        "longitude": -80.059737
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B90H5",
      "orgName": "AHC Medical Centers LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "3403 NW 82nd Ave",
        "address2": "Ste 101",
        "city": "Doral",
        "state": "FL",
        "postalCode": "33122-1063",
        "phoneNo": "786-458-8110",
        "faxNo": "786-458-8116"
      },
      "location": {
        "latitude": 25.8059838,
        "longitude": -80.32914389999999
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B90H7",
      "orgName": "After Hours Care at Murabella",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "52 Tuscan Way",
        "address2": "Ste 203",
        "city": "Saint Augustine",
        "state": "FL",
        "postalCode": "32092-1850",
        "phoneNo": "904-940-7750",
        "faxNo": "904-940-7710"
      },
      "location": {
        "latitude": 29.9614968,
        "longitude": -81.4918582
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B90HA",
      "orgName": "Florida Hospital Centra Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "11550 University Blvd",
        "address2": "",
        "city": "Orlando",
        "state": "FL",
        "postalCode": "32817-2100",
        "phoneNo": "407-277-5758",
        "faxNo": ""
      },
      "location": {
        "latitude": 28.5974019,
        "longitude": -81.2200144
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B90HD",
      "orgName": "Fast Care LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "825 Arthur Godfrey Rd",
        "address2": "Ste 100",
        "city": "Miami Beach",
        "state": "FL",
        "postalCode": "33140-3304",
        "phoneNo": "786-923-4000",
        "faxNo": "786-472-3034"
      },
      "location": {
        "latitude": 25.8138738,
        "longitude": -80.13397429999999
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B90HF",
      "orgName": "Fast Care LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "825 Arthur Godfrey Rd",
        "address2": "Ste 100",
        "city": "Miami Beach",
        "state": "FL",
        "postalCode": "33140-3304",
        "phoneNo": "786-923-4000",
        "faxNo": "786-923-4001"
      },
      "location": {
        "latitude": 25.8138738,
        "longitude": -80.13397429999999
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B90HG",
      "orgName": "Rockledge HMA Urgent Care LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "2070 US Highway 1",
        "address2": "Ste 102",
        "city": "Rockledge",
        "state": "FL",
        "postalCode": "32955-3745",
        "phoneNo": "321-637-0033",
        "faxNo": "321-637-0025"
      },
      "location": {
        "latitude": 28.3205919,
        "longitude": -80.71331440000002
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B90HJ",
      "orgName": "Doctors Express Pembroke Pines",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "2004 N Flamingo Rd",
        "address2": "",
        "city": "Pembroke Pines",
        "state": "FL",
        "postalCode": "33028-3500",
        "phoneNo": "954-450-8500",
        "faxNo": "954-450-8502"
      },
      "location": {
        "latitude": 26.0273552,
        "longitude": -80.31256929999999
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B90HQ",
      "orgName": "MPM ImMediate Care Centers LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "4821 US Highway 19",
        "address2": "",
        "city": "New Port Richey",
        "state": "FL",
        "postalCode": "34652-4259",
        "phoneNo": "727-851-9650",
        "faxNo": "727-266-4936"
      },
      "location": {
        "latitude": 28.229268,
        "longitude": -82.732387
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B910A",
      "orgName": "Suncoast Urgent Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "10730 State Road 54",
        "address2": "Ste 104",
        "city": "New Port Richey",
        "state": "FL",
        "postalCode": "34655-2265",
        "phoneNo": "727-372-3888",
        "faxNo": ""
      },
      "location": {
        "latitude": 28.192379,
        "longitude": -82.637233
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B910H",
      "orgName": "Lake Regional Urgent Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "910 Old Camp Rd",
        "address2": "Ste 114",
        "city": "The Villages",
        "state": "FL",
        "postalCode": "32162-5605",
        "phoneNo": "352-259-4322",
        "faxNo": "352-259-3882"
      },
      "location": {
        "latitude": 28.906234,
        "longitude": -81.97161
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B910J",
      "orgName": "Medex Medical Express of Palatka LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "6500 Crill Ave",
        "address2": "Ste 1",
        "city": "Palatka",
        "state": "FL",
        "postalCode": "32177-9231",
        "phoneNo": "386-326-0575",
        "faxNo": "386-326-0571"
      },
      "location": {
        "latitude": 29.6413566,
        "longitude": -81.6892554
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B910X",
      "orgName": "Urgent Medical Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "311 S Cypress Rd",
        "address2": "",
        "city": "Pompano Beach",
        "state": "FL",
        "postalCode": "33060-7133",
        "phoneNo": "954-781-7248",
        "faxNo": "954-781-7313"
      },
      "location": {
        "latitude": 26.226718,
        "longitude": -80.123676
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B911C",
      "orgName": "\"Urgent Care Center of Southwest Florida",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "1708 Cape Coral Pkwy W",
        "address2": "Ste 2",
        "city": "Cape Coral",
        "state": "FL",
        "postalCode": "33914-6985",
        "phoneNo": "239-333-3333",
        "faxNo": "239-333-3333"
      },
      "location": {
        "latitude": 26.561183,
        "longitude": -82.009287
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B911D",
      "orgName": "West Broward Urgent Care LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "10199 Cleary Blvd",
        "address2": "Ste 10",
        "city": "Plantation",
        "state": "FL",
        "postalCode": "33324-1029",
        "phoneNo": "954-476-3024",
        "faxNo": "954-476-3124"
      },
      "location": {
        "latitude": 26.133559,
        "longitude": -80.286238
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B911E",
      "orgName": "Palm Bay Urgent Care LP",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "1155 Malabar Rd NE",
        "address2": "Ste 10",
        "city": "Palm Bay",
        "state": "FL",
        "postalCode": "32907-3262",
        "phoneNo": "321-723-3627",
        "faxNo": "321-723-1771"
      },
      "location": {
        "latitude": 27.9987172,
        "longitude": -80.6352721
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B911G",
      "orgName": "After Hours Pediatric Practices Inc",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "5067 N Dixie Hwy",
        "address2": "",
        "city": "Oakland Park",
        "state": "FL",
        "postalCode": "33334-4000",
        "phoneNo": "954-267-1621",
        "faxNo": "954-267-1625"
      },
      "location": {
        "latitude": 26.1890038,
        "longitude": -80.13376269999999
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B911W",
      "orgName": "First Choice Urgent Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "1945 W County Road 419",
        "address2": "Ste 1101",
        "city": "Oviedo",
        "state": "FL",
        "postalCode": "32766-9558",
        "phoneNo": "407-366-2890",
        "faxNo": "407-366-2843"
      },
      "location": {
        "latitude": 28.65183649999999,
        "longitude": -81.1579696
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B911X",
      "orgName": "Urgent Care at Sawgrass",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "12651 W Sunrise Blvd",
        "address2": "Ste 101",
        "city": "Sunrise",
        "state": "FL",
        "postalCode": "33323-0906",
        "phoneNo": "954-781-7248",
        "faxNo": "954-514-8982"
      },
      "location": {
        "latitude": 26.145825,
        "longitude": -80.32119399999999
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B912A",
      "orgName": "Pines Total Healthcare",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "233 N University Dr",
        "address2": "",
        "city": "Pembroke Pines",
        "state": "FL",
        "postalCode": "33024-6715",
        "phoneNo": "954-983-1119",
        "faxNo": "954-983-1929"
      },
      "location": {
        "latitude": 26.0108567,
        "longitude": -80.2482617
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B912B",
      "orgName": "Mercy Family and Urgent Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "3511 NW 8th Ave",
        "address2": "",
        "city": "Pompano Beach",
        "state": "FL",
        "postalCode": "33064-3055",
        "phoneNo": "954-783-0621",
        "faxNo": "954-783-0622"
      },
      "location": {
        "latitude": 26.2735175,
        "longitude": -80.13363749999999
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B912C",
      "orgName": "LA Clinique Soleil and Urgent Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "750 S Federal Hwy",
        "address2": "",
        "city": "Hollywood",
        "state": "FL",
        "postalCode": "33020-5424",
        "phoneNo": "954-342-8800",
        "faxNo": "954-342-8100"
      },
      "location": {
        "latitude": 26.005285,
        "longitude": -80.14321799999999
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B912H",
      "orgName": "Dayton Medical Center",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "18600 Collins Ave",
        "address2": "",
        "city": "Sunny Isles Bea",
        "state": "FL",
        "postalCode": "33160-2426",
        "phoneNo": "305-931-8484",
        "faxNo": "305-936-1849"
      },
      "location": {
        "latitude": 25.948708,
        "longitude": -80.12114
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B912J",
      "orgName": "Pediatric and Family Urgent Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "705 E 26th St",
        "address2": "",
        "city": "Hialeah",
        "state": "FL",
        "postalCode": "33013-3823",
        "phoneNo": "305-835-1551",
        "faxNo": "305-835-7414"
      },
      "location": {
        "latitude": 25.8462527,
        "longitude": -80.2680665
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B912L",
      "orgName": "North Miami Medical Urgent Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "823 NE 125th St",
        "address2": "",
        "city": "North Miami",
        "state": "FL",
        "postalCode": "33161-5711",
        "phoneNo": "305-895-7840",
        "faxNo": "305-895-9557"
      },
      "location": {
        "latitude": 25.8906117,
        "longitude": -80.1818412
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B912N",
      "orgName": "Boca Urgent Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "9834 Glades Rd",
        "address2": "",
        "city": "Boca Raton",
        "state": "FL",
        "postalCode": "33434-3995",
        "phoneNo": "561-470-1110",
        "faxNo": "561-470-1184"
      },
      "location": {
        "latitude": 26.3665407,
        "longitude": -80.1999707
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B912P",
      "orgName": "Crucial Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "11048 Baymeadows Rd",
        "address2": "Unit 9",
        "city": "Jacksonville",
        "state": "FL",
        "postalCode": "32256-9583",
        "phoneNo": "904-854-7911",
        "faxNo": "904-854-7912"
      },
      "location": {
        "latitude": 30.215394,
        "longitude": -81.51591189999999
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B912Q",
      "orgName": "Janna Healthcare Group LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "6240 Coral Ridge Dr",
        "address2": "Ste 105",
        "city": "Coral Springs",
        "state": "FL",
        "postalCode": "33076-3390",
        "phoneNo": "954-340-5311",
        "faxNo": "954-340-5322"
      },
      "location": {
        "latitude": 26.3070083,
        "longitude": -80.280931
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B912S",
      "orgName": "South Florida Urgent Care Centers LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "5590 W 20th Ave",
        "address2": "Ste 100",
        "city": "Hialeah",
        "state": "FL",
        "postalCode": "33016-7061",
        "phoneNo": "305-827-3303",
        "faxNo": ""
      },
      "location": {
        "latitude": 25.8729144,
        "longitude": -80.3237446
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B912U",
      "orgName": "Concentra Urgent Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "1347 S Andrews Ave",
        "address2": "",
        "city": "Fort Lauderdale",
        "state": "FL",
        "postalCode": "33316-1837",
        "phoneNo": "954-767-9999",
        "faxNo": "954-763-9828"
      },
      "location": {
        "latitude": 26.104748,
        "longitude": -80.1431405
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B912V",
      "orgName": "Concentra Urgent Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "10205 S Dixie Hwy",
        "address2": "Ste 102",
        "city": "Pinecrest",
        "state": "FL",
        "postalCode": "33156-3168",
        "phoneNo": "866-944-6046",
        "faxNo": "305-666-0496"
      },
      "location": {
        "latitude": 25.675231,
        "longitude": -80.318962
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B912X",
      "orgName": "Concentra Urgent Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "4455 Medical Center Way",
        "address2": "",
        "city": "West Palm Beach",
        "state": "FL",
        "postalCode": "33407-3244",
        "phoneNo": "561-881-0066",
        "faxNo": "561-881-5533"
      },
      "location": {
        "latitude": 26.757235,
        "longitude": -80.08608699999999
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B912Y",
      "orgName": "Concentra Urgent Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "7800 NW 25th St",
        "address2": "STE4",
        "city": "Miami",
        "state": "FL",
        "postalCode": "33122-1625",
        "phoneNo": "305-593-2174",
        "faxNo": "305-593-1417"
      },
      "location": {
        "latitude": 25.7968578,
        "longitude": -80.3238444
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B912Z",
      "orgName": "Concentra Urgent Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "17601 NW 2nd Ave",
        "address2": "Ste S",
        "city": "Miami",
        "state": "FL",
        "postalCode": "33169-5001",
        "phoneNo": "305-770-4500",
        "faxNo": "305-770-0020"
      },
      "location": {
        "latitude": 25.936063,
        "longitude": -80.204428
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B913A",
      "orgName": "Hunters Creek Urgent Care PLLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "3010 Hunters Creek Blvd",
        "address2": "",
        "city": "Orlando",
        "state": "FL",
        "postalCode": "32837-6968",
        "phoneNo": "407-240-0129",
        "faxNo": "407-240-3693"
      },
      "location": {
        "latitude": 28.352561,
        "longitude": -81.419022
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B913B",
      "orgName": "Solantic of Orlando LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "4301 E Colonial Dr",
        "address2": "",
        "city": "Orlando",
        "state": "FL",
        "postalCode": "32803-5217",
        "phoneNo": "321-319-0212",
        "faxNo": "321-319-0213"
      },
      "location": {
        "latitude": 28.5536291,
        "longitude": -81.3320684
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B913C",
      "orgName": "Solantic of Orlando LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "7751 Kingspointe Pkwy",
        "address2": "Ste 114",
        "city": "Orlando",
        "state": "FL",
        "postalCode": "32819-6502",
        "phoneNo": "407-581-9672",
        "faxNo": "407-581-9673"
      },
      "location": {
        "latitude": 28.453463,
        "longitude": -81.439151
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B913E",
      "orgName": "Concentra Urgent Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "6521 N Andrews Ave",
        "address2": "",
        "city": "Fort Lauderdale",
        "state": "FL",
        "postalCode": "33309-2131",
        "phoneNo": "954-229-7417",
        "faxNo": "954-229-7451"
      },
      "location": {
        "latitude": 26.2048753,
        "longitude": -80.1481577
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B913M",
      "orgName": "Concentra Urgent Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "1036 Dunn Ave",
        "address2": "",
        "city": "Jacksonville",
        "state": "FL",
        "postalCode": "32218-6359",
        "phoneNo": "904-757-5656",
        "faxNo": "904-757-5650"
      },
      "location": {
        "latitude": 30.4299058,
        "longitude": -81.6612117
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B913N",
      "orgName": "Concentra Urgent Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "7764 Normandy Blvd",
        "address2": "Ste 24",
        "city": "Jacksonville",
        "state": "FL",
        "postalCode": "32221-6692",
        "phoneNo": "904-482-1400",
        "faxNo": "904-482-1407"
      },
      "location": {
        "latitude": 30.292876,
        "longitude": -81.773926
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B913R",
      "orgName": "After Hours Pediatric Practices Inc",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "1481 Wp Ball Blvd",
        "address2": "",
        "city": "Sanford",
        "state": "FL",
        "postalCode": "32771-7206",
        "phoneNo": "407-323-3491",
        "faxNo": "407-323-3940"
      },
      "location": {
        "latitude": 28.7998643,
        "longitude": -81.3350305
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B913S",
      "orgName": "Tallahassee Memorial Urgent Care Center",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "1541 Medical Dr",
        "address2": "",
        "city": "Tallahassee",
        "state": "FL",
        "postalCode": "32308-4615",
        "phoneNo": "850-431-6824",
        "faxNo": "850-431-6987"
      },
      "location": {
        "latitude": 30.4590638,
        "longitude": -84.2594075
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B914M",
      "orgName": "Urgent Medical Center Inc",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "6931 W Broward Blvd",
        "address2": "",
        "city": "Plantation",
        "state": "FL",
        "postalCode": "33317-2902",
        "phoneNo": "954-321-5191",
        "faxNo": "954-321-5192"
      },
      "location": {
        "latitude": 26.1208286,
        "longitude": -80.2390522
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B914S",
      "orgName": "StatMed Quick Quality Clinic at North Pinellas LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "2560 N McMullen Booth Rd",
        "address2": "Ste B",
        "city": "Clearwater",
        "state": "FL",
        "postalCode": "33761-4182",
        "phoneNo": "727-726-1962",
        "faxNo": "727-726-1606"
      },
      "location": {
        "latitude": 28.014313,
        "longitude": -82.709498
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B914T",
      "orgName": "MD Now Medical Centers Inc",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "7035 Beracasa Way",
        "address2": "Ste 105",
        "city": "Boca Raton",
        "state": "FL",
        "postalCode": "33433-3405",
        "phoneNo": "561-361-1515",
        "faxNo": "561-361-6441"
      },
      "location": {
        "latitude": 26.350642,
        "longitude": -80.15550999999999
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B915A",
      "orgName": "4 Care Walk In Clinic",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "590 Malabar Rd SE",
        "address2": "Ste 7",
        "city": "Palm Bay",
        "state": "FL",
        "postalCode": "32907-3108",
        "phoneNo": "321-775-7099",
        "faxNo": "321-676-3575"
      },
      "location": {
        "latitude": 27.998698,
        "longitude": -80.656702
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B915B",
      "orgName": "The Mini ER Waterford Lakes LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "12301 Lake Underhill Rd",
        "address2": "Ste 118",
        "city": "Orlando",
        "state": "FL",
        "postalCode": "32828-4510",
        "phoneNo": "407-249-8870",
        "faxNo": "407-249-8871"
      },
      "location": {
        "latitude": 28.5479426,
        "longitude": -81.2029338
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B915C",
      "orgName": "A Plus Urgent Care of Hollywood",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "1531 N Federal Hwy",
        "address2": "",
        "city": "Hollywood",
        "state": "FL",
        "postalCode": "33020-2849",
        "phoneNo": "954-922-1270",
        "faxNo": "954-922-1273"
      },
      "location": {
        "latitude": 26.0250207,
        "longitude": -80.14307699999999
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B915E",
      "orgName": "Solantic of Orlando LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "3840 E State Road 436",
        "address2": "Ste 1000",
        "city": "Apopka",
        "state": "FL",
        "postalCode": "32703-6041",
        "phoneNo": "407-478-3202",
        "faxNo": "407-478-3245"
      },
      "location": {
        "latitude": 28.669071,
        "longitude": -81.44240099999999
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B915F",
      "orgName": "Physicians Medical Centers Jax Inc",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "2020 Kingsley Ave",
        "address2": "Ste A",
        "city": "Orange Park",
        "state": "FL",
        "postalCode": "32073-5139",
        "phoneNo": "904-458-1308",
        "faxNo": "904-458-1313"
      },
      "location": {
        "latitude": 30.1644358,
        "longitude": -81.7391071
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B915G",
      "orgName": "Physicians Medical Centers Jax Inc",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "5960 Beach Blvd",
        "address2": "Ste 3",
        "city": "Jacksonville",
        "state": "FL",
        "postalCode": "32207-5113",
        "phoneNo": "904-807-9975",
        "faxNo": "904-807-9976"
      },
      "location": {
        "latitude": 30.2923901,
        "longitude": -81.602144
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B915H",
      "orgName": "Physicians Medical Center Inc",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "9826 San Jose Blvd",
        "address2": "",
        "city": "Jacksonville",
        "state": "FL",
        "postalCode": "32257-5438",
        "phoneNo": "904-262-9444",
        "faxNo": "904-262-3750"
      },
      "location": {
        "latitude": 30.1994335,
        "longitude": -81.62025609999999
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B915J",
      "orgName": "Physicians Medical Center Jax Inc",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "1680 Dunn Ave",
        "address2": "Ste 39",
        "city": "Jacksonville",
        "state": "FL",
        "postalCode": "32218-4744",
        "phoneNo": "904-253-6286",
        "faxNo": "904-766-7404"
      },
      "location": {
        "latitude": 30.433535,
        "longitude": -81.67653399999999
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B915L",
      "orgName": "Indian River Walk In Clinic",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "836 S US Highway 1",
        "address2": "",
        "city": "Vero Beach",
        "state": "FL",
        "postalCode": "32962-4703",
        "phoneNo": "772-794-2232",
        "faxNo": "772-978-1960"
      },
      "location": {
        "latitude": 27.576014,
        "longitude": -80.375023
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B915U",
      "orgName": "US Healthworks Medical Group of Florida Inc",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "600 N Cattlemen Rd",
        "address2": "Ste 120",
        "city": "Sarasota",
        "state": "FL",
        "postalCode": "34232-6422",
        "phoneNo": "941-365-5577",
        "faxNo": "941-365-1447"
      },
      "location": {
        "latitude": 27.343082,
        "longitude": -82.44992289999999
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B915X",
      "orgName": "US Healthworks Medical Group",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "1105 53rd Ave E",
        "address2": "",
        "city": "Bradenton",
        "state": "FL",
        "postalCode": "34203-4897",
        "phoneNo": "941-755-2562",
        "faxNo": "941-758-4065"
      },
      "location": {
        "latitude": 27.4479866,
        "longitude": -82.55116819999999
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B916J",
      "orgName": "MedExpress Urgent Care of Coral Springs LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "1809 N University Dr",
        "address2": "",
        "city": "Coral Springs",
        "state": "FL",
        "postalCode": "33071-6001",
        "phoneNo": "954-510-1900",
        "faxNo": "954-282-6080"
      },
      "location": {
        "latitude": 26.2534953,
        "longitude": -80.2521332
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B916L",
      "orgName": "Paramount Urgent Care Inc",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "8640 E County Road 466",
        "address2": "Ste A",
        "city": "The Villages",
        "state": "FL",
        "postalCode": "32162-5616",
        "phoneNo": "352-674-9218",
        "faxNo": "352-259-6069"
      },
      "location": {
        "latitude": 28.9222167,
        "longitude": -81.9938513
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B916V",
      "orgName": "Solantic of South Florida LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "784 E Prima Vista Blvd",
        "address2": "",
        "city": "Port Saint Luci",
        "state": "FL",
        "postalCode": "34952-2271",
        "phoneNo": "772-878-7311",
        "faxNo": "772-878-7321"
      },
      "location": {
        "latitude": 27.3256955,
        "longitude": -80.3232947
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B916W",
      "orgName": "Solantic of Orlando LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "136 Parliament Loop",
        "address2": "Ste 102",
        "city": "Lake Mary",
        "state": "FL",
        "postalCode": "32746-3592",
        "phoneNo": "407-333-0160",
        "faxNo": "407-333-0108"
      },
      "location": {
        "latitude": 28.755715,
        "longitude": -81.32638899999999
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B916X",
      "orgName": "Winter Park Urgent Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "118 W Fairbanks Ave",
        "address2": "",
        "city": "Winter Park",
        "state": "FL",
        "postalCode": "32789-4327",
        "phoneNo": "407-772-2273",
        "faxNo": "407-804-9443"
      },
      "location": {
        "latitude": 28.592939,
        "longitude": -81.35119399999999
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B916Y",
      "orgName": "Florida Hospital Centra Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "8014 Conroy Windermere Rd",
        "address2": "Ste 104",
        "city": "Orlando",
        "state": "FL",
        "postalCode": "32835-2537",
        "phoneNo": "407-291-9960",
        "faxNo": ""
      },
      "location": {
        "latitude": 28.493186,
        "longitude": -81.492113
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B916Z",
      "orgName": "Florida Hospital Centra Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "3293 Greenwald Way N",
        "address2": "",
        "city": "Kissimmee",
        "state": "FL",
        "postalCode": "34741-0772",
        "phoneNo": "407-847-6771",
        "faxNo": ""
      },
      "location": {
        "latitude": 28.3472679,
        "longitude": -81.4190989
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B917B",
      "orgName": "South Tampa After Hours ImMediate Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "602 S Howard Ave",
        "address2": "",
        "city": "Tampa",
        "state": "FL",
        "postalCode": "33606-2413",
        "phoneNo": "813-253-2113",
        "faxNo": "813-251-4290"
      },
      "location": {
        "latitude": 27.938262,
        "longitude": -82.482715
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B917M",
      "orgName": "Adventist Health Systems Sunbelt",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "3099 Aloma Ave",
        "address2": "",
        "city": "Winter Park",
        "state": "FL",
        "postalCode": "32792-3702",
        "phoneNo": "407-677-1140",
        "faxNo": ""
      },
      "location": {
        "latitude": 28.6048509,
        "longitude": -81.3079293
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B917Q",
      "orgName": "MD Now Medical Centers Inc",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "9060 N Military Trl",
        "address2": "",
        "city": "Palm Beach Gard",
        "state": "FL",
        "postalCode": "33410-5972",
        "phoneNo": "561-622-2442",
        "faxNo": "561-622-6235"
      },
      "location": {
        "latitude": 26.8310581,
        "longitude": -80.1052157
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B917R",
      "orgName": "Solantic of South Florida LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "1611 S Federal Hwy",
        "address2": "",
        "city": "Pompano Beach",
        "state": "FL",
        "postalCode": "33062-7514",
        "phoneNo": "954-580-4001",
        "faxNo": "954-378-0330"
      },
      "location": {
        "latitude": 26.2107609,
        "longitude": -80.10726319999999
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B917S",
      "orgName": "MedExpress Urgent Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "20677 Bruce B Downs Blvd",
        "address2": "",
        "city": "Tampa",
        "state": "FL",
        "postalCode": "33647-3553",
        "phoneNo": "813-973-9731",
        "faxNo": "813-973-7888"
      },
      "location": {
        "latitude": 28.16909,
        "longitude": -82.35283
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B917T",
      "orgName": "MedExpress Urgent Care of West Boca Raton LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "19090 State Road 7",
        "address2": "",
        "city": "Boca Raton",
        "state": "FL",
        "postalCode": "33498-4763",
        "phoneNo": "561-314-4650",
        "faxNo": "561-314-4655"
      },
      "location": {
        "latitude": 26.3827447,
        "longitude": -80.2034879
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B917V",
      "orgName": "Solantic Baptist Urgent Care",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "2095 US Highway 1 S",
        "address2": "",
        "city": "Saint Augustine",
        "state": "FL",
        "postalCode": "32086-6000",
        "phoneNo": "904-429-0001",
        "faxNo": "904-824-9338"
      },
      "location": {
        "latitude": 29.861314,
        "longitude": -81.32366499999999
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B917W",
      "orgName": "Emerald Coast Urgent Care LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "11111 Panama City Beach Pkwy",
        "address2": "Ste 264",
        "city": "Panama City Bea",
        "state": "FL",
        "postalCode": "32407-2448",
        "phoneNo": "850-236-8655",
        "faxNo": "850-236-8654"
      },
      "location": {
        "latitude": 30.195345,
        "longitude": -85.811334
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B917X",
      "orgName": "Solantic of South Florida LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "10251 W Commercial Blvd",
        "address2": "",
        "city": "Sunrise",
        "state": "FL",
        "postalCode": "33351-4326",
        "phoneNo": "954-580-4100",
        "faxNo": "954-580-0252"
      },
      "location": {
        "latitude": 26.1938144,
        "longitude": -80.2872628
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B917Y",
      "orgName": "Solantic of Orlando LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "9331 Airport Blvd",
        "address2": "Ste A",
        "city": "Orlando",
        "state": "FL",
        "postalCode": "32827-4324",
        "phoneNo": "321-319-0349",
        "faxNo": "407-859-8215"
      },
      "location": {
        "latitude": 28.431339,
        "longitude": -81.307351
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B917Z",
      "orgName": "Miami Hialeah Medical Group",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "1025 E 25th St",
        "address2": "",
        "city": "Hialeah",
        "state": "FL",
        "postalCode": "33013-3703",
        "phoneNo": "305-696-0842",
        "faxNo": "305-696-2150"
      },
      "location": {
        "latitude": 25.8454749,
        "longitude": -80.2619153
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B918B",
      "orgName": "Express Care of Leesburg",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "2500 Citrus Blvd",
        "address2": "",
        "city": "Leesburg",
        "state": "FL",
        "postalCode": "34748-3063",
        "phoneNo": "352-347-5225",
        "faxNo": "352-347-7977"
      },
      "location": {
        "latitude": 28.843851,
        "longitude": -81.895638
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B918C",
      "orgName": "Navarre Urgent Care LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "8990 Navarre Pkwy",
        "address2": "Ste B",
        "city": "Navarre",
        "state": "FL",
        "postalCode": "32566-2157",
        "phoneNo": "850-515-1174",
        "faxNo": "850-515-2869"
      },
      "location": {
        "latitude": 30.4073305,
        "longitude": -86.8470137
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B918E",
      "orgName": "Suncoast Urgent Care Centers LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "4112 Mariner Blvd",
        "address2": "",
        "city": "Spring Hill",
        "state": "FL",
        "postalCode": "34609-2468",
        "phoneNo": "352-684-3288",
        "faxNo": "727-372-3820"
      },
      "location": {
        "latitude": 28.4909695,
        "longitude": -82.5415687
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B918H",
      "orgName": "Bay View Urgent Care LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "740 Dunlawton Ave",
        "address2": "Ste 100",
        "city": "Port Orange",
        "state": "FL",
        "postalCode": "32127-4241",
        "phoneNo": "386-767-2402",
        "faxNo": "386-767-1566"
      },
      "location": {
        "latitude": 29.1362451,
        "longitude": -80.9985181
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B918J",
      "orgName": "Care One of Florida LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "12220 Cortez Blvd",
        "address2": "",
        "city": "Brooksville",
        "state": "FL",
        "postalCode": "34613-2631",
        "phoneNo": "352-556-5215",
        "faxNo": "352-556-5218"
      },
      "location": {
        "latitude": 28.532834,
        "longitude": -82.523287
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B918L",
      "orgName": "Santa Rosa HMA Urgent Care LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "4944 Highway 90",
        "address2": "",
        "city": "Pace",
        "state": "FL",
        "postalCode": "32571-1413",
        "phoneNo": "850-994-0431",
        "faxNo": "850-994-7883"
      },
      "location": {
        "latitude": 30.592756,
        "longitude": -87.12912899999999
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B918N",
      "orgName": "HMA-Solantic Joint Venture LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "1820 58th Ave",
        "address2": "Ste 110",
        "city": "Vero Beach",
        "state": "FL",
        "postalCode": "32966-4675",
        "phoneNo": "772-257-3200",
        "faxNo": "772-257-0187"
      },
      "location": {
        "latitude": 27.6355476,
        "longitude": -80.4465065
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {
      "providerNo": "B918S",
      "orgName": "Solantic of Orlando LLC",
      "handicapAccess": true,
      "specialtyCode1": "GX",
      "address": {
        "address1": "3925 NW 43rd St",
        "address2": "",
        "city": "Gainesville",
        "state": "FL",
        "postalCode": "32606-4565",
        "phoneNo": "352-371-1777",
        "faxNo": "352-371-0298"
      },
      "location": {
        "latitude": 29.689669,
        "longitude": -82.388519
      },
      "primaryPhysician": {
        "firstName": "",
        "lastName": ""
      }
    },
    {"providerNo":498228,"orgName":"Haymount Urgent Care PC","handicapAccess":true,"specialtyCode1":"","address":{"address1":"1909 Bragg Blvd.","address2":"Suite 94","city":"Fayetteville","state":"NC","postalCode":"28303","phoneNo":"(910) 484-1210","faxNo":""},"location":{"latitude":35.0689414,"longitude":-78.9102155},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":498754,"orgName":"Roxboro Med Access PLLC","handicapAccess":true,"specialtyCode1":"","address":{"address1":"3762 Durham Rd.","address2":"Suite A","city":"Roxboro","state":"NC","postalCode":"27573","phoneNo":"(336) 330-0400","faxNo":""},"location":{"latitude":36.341355,"longitude":-78.983304},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":498754,"orgName":"Roxboro Med Access PLLC","handicapAccess":true,"specialtyCode1":"","address":{"address1":"Medaccess Urgent Care","address2":"700 Ys 1 Hwy Suite 100","city":"Youngsville","state":"NC","postalCode":"27596","phoneNo":"(919) 562-2340","faxNo":""},"location":{"latitude":36.0248732,"longitude":-78.4744439},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":505890,"orgName":"Duke Urgent Care Knightdale","handicapAccess":true,"specialtyCode1":"","address":{"address1":"162 Legacy Oaks Drive","address2":"Suite 101","city":"Knightdale","state":"NC","postalCode":"27545","phoneNo":"(919) 232-5205","faxNo":""},"location":{"latitude":35.797663,"longitude":-78.517647},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":512721,"orgName":"Rex Express Care of Knightdale","handicapAccess":true,"specialtyCode1":"","address":{"address1":"6602 Knightdale Blvd.","address2":"Suite 102","city":"Knightdale","state":"NC","postalCode":"27545","phoneNo":"(919) 747-5210","faxNo":""},"location":{"latitude":35.795243,"longitude":-78.507744},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":516185,"orgName":"Community Immediate Care Center","handicapAccess":true,"specialtyCode1":"","address":{"address1":"1614 NC Hwy 56","address2":"","city":"Creedmoor","state":"NC","postalCode":"27522","phoneNo":"(919) 528-7171","faxNo":""},"location":{"latitude":36.143907,"longitude":-78.7214842},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":516807,"orgName":"Duke Urgent Care Brier Creek","handicapAccess":true,"specialtyCode1":"","address":{"address1":"10211 Alm Street","address2":"Suite 1200","city":"Raleigh","state":"NC","postalCode":"27617","phoneNo":"(919) 206-4889","faxNo":""},"location":{"latitude":35.900576,"longitude":-78.798196},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":521887,"orgName":"Medcenter Urgent Care Kernersville","handicapAccess":true,"specialtyCode1":"","address":{"address1":"1635 NC Highway 66 South","address2":"Suite 235","city":"Kernersville","state":"NC","postalCode":"27284","phoneNo":"(336) 992-4800","faxNo":""},"location":{"latitude":36.080696,"longitude":-80.061821},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":523084,"orgName":"Onslow Urgent Care PLLC","handicapAccess":true,"specialtyCode1":"","address":{"address1":"325 Western Blvd.","address2":"","city":"Jacksonville","state":"NC","postalCode":"28546","phoneNo":"(910) 577-1555","faxNo":""},"location":{"latitude":34.764645,"longitude":-77.383663},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":523084,"orgName":"Onslow Urgent Care PLLC","handicapAccess":true,"specialtyCode1":"","address":{"address1":"4222 Long Beach Rd.","address2":"","city":"Southport","state":"NC","postalCode":"28461","phoneNo":"(910) 269-2053","faxNo":""},"location":{"latitude":33.933417,"longitude":-78.066337},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":523084,"orgName":"Onslow Urgent Care PLLC","handicapAccess":true,"specialtyCode1":"","address":{"address1":"511 N. Raleigh Street","address2":"","city":"Angier","state":"NC","postalCode":"27501","phoneNo":"(919) 639-9001","faxNo":""},"location":{"latitude":35.514638,"longitude":-78.741199},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":52956,"orgName":"Cox Road Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"603 Cox Rd.","address2":"","city":"Gastonia","state":"NC","postalCode":"28054","phoneNo":"(704) 852-9561","faxNo":""},"location":{"latitude":35.26924,"longitude":-81.1346318},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":530742,"orgName":"Priority Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"522 Beaman Street","address2":"","city":"Clinton","state":"NC","postalCode":"28328","phoneNo":"(910) 590-2916","faxNo":""},"location":{"latitude":35.0082181,"longitude":-78.3238435},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":53159,"orgName":"Piedmont Urgent Care of NC","handicapAccess":true,"specialtyCode1":"","address":{"address1":"2972 N. Center Street","address2":"","city":"Hickory","state":"NC","postalCode":"28601","phoneNo":"(828) 431-4955","faxNo":""},"location":{"latitude":35.7715303,"longitude":-81.329799},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":534521,"orgName":"Doctors Express","handicapAccess":true,"specialtyCode1":"","address":{"address1":"1231 Eastchester Drive","address2":"Suite 120","city":"High Point","state":"NC","postalCode":"27265","phoneNo":"(336) 884-4050","faxNo":""},"location":{"latitude":35.9962639,"longitude":-79.996739},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":53532,"orgName":"Pine Ridge Urgent Care & Occupation","handicapAccess":true,"specialtyCode1":"","address":{"address1":"1413 Greenway Court","address2":"","city":"Sanford","state":"NC","postalCode":"27330","phoneNo":"(919) 775-3020","faxNo":""},"location":{"latitude":35.5057281,"longitude":-79.1775673},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":53539,"orgName":"Wake Forest Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"2115-A South Main Street","address2":"","city":"Wake Forest","state":"NC","postalCode":"27587","phoneNo":"(919) 570-2000","faxNo":""},"location":{"latitude":35.947752,"longitude":-78.534201},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":53649,"orgName":"White Oak Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"608 W. Academy Street","address2":"","city":"Randleman","state":"NC","postalCode":"27317","phoneNo":"(336) 495-1001","faxNo":""},"location":{"latitude":35.820754,"longitude":-79.816216},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":537516,"orgName":"Southeastern Urgent Care Pembroke","handicapAccess":true,"specialtyCode1":"","address":{"address1":"812 Candy Park Rd.","address2":"","city":"Pembroke","state":"NC","postalCode":"28372","phoneNo":"(910) 521-0564","faxNo":""},"location":{"latitude":34.6600984,"longitude":-79.1818059},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":53786,"orgName":"Lakeview Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"3622 N. Main Street","address2":"","city":"Hope Mills","state":"NC","postalCode":"28348","phoneNo":"(910) 423-7771","faxNo":""},"location":{"latitude":34.972814,"longitude":-78.947238},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":53786,"orgName":"Lakeview Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"726 Ramsey Street","address2":"","city":"Fayetteville","state":"NC","postalCode":"28304","phoneNo":"(910) 486-0044","faxNo":""},"location":{"latitude":35.0649336,"longitude":-78.8771496},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":538089,"orgName":"Carolinas Healthcareurgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"275 Hwy 16 North","address2":"Suite 104","city":"Denver","state":"NC","postalCode":"28037","phoneNo":"(980) 212-7000","faxNo":""},"location":{"latitude":35.4395573,"longitude":-81.0068498},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":538313,"orgName":"Cgh Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"3722 Bridges Street","address2":"Suite A","city":"Morehead City","state":"NC","postalCode":"28557","phoneNo":"(252) 808-6136","faxNo":""},"location":{"latitude":34.7259258,"longitude":-76.7590123},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":538643,"orgName":"Lumberton Family Urgent Care Center PLLC","handicapAccess":true,"specialtyCode1":"","address":{"address1":"309 N. Roberts Ave.","address2":"","city":"Lumberton","state":"NC","postalCode":"28358","phoneNo":"(910) 739-0272","faxNo":""},"location":{"latitude":34.6163399,"longitude":-78.9801009},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":539025,"orgName":"Nhrmc Urgent Care- Military Cutoff","handicapAccess":true,"specialtyCode1":"","address":{"address1":"1135 Military Cuttoff Rd.","address2":"Suite 103","city":"Wilmington","state":"NC","postalCode":"28405","phoneNo":"(910) 256-6222","faxNo":""},"location":{"latitude":34.234228,"longitude":-77.828031},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":53936,"orgName":"Rx Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"10880 Durant Rd.","address2":"Suite 100","city":"Raleigh","state":"NC","postalCode":"27614","phoneNo":"(919) 719-2260","faxNo":""},"location":{"latitude":35.9077259,"longitude":-78.595196},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":53936,"orgName":"Rx Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"3100 Blue Ridge Rd.","address2":"Suite 103","city":"Raleigh","state":"NC","postalCode":"27612","phoneNo":"(919) 719-2250","faxNo":""},"location":{"latitude":35.821016,"longitude":-78.70387},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":54084,"orgName":"Murphy Medical Center","handicapAccess":true,"specialtyCode1":"","address":{"address1":"183 Ledford Street","address2":"","city":"Murphy","state":"NC","postalCode":"28906","phoneNo":"(828) 837-4712","faxNo":""},"location":{"latitude":35.08481,"longitude":-84.025525},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":54106,"orgName":"Medex Urgent Care, PA","handicapAccess":true,"specialtyCode1":"","address":{"address1":"504 Owen Drive","address2":"","city":"Fayetteville","state":"NC","postalCode":"28304","phoneNo":"(910) 221-3030","faxNo":""},"location":{"latitude":35.036505,"longitude":-78.933282},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":54113,"orgName":"Davie County Hospital","handicapAccess":true,"specialtyCode1":"","address":{"address1":"223 Hospital Street","address2":"","city":"Mocksville","state":"NC","postalCode":"27028","phoneNo":"(336) 751-8100","faxNo":""},"location":{"latitude":35.8995279,"longitude":-80.572005},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":54121,"orgName":"Physicians Prime Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"2908 N. Heritage Street","address2":"","city":"Kinston","state":"NC","postalCode":"28501","phoneNo":"(252) 523-3111","faxNo":""},"location":{"latitude":35.2626103,"longitude":-77.5826783},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":54121,"orgName":"Physicians Prime Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"3535 S. Memorial Drive","address2":"Suite C","city":"Greenville","state":"NC","postalCode":"27834","phoneNo":"(252) 523-3111","faxNo":""},"location":{"latitude":35.565994,"longitude":-77.403374},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":541398,"orgName":"Carolinas Healthcare Childrens Uc","handicapAccess":true,"specialtyCode1":"","address":{"address1":"231 S. Sharon Amity Rd.","address2":"","city":"Charlotte","state":"NC","postalCode":"28211","phoneNo":"(704) 304-6400","faxNo":""},"location":{"latitude":35.174621,"longitude":-80.800807},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":54248,"orgName":"Raleigh Urgent Care Center, PA","handicapAccess":true,"specialtyCode1":"","address":{"address1":"2600 New Bern Ave.","address2":"","city":"Raleigh","state":"NC","postalCode":"27610","phoneNo":"(919) 231-3131","faxNo":""},"location":{"latitude":35.7836179,"longitude":-78.5917077},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":542756,"orgName":"Clinton Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"1004 Beaman Street","address2":"","city":"Clinton","state":"NC","postalCode":"28328","phoneNo":"(910) 592-9113","faxNo":""},"location":{"latitude":35.0136004,"longitude":-78.3258298},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":54349,"orgName":"Carolina Express Care, PA","handicapAccess":true,"specialtyCode1":"","address":{"address1":"7048 Knightdale Blvd.","address2":"Suite 100","city":"Knightdale","state":"NC","postalCode":"27545","phoneNo":"(919) 217-1411","faxNo":""},"location":{"latitude":35.797898,"longitude":-78.492591},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":54356,"orgName":"Boice Willis Immediate","handicapAccess":true,"specialtyCode1":"","address":{"address1":"921 N. Winstead Ave.","address2":"","city":"Rocky Mount","state":"NC","postalCode":"27804","phoneNo":"(252) 937-0300","faxNo":""},"location":{"latitude":35.980227,"longitude":-77.8419289},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":546640,"orgName":"Urgent Care of Wilkes","handicapAccess":true,"specialtyCode1":"","address":{"address1":"1900 West Park Drive","address2":"","city":"North Wilkesboro","state":"NC","postalCode":"28659","phoneNo":"(336) 903-6840","faxNo":""},"location":{"latitude":36.155023,"longitude":-81.161672},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":547700,"orgName":"Alamance Regional Medical Center, Inc.","handicapAccess":true,"specialtyCode1":"","address":{"address1":"3940 Arrowhead Blvd.","address2":"","city":"Mebane","state":"NC","postalCode":"27302","phoneNo":"(919) 568-7300","faxNo":""},"location":{"latitude":36.074729,"longitude":-79.270467},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":547725,"orgName":"Fryecare Urgent Carehudson","handicapAccess":true,"specialtyCode1":"","address":{"address1":"3060 Hickory Blvd.","address2":"","city":"Hudson","state":"NC","postalCode":"28638","phoneNo":"(828) 728-2080","faxNo":""},"location":{"latitude":35.84709,"longitude":-81.47309},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":54823,"orgName":"Ballantyne Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"14214 Ballantyne Lake Rd.","address2":"Suite 100","city":"Charlotte","state":"NC","postalCode":"28277","phoneNo":"(704) 667-2650","faxNo":""},"location":{"latitude":35.051106,"longitude":-80.848324},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":548806,"orgName":"Reliant Urgent Care of Brier Creek","handicapAccess":true,"specialtyCode1":"","address":{"address1":"7870 Alexander Promenade","address2":"Place Suite 110","city":"Raleigh","state":"NC","postalCode":"27617","phoneNo":"(919) 553-3172","faxNo":""},"location":{"latitude":35.9138867,"longitude":-78.7791488},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":55000,"orgName":"Medstat Centre","handicapAccess":true,"specialtyCode1":"","address":{"address1":"1707 Wayne Memorial Drive","address2":"","city":"Goldsboro","state":"NC","postalCode":"27534","phoneNo":"(919) 736-9699","faxNo":""},"location":{"latitude":35.3945494,"longitude":-77.9719194},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":550117,"orgName":"Doctors Express Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"101 Maynard Crossing","address2":"","city":"Cary","state":"NC","postalCode":"27513","phoneNo":"(919) 651-9867","faxNo":""},"location":{"latitude":35.7862717,"longitude":-78.8099714},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":551023,"orgName":"Rosewood Community Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"166b 581 South","address2":"","city":"Goldsboro","state":"NC","postalCode":"27530","phoneNo":"(919) 288-5228","faxNo":""},"location":{"latitude":35.4264271,"longitude":-78.0658352},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":551850,"orgName":"Wallace Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"112 Medical Village Drive","address2":"Suite G","city":"Wallace","state":"NC","postalCode":"28466","phoneNo":"(910) 285-0333","faxNo":""},"location":{"latitude":34.728482,"longitude":-77.991257},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":552492,"orgName":"Friendly Urgent & Family Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"410 College Rd.","address2":"","city":"Greensboro","state":"NC","postalCode":"27410","phoneNo":"(336) 218-0994","faxNo":""},"location":{"latitude":36.0806526,"longitude":-79.8942008},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":55283,"orgName":"Cross Creek Urgent Care & Family Clinic","handicapAccess":true,"specialtyCode1":"","address":{"address1":"726 Ramsey Street","address2":"Suite 8","city":"Fayetteville","state":"NC","postalCode":"28301","phoneNo":"(910) 221-2200","faxNo":""},"location":{"latitude":35.0649336,"longitude":-78.8771496},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":553715,"orgName":"Angels Urgent Care PC","handicapAccess":true,"specialtyCode1":"","address":{"address1":"2356 John Smith Rd.","address2":"","city":"Fayetteville","state":"NC","postalCode":"28306","phoneNo":"(910) 339-6256","faxNo":""},"location":{"latitude":35.0044291,"longitude":-78.9648739},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":555575,"orgName":"Urgent Medical & Family Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"102 Pomona Drive","address2":"","city":"Greensboro","state":"NC","postalCode":"27407","phoneNo":"(336) 299-0000","faxNo":""},"location":{"latitude":36.0692809,"longitude":-79.862187},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":55636,"orgName":"Angel Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"195 Franklin Plaza","address2":"","city":"Franklin","state":"NC","postalCode":"28734","phoneNo":"(828) 369-4427","faxNo":""},"location":{"latitude":35.1663039,"longitude":-83.3968281},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":556753,"orgName":"New Hope Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"3610 North Roxboro Rd.","address2":"","city":"Durham","state":"NC","postalCode":"27704","phoneNo":"(919) 412-8431","faxNo":""},"location":{"latitude":36.0552065,"longitude":-78.9034269},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":55708,"orgName":"Express Care of Health Pavilion Nor","handicapAccess":true,"specialtyCode1":"","address":{"address1":"6387 Ramsey Street","address2":"Suite 100","city":"Fayetteville","state":"NC","postalCode":"28311","phoneNo":"(910) 609-3879","faxNo":""},"location":{"latitude":35.15667,"longitude":-78.871405},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":55751,"orgName":"Carolinas Health Care Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"4525 Cameron Valley Pkwy.","address2":"Suite 1500","city":"Charlotte","state":"NC","postalCode":"28211","phoneNo":"(704) 512-6240","faxNo":""},"location":{"latitude":35.148547,"longitude":-80.824367},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":55785,"orgName":"Physicians Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"5511 Raeford Rd.","address2":"Suite 150","city":"Fayetteville","state":"NC","postalCode":"28314","phoneNo":"(910) 630-5000","faxNo":""},"location":{"latitude":35.0442693,"longitude":-78.9751939},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":55794,"orgName":"The Moses Cone Urgent Care Center","handicapAccess":true,"specialtyCode1":"","address":{"address1":"1123 North Church Street","address2":"","city":"Greensboro","state":"NC","postalCode":"27401","phoneNo":"(336) 832-4400","faxNo":""},"location":{"latitude":36.0911724,"longitude":-79.783903},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":55794,"orgName":"The Moses Cone Urgent Care Center","handicapAccess":true,"specialtyCode1":"","address":{"address1":"1200 N. Elm Street","address2":"","city":"Greensboro","state":"NC","postalCode":"27401","phoneNo":"(336) 832-8092","faxNo":""},"location":{"latitude":36.0925096,"longitude":-79.7885496},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":558296,"orgName":"Fastmed Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"100 Cornerstone Drive","address2":"","city":"Cary","state":"NC","postalCode":"27519","phoneNo":"(919) 650-3660","faxNo":""},"location":{"latitude":35.789583,"longitude":-78.850905},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":558296,"orgName":"Fastmed Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"104 Bass Lake Rd.","address2":"Suite B12","city":"Holly Springs","state":"NC","postalCode":"27540","phoneNo":"(919) 346-1482","faxNo":""},"location":{"latitude":35.6540534,"longitude":-78.8237762},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":558296,"orgName":"Fastmed Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"104 Huffman Mill Rd.","address2":"","city":"Burlington","state":"NC","postalCode":"27215","phoneNo":"(336) 506-1720","faxNo":""},"location":{"latitude":36.0806887,"longitude":-79.4829136},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":558296,"orgName":"Fastmed Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"107a Commons Drive","address2":"","city":"Mooresville","state":"NC","postalCode":"28117","phoneNo":"(704) 235-0686","faxNo":""},"location":{"latitude":35.5890722,"longitude":-80.84016},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":558296,"orgName":"Fastmed Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"11491 Us Hwy 70 West","address2":"","city":"Clayton","state":"NC","postalCode":"27520","phoneNo":"(919) 550-2484","faxNo":""},"location":{"latitude":35.6732939,"longitude":-78.4861699},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":558296,"orgName":"Fastmed Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"1311 E. Millbrook Rd.","address2":"","city":"Raleigh","state":"NC","postalCode":"27609","phoneNo":"(919) 550-0821","faxNo":""},"location":{"latitude":35.8506991,"longitude":-78.6157063},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":558296,"orgName":"Fastmed Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"1407 E. Franklin Street","address2":"","city":"Chapel Hill","state":"NC","postalCode":"27514","phoneNo":"(919) 550-0821","faxNo":""},"location":{"latitude":35.929284,"longitude":-79.035274},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":558296,"orgName":"Fastmed Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"1418 N. Main Street","address2":"","city":"Fuquay Varina","state":"NC","postalCode":"27526","phoneNo":"(919) 552-1733","faxNo":""},"location":{"latitude":35.5930281,"longitude":-78.7720819},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":558296,"orgName":"Fastmed Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"160 Hendersonville Rd.","address2":"","city":"Asheville","state":"NC","postalCode":"28803","phoneNo":"(828) 210-2835","faxNo":""},"location":{"latitude":35.564315,"longitude":-82.541895},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":558296,"orgName":"Fastmed Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"178 Hwy 105","address2":"Suite 101","city":"Boone","state":"NC","postalCode":"28607","phoneNo":"(828) 265-7146","faxNo":""},"location":{"latitude":36.2292424,"longitude":-81.7202505},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":558296,"orgName":"Fastmed Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"178 Hwy 105 Ext","address2":"Suite 101","city":"Boone","state":"NC","postalCode":"28607","phoneNo":"(828) 265-7146","faxNo":""},"location":{"latitude":36.213065,"longitude":-81.668758},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":558296,"orgName":"Fastmed Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"1800 North Sandhills Blvd.","address2":"Suite B","city":"Aberdeen","state":"NC","postalCode":"28315","phoneNo":"(910) 724-2334","faxNo":""},"location":{"latitude":35.154507,"longitude":-79.414748},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":558296,"orgName":"Fastmed Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"1903 Addison Ave.","address2":"","city":"Wilkesboro","state":"NC","postalCode":"28697","phoneNo":"(336) 667-2710","faxNo":""},"location":{"latitude":36.1482889,"longitude":-81.1951067},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":558296,"orgName":"Fastmed Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"2001 S. Main Street","address2":"Suite 200","city":"Wake Forest","state":"NC","postalCode":"27587","phoneNo":"(919) 562-3155","faxNo":""},"location":{"latitude":35.949165,"longitude":-78.531159},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":558296,"orgName":"Fastmed Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"2021 Creekside Landing Drive","address2":"","city":"Apex","state":"NC","postalCode":"27502","phoneNo":"(919) 550-0821","faxNo":""},"location":{"latitude":35.7460288,"longitude":-78.8848622},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":558296,"orgName":"Fastmed Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"2242a West Roosevelt Blvd.","address2":"","city":"Monroe","state":"NC","postalCode":"28110","phoneNo":"(704) 220-1904","faxNo":""},"location":{"latitude":35.0084592,"longitude":-80.5614375},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":558296,"orgName":"Fastmed Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"234 Turnersburg Hwy","address2":"","city":"Statesville","state":"NC","postalCode":"28625","phoneNo":"(704) 818-0369","faxNo":""},"location":{"latitude":35.8263133,"longitude":-80.8750465},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":558296,"orgName":"Fastmed Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"242 Turnersburg Hwy","address2":"","city":"Statesville","state":"NC","postalCode":"28625","phoneNo":"(919) 550-0821","faxNo":""},"location":{"latitude":35.815335,"longitude":-80.876193},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":558296,"orgName":"Fastmed Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"2728 W. Mallard Creek","address2":"Church Rd. Suite 300","city":"Charlotte","state":"NC","postalCode":"28110","phoneNo":"(980) 218-1860","faxNo":""},"location":{"latitude":35.3411303,"longitude":-80.7668847},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":558296,"orgName":"Fastmed Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"2728 W. Mallard Creek","address2":"Church Rd. Suite 300","city":"Charlotte","state":"NC","postalCode":"28262","phoneNo":"(980) 218-1860","faxNo":""},"location":{"latitude":35.3411303,"longitude":-80.7668847},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":558296,"orgName":"Fastmed Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"300 S. Stratford Rd.","address2":"","city":"Winston Salem","state":"NC","postalCode":"27103","phoneNo":"(336) 714-5399","faxNo":""},"location":{"latitude":36.091314,"longitude":-80.2824247},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":558296,"orgName":"Fastmed Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"3215 Battlefield Ave.","address2":"","city":"Greensboro","state":"NC","postalCode":"27408","phoneNo":"(336) 387-5020","faxNo":""},"location":{"latitude":36.119005,"longitude":-79.841449},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":558296,"orgName":"Fastmed Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"3250 Wilkinson Blvd.","address2":"Suite I","city":"Charlotte","state":"NC","postalCode":"28208","phoneNo":"(704) 319-5176","faxNo":""},"location":{"latitude":35.2245657,"longitude":-80.8947491},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":558296,"orgName":"Fastmed Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"3420 Ten Ten Rd.","address2":"Suite 318","city":"Cary","state":"NC","postalCode":"27518","phoneNo":"(919) 776-6767","faxNo":""},"location":{"latitude":35.702035,"longitude":-78.792929},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":558296,"orgName":"Fastmed Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"391 George W. Liles Pkwy.","address2":"N.W.","city":"Concord","state":"NC","postalCode":"28027","phoneNo":"(704) 886-1780","faxNo":""},"location":{"latitude":35.416325,"longitude":-80.669549},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":558296,"orgName":"Fastmed Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"4415 School House Commons","address2":"","city":"Harrisburgh","state":"NC","postalCode":"28075","phoneNo":"(704) 456-1218","faxNo":""},"location":{"latitude":35.3292422,"longitude":-80.6469079},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":558296,"orgName":"Fastmed Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"4937 Old Country Club Rd.","address2":"","city":"Winston Salem","state":"NC","postalCode":"27104","phoneNo":"(336) 546-1666","faxNo":""},"location":{"latitude":36.0833078,"longitude":-80.3451831},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":558296,"orgName":"Fastmed Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"5156 NC Hwy 42 West","address2":"","city":"Garner","state":"NC","postalCode":"27529","phoneNo":"(919) 329-5000","faxNo":""},"location":{"latitude":35.6101139,"longitude":-78.5584667},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":558296,"orgName":"Fastmed Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"6500 Creedmoor Rd.","address2":"Suite 110","city":"Raleigh","state":"NC","postalCode":"27613","phoneNo":"(919) 825-4000","faxNo":""},"location":{"latitude":35.874395,"longitude":-78.678879},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":558296,"orgName":"Fastmed Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"7010 NC Highway 751","address2":"Suite 101","city":"Durham","state":"NC","postalCode":"27707","phoneNo":"(919) 313-3900","faxNo":""},"location":{"latitude":35.917434,"longitude":-78.962309},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":558296,"orgName":"Fastmed Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"724 South Horner Blvd.","address2":"","city":"Sanford","state":"NC","postalCode":"27518","phoneNo":"(919) 776-6767","faxNo":""},"location":{"latitude":35.471437,"longitude":-79.1735273},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":558296,"orgName":"Fastmed Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"825 Spartanburg Hwy","address2":"Suite 17","city":"Hendersonville","state":"NC","postalCode":"28792","phoneNo":"(828) 233-1664","faxNo":""},"location":{"latitude":35.30559,"longitude":-82.451198},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":55856,"orgName":"Park Ridge Hospital Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"77 Airport Rd.","address2":"","city":"Arden","state":"NC","postalCode":"28704","phoneNo":"(828) 651-0098","faxNo":""},"location":{"latitude":35.45358,"longitude":-82.522412},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":55917,"orgName":"Nova Urgent & Medical Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"861 Berkshire Rd.","address2":"","city":"Smithfield","state":"NC","postalCode":"27577","phoneNo":"(919) 934-0985","faxNo":""},"location":{"latitude":35.517727,"longitude":-78.328913},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":55922,"orgName":"Pediatricians Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"11130 Capital Blvd.","address2":"","city":"Wake Forest","state":"NC","postalCode":"27587","phoneNo":"(919) 488-4094","faxNo":""},"location":{"latitude":35.950423,"longitude":-78.538364},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":55922,"orgName":"Pediatricians Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"3803-A Computer Drive","address2":"","city":"Raleigh","state":"NC","postalCode":"27609","phoneNo":"(919) 488-4094","faxNo":""},"location":{"latitude":35.833052,"longitude":-78.63297},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":55922,"orgName":"Pediatricians Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"4551 New Bern Ave.","address2":"Suite 106","city":"Raleigh","state":"NC","postalCode":"27610","phoneNo":"(919) 488-4094","faxNo":""},"location":{"latitude":35.799811,"longitude":-78.558077},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":55922,"orgName":"Pediatricians Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"7990 Arco Corporate Drive","address2":"","city":"Raleigh","state":"NC","postalCode":"27617","phoneNo":"(919) 488-4094","faxNo":""},"location":{"latitude":35.908563,"longitude":-78.778021},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":560008,"orgName":"Optimus Medical Group PLLC","handicapAccess":true,"specialtyCode1":"","address":{"address1":"3402 Battleground Ave.","address2":"","city":"Greensboro","state":"NC","postalCode":"27410","phoneNo":"(336) 545-1515","faxNo":""},"location":{"latitude":36.124267,"longitude":-79.84622},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":560008,"orgName":"Optimus Medical Group PLLC","handicapAccess":true,"specialtyCode1":"","address":{"address1":"7100 Six Forks Rd.","address2":"Suite 101","city":"Raleigh","state":"NC","postalCode":"27615","phoneNo":"(919) 794-7447","faxNo":""},"location":{"latitude":35.8861371,"longitude":-78.6455475},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":56011,"orgName":"Chicora Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"20 Medical Campus Drive","address2":"Suite 106-A","city":"Supply","state":"NC","postalCode":"28462","phoneNo":"(910) 755-6300","faxNo":""},"location":{"latitude":34.017953,"longitude":-78.284453},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":560599,"orgName":"Aeroclinic","handicapAccess":true,"specialtyCode1":"","address":{"address1":"5501 Josh Birmingham Pkwy.","address2":"","city":"Charlotte","state":"NC","postalCode":"28208","phoneNo":"(980) 216-5100","faxNo":""},"location":{"latitude":35.219378,"longitude":-80.945041},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":56195,"orgName":"Unifour Urgent Care LLC","handicapAccess":true,"specialtyCode1":"","address":{"address1":"1105 Fairgrove Church Rd.","address2":"S.E.","city":"Conover","state":"NC","postalCode":"28613","phoneNo":"(828) 267-0551","faxNo":""},"location":{"latitude":35.7126628,"longitude":-81.264549},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":562924,"orgName":"Chuc-Huntersville","handicapAccess":true,"specialtyCode1":"","address":{"address1":"12905 Rosedale Hill Ave.","address2":"","city":"Huntersville","state":"NC","postalCode":"28078","phoneNo":"(704) 801-1000","faxNo":""},"location":{"latitude":35.408297,"longitude":-80.860973},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":56321,"orgName":"Chuc Monroe","handicapAccess":true,"specialtyCode1":"","address":{"address1":"613 E. Roosevelt Blvd.","address2":"","city":"Monroe","state":"NC","postalCode":"28112","phoneNo":"(704) 283-8193","faxNo":""},"location":{"latitude":34.9763521,"longitude":-80.5206708},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":563221,"orgName":"UNC Urgent Care At Carolina Pointe","handicapAccess":true,"specialtyCode1":"","address":{"address1":"6013 Farrington Rd.","address2":"Suite 101","city":"Chapel Hill","state":"NC","postalCode":"27517","phoneNo":"(919) 957-6610","faxNo":""},"location":{"latitude":35.9112661,"longitude":-78.9838581},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":56331,"orgName":"Chapel Hill Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"2238 Nelson Hwy","address2":"Suite 500","city":"Chapel Hill","state":"NC","postalCode":"27517","phoneNo":"(919) 403-8100","faxNo":""},"location":{"latitude":35.9109905,"longitude":-78.9868861},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":56335,"orgName":"Beach Medical Care Ltd","handicapAccess":true,"specialtyCode1":"","address":{"address1":"5200 N. Croatan Hwy","address2":"Urgent Care Suite","city":"Kitty Hawk","state":"NC","postalCode":"27949","phoneNo":"(252) 261-4187","faxNo":""},"location":{"latitude":36.0984991,"longitude":-75.7138206},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":56403,"orgName":"Chuc Union West","handicapAccess":true,"specialtyCode1":"","address":{"address1":"6030 W. Hwy 74","address2":"Suite A","city":"Indian Trail","state":"NC","postalCode":"28079","phoneNo":"(704) 246-2777","faxNo":""},"location":{"latitude":35.0690106,"longitude":-80.6444859},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":56467,"orgName":"Outer Banks Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"4923 S. Croatan Hwy","address2":"","city":"Nags Head","state":"NC","postalCode":"27959","phoneNo":"(252) 261-8040","faxNo":""},"location":{"latitude":35.9378024,"longitude":-75.6156921},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":564688,"orgName":"Presbyterian Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"1450 Matthews Twnshp Pky","address2":"Suite 170","city":"Matthews","state":"NC","postalCode":"28105","phoneNo":"(704) 384-8441","faxNo":""},"location":{"latitude":35.120819,"longitude":-80.713973},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":564689,"orgName":"Presbyterian Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"1918 Randolph Rd.","address2":"Suite 175","city":"Charlotte","state":"NC","postalCode":"28207","phoneNo":"(704) 316-1050","faxNo":""},"location":{"latitude":35.209707,"longitude":-80.824964},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":56488,"orgName":"Rex Express Care of Wakefield","handicapAccess":true,"specialtyCode1":"","address":{"address1":"11200 Governor Manly Way","address2":"Suite 114","city":"Raleigh","state":"NC","postalCode":"27614","phoneNo":"(919) 570-7660","faxNo":""},"location":{"latitude":35.947499,"longitude":-78.541281},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":565279,"orgName":"Carolinas Healthcare Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"420 Park Street","address2":"","city":"Belmont","state":"NC","postalCode":"28012","phoneNo":"(704) 631-1820","faxNo":""},"location":{"latitude":35.249272,"longitude":-81.029696},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":56629,"orgName":"Brunswick Urgent Care, PA","handicapAccess":true,"specialtyCode1":"","address":{"address1":"509 Olde Waterford Way","address2":"Suite 100","city":"Leland","state":"NC","postalCode":"28451","phoneNo":"(910) 383-2182","faxNo":""},"location":{"latitude":34.225391,"longitude":-78.025885},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":566918,"orgName":"Brier Creek Urgent Care PLLC","handicapAccess":true,"specialtyCode1":"","address":{"address1":"7870 Alexander Promenade","address2":"Place Suite 110","city":"Raleigh","state":"NC","postalCode":"27617","phoneNo":"(919) 598-8834","faxNo":""},"location":{"latitude":35.9138867,"longitude":-78.7791488},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":56738,"orgName":"Statcare Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"9525 Cliffdale Rd.","address2":"","city":"Fayetteville","state":"NC","postalCode":"28304","phoneNo":"(910) 826-7828","faxNo":""},"location":{"latitude":35.03058,"longitude":-79.059898},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":568234,"orgName":"High Country Walk In Clinic","handicapAccess":true,"specialtyCode1":"","address":{"address1":"108 Park Ave.","address2":"","city":"Banner Elk","state":"NC","postalCode":"28604","phoneNo":"(828) 898-4091","faxNo":""},"location":{"latitude":36.164314,"longitude":-81.86838},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":56965,"orgName":"Steele Creek Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"9332 S. Tryon Street","address2":"","city":"Charlotte","state":"NC","postalCode":"28273","phoneNo":"(704) 587-6700","faxNo":""},"location":{"latitude":35.1308565,"longitude":-80.9410182},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":569712,"orgName":"Smithfield Regional Urgent Care &","handicapAccess":true,"specialtyCode1":"","address":{"address1":"601 N. Eighth Street","address2":"Suite B","city":"Smithfield","state":"NC","postalCode":"27577","phoneNo":"(919) 209-4357","faxNo":""},"location":{"latitude":35.5149935,"longitude":-78.3359598},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":569713,"orgName":"Hillcrest Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"2337 Winterhaven Lane","address2":"","city":"Winston Salem","state":"NC","postalCode":"27103","phoneNo":"(336) 760-8999","faxNo":""},"location":{"latitude":36.050633,"longitude":-80.32579},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":569716,"orgName":"Lake Jeanette Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"1309 Lees Chapel Rd.","address2":"","city":"Greensboro","state":"NC","postalCode":"27455","phoneNo":"(336) 286-5505","faxNo":""},"location":{"latitude":36.1348884,"longitude":-79.7882511},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":569718,"orgName":"Urgent Care of Smithfield","handicapAccess":true,"specialtyCode1":"","address":{"address1":"388 I. Venture Drive","address2":"","city":"Smithfield","state":"NC","postalCode":"27577","phoneNo":"(919) 209-0796","faxNo":""},"location":{"latitude":35.510194,"longitude":-78.319408},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":57000,"orgName":"Pardee Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"212a Thompson Street","address2":"","city":"Hendersonville","state":"NC","postalCode":"28792","phoneNo":"(828) 697-3232","faxNo":""},"location":{"latitude":35.339186,"longitude":-82.445493},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":570074,"orgName":"Nova Urgent Care Carteret, PA","handicapAccess":true,"specialtyCode1":"","address":{"address1":"4252 Arendell Street","address2":"Suite A","city":"Morehead City","state":"NC","postalCode":"28557","phoneNo":"(252) 222-0204","faxNo":""},"location":{"latitude":34.72855,"longitude":-76.772745},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":570538,"orgName":"Accent Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"212 Ashville Ave.","address2":"Suite 10","city":"Cary","state":"NC","postalCode":"27518","phoneNo":"(919) 859-1136","faxNo":""},"location":{"latitude":35.7406371,"longitude":-78.7834462},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":570538,"orgName":"Accent Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"2406 Blue Ridge Rd.","address2":"Suite 190","city":"Raleigh","state":"NC","postalCode":"27607","phoneNo":"(919) 789-4322","faxNo":""},"location":{"latitude":35.813597,"longitude":-78.704541},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":570689,"orgName":"Rowan Urgent Care PC","handicapAccess":true,"specialtyCode1":"","address":{"address1":"1035 Lincolnton Rd.","address2":"","city":"Salisbury","state":"NC","postalCode":"28144","phoneNo":"(800) 893-9698","faxNo":""},"location":{"latitude":35.6647153,"longitude":-80.4888215},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":57089,"orgName":"Nova Urgent Care Pamlico","handicapAccess":true,"specialtyCode1":"","address":{"address1":"13808 Hwy 55","address2":"","city":"Alliance","state":"NC","postalCode":"28509","phoneNo":"(252) 745-7440","faxNo":""},"location":{"latitude":35.143909,"longitude":-76.791307},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":571286,"orgName":"Carolinas Healthcare Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"1010 East Dixon Blvd.","address2":"","city":"Shelby","state":"NC","postalCode":"28152","phoneNo":"(980) 487-2900","faxNo":""},"location":{"latitude":35.273189,"longitude":-81.526676},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":571713,"orgName":"Occumed Walk-In & Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"530 C. North Elam Ave.","address2":"","city":"Greensboro","state":"NC","postalCode":"27403","phoneNo":"(336) 574-0707","faxNo":""},"location":{"latitude":36.0838288,"longitude":-79.822519},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":57210,"orgName":"Carolinas Healthcare Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"5435 Prosperity Church Rd.","address2":"Suite 1100","city":"Charlotte","state":"NC","postalCode":"28269","phoneNo":"(704) 863-9930","faxNo":""},"location":{"latitude":35.367316,"longitude":-80.78883},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":57265,"orgName":"Valley Express Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"1638 Owen Drive","address2":"","city":"Fayetteville","state":"NC","postalCode":"28304","phoneNo":"(910) 615-4372","faxNo":""},"location":{"latitude":35.0325802,"longitude":-78.931257},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":57266,"orgName":"Highsmith-Rainey Express Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"150 Robeson Street","address2":"","city":"Fayetteville","state":"NC","postalCode":"28301","phoneNo":"(910) 615-1059","faxNo":""},"location":{"latitude":35.0543403,"longitude":-78.8873478},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":573568,"orgName":"Applachian Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"2146 Blowing Rock Rd.","address2":"","city":"Boone","state":"NC","postalCode":"28607","phoneNo":"(828) 265-5505","faxNo":""},"location":{"latitude":36.1955854,"longitude":-81.653684},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":57370,"orgName":"CHC Urgent Care-Mt Island","handicapAccess":true,"specialtyCode1":"","address":{"address1":"10210 Couloak Drive","address2":"Suite E","city":"Charlotte","state":"NC","postalCode":"28216","phoneNo":"(704) 801-2000","faxNo":""},"location":{"latitude":35.3242679,"longitude":-80.947736},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":573722,"orgName":"Rex Express Care of Holly Springs","handicapAccess":true,"specialtyCode1":"","address":{"address1":"781 Avent Ferry Rd.","address2":"Suite 102","city":"Holly Springs","state":"NC","postalCode":"27540","phoneNo":"(919) 567-6120","faxNo":""},"location":{"latitude":35.6430584,"longitude":-78.8385093},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":575185,"orgName":"Pittsboro Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"628 East Street","address2":"Suite B","city":"Pittsboro","state":"NC","postalCode":"27312","phoneNo":"(919) 542-4450","faxNo":""},"location":{"latitude":35.719442,"longitude":-79.166979},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":575349,"orgName":"Medwest Urgent Care Sylva","handicapAccess":true,"specialtyCode1":"","address":{"address1":"176 Walmart Plaza","address2":"","city":"Sylva","state":"NC","postalCode":"28779","phoneNo":"(828) 631-9462","faxNo":""},"location":{"latitude":35.3616754,"longitude":-83.2024275},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":576076,"orgName":"Urgent Care of Mountain View","handicapAccess":true,"specialtyCode1":"","address":{"address1":"2872 Highway 127 South","address2":"","city":"Hickory","state":"NC","postalCode":"28602","phoneNo":"(828) 358-0040","faxNo":""},"location":{"latitude":35.6862375,"longitude":-81.3644527},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":57635,"orgName":"Nextcare Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"1110 Kildaire Farm Rd.","address2":"","city":"Cary","state":"NC","postalCode":"27511","phoneNo":"(919) 481-0277","faxNo":""},"location":{"latitude":35.770385,"longitude":-78.782184},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":57635,"orgName":"Nextcare Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"1713 S. Church Street","address2":"","city":"Burlington","state":"NC","postalCode":"27215","phoneNo":"(336) 222-8888","faxNo":""},"location":{"latitude":36.0831566,"longitude":-79.4594383},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":57635,"orgName":"Nextcare Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"1911 Falls Valley Drive","address2":"Suite 100","city":"Raleigh","state":"NC","postalCode":"27615","phoneNo":"(919) 846-3522","faxNo":""},"location":{"latitude":35.898756,"longitude":-78.607665},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":57635,"orgName":"Nextcare Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"212 N. Spence Ave.","address2":"","city":"Goldsboro","state":"NC","postalCode":"27534","phoneNo":"(919) 778-0851","faxNo":""},"location":{"latitude":35.3751983,"longitude":-77.9537556},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":57635,"orgName":"Nextcare Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"217 Glensford Drive","address2":"","city":"Fayetteville","state":"NC","postalCode":"28314","phoneNo":"(910) 483-4647","faxNo":""},"location":{"latitude":35.066102,"longitude":-78.960407},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":57635,"orgName":"Nextcare Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"3210 Prosperity Church Rd.","address2":"Suite 102","city":"Charlotte","state":"NC","postalCode":"28269","phoneNo":"(704) 971-8800","faxNo":""},"location":{"latitude":35.343849,"longitude":-80.771212},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":57635,"orgName":"Nextcare Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"3680 Robinwood Rd.","address2":"","city":"Gastonia","state":"NC","postalCode":"28054","phoneNo":"(704) 215-4058","faxNo":""},"location":{"latitude":35.215185,"longitude":-81.166127},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":57635,"orgName":"Nextcare Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"3680 Robinwood Rd.","address2":"","city":"Gastonia","state":"NC","postalCode":"28054","phoneNo":"(704) 869-9701","faxNo":""},"location":{"latitude":35.215185,"longitude":-81.166127},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":57635,"orgName":"Nextcare Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"4100 Wake Forest Rd.","address2":"","city":"Raleigh","state":"NC","postalCode":"27609","phoneNo":"(919) 872-0076","faxNo":""},"location":{"latitude":35.8367488,"longitude":-78.6134548},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":57635,"orgName":"Nextcare Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"419 Earl Rd.","address2":"","city":"Shelby","state":"NC","postalCode":"28150","phoneNo":"(704) 481-0555","faxNo":""},"location":{"latitude":35.277157,"longitude":-81.534315},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":57635,"orgName":"Nextcare Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"4815 Oleander Drive","address2":"","city":"Wilmington","state":"NC","postalCode":"28403","phoneNo":"(910) 452-1111","faxNo":""},"location":{"latitude":34.210215,"longitude":-77.882464},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":57635,"orgName":"Nextcare Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"6801 Pleasant Pines Drive","address2":"Suite 105","city":"Raleigh","state":"NC","postalCode":"27613","phoneNo":"(919) 788-0099","faxNo":""},"location":{"latitude":35.872819,"longitude":-78.713545},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":57635,"orgName":"Nextcare Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"811 Highway 70 West","address2":"","city":"Garner","state":"NC","postalCode":"27529","phoneNo":"(919) 779-5010","faxNo":""},"location":{"latitude":35.7138971,"longitude":-78.6290116},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":57671,"orgName":"Eastland Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"5717 Albemarle Rd.","address2":"","city":"Charlotte","state":"NC","postalCode":"28212","phoneNo":"(704) 563-2150","faxNo":""},"location":{"latitude":35.204183,"longitude":-80.749269},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":57731,"orgName":"Beachcare Urgent & Family Medical","handicapAccess":true,"specialtyCode1":"","address":{"address1":"5059 Hwy 70 West","address2":"","city":"Morehead City","state":"NC","postalCode":"28557","phoneNo":"(252) 808-3696","faxNo":""},"location":{"latitude":34.7362573,"longitude":-76.7987272},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":57970,"orgName":"Carolinas HC Urgent Care Matthews","handicapAccess":true,"specialtyCode1":"","address":{"address1":"332 North Trade Street","address2":"Suite 1100","city":"Matthews","state":"NC","postalCode":"28105","phoneNo":"(704) 512-6850","faxNo":""},"location":{"latitude":35.1186269,"longitude":-80.7198152},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":58041,"orgName":"Coastal Mds","handicapAccess":true,"specialtyCode1":"","address":{"address1":"415 S. College Rd.","address2":"Unit 18","city":"Wilmington","state":"NC","postalCode":"28403","phoneNo":"(910) 793-4311","faxNo":""},"location":{"latitude":34.232674,"longitude":-77.873493},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":58115,"orgName":"Tricity Family Med & Urgent Care Clinic","handicapAccess":true,"specialtyCode1":"","address":{"address1":"107 Hyannis Drive","address2":"","city":"Holly Springs","state":"NC","postalCode":"27540","phoneNo":"(919) 363-8666","faxNo":""},"location":{"latitude":35.6770489,"longitude":-78.83237},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":58117,"orgName":"Quick Med, Inc.","handicapAccess":true,"specialtyCode1":"","address":{"address1":"340 Northeast Blvd.","address2":"","city":"Clinton","state":"NC","postalCode":"28328","phoneNo":"(910) 596-0093","faxNo":""},"location":{"latitude":35.010889,"longitude":-78.317239},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":58167,"orgName":"The Pediatric Express, PA","handicapAccess":true,"specialtyCode1":"","address":{"address1":"6402 McCrimmon Pkwy.","address2":"","city":"Morrisville","state":"NC","postalCode":"27560","phoneNo":"(919) 467-7425","faxNo":""},"location":{"latitude":35.8341629,"longitude":-78.858776},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":58190,"orgName":"C. H. U. C. Mint Hill","handicapAccess":true,"specialtyCode1":"","address":{"address1":"10545 Blair Rd.","address2":"Suite 1200","city":"Mint Hill","state":"NC","postalCode":"28227","phoneNo":"(704) 863-9600","faxNo":""},"location":{"latitude":35.2122072,"longitude":-80.6328863},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":58202,"orgName":"Dawson Street Urgent Care & Medical","handicapAccess":true,"specialtyCode1":"","address":{"address1":"608 Dawson Street","address2":"Suite 101","city":"Wilmington","state":"NC","postalCode":"28401","phoneNo":"(910) 667-0470","faxNo":""},"location":{"latitude":34.2244332,"longitude":-77.9405227},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":58510,"orgName":"First Choice Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"615 South Hughes Blvd.","address2":"","city":"Elizabeth City","state":"NC","postalCode":"27909","phoneNo":"(252) 338-3111","faxNo":""},"location":{"latitude":36.291118,"longitude":-76.2508538},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":58602,"orgName":"Wilson Immediate Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"1725 S. Tarboro Street","address2":"","city":"Wilson","state":"NC","postalCode":"27893","phoneNo":"(252) 237-2891","faxNo":""},"location":{"latitude":35.719748,"longitude":-77.945337},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":58661,"orgName":"Medchoice","handicapAccess":true,"specialtyCode1":"","address":{"address1":"58-C Us Highway 64 West","address2":"Lexington Center","city":"Lexington","state":"NC","postalCode":"27292","phoneNo":"(336) 224-1433","faxNo":""},"location":{"latitude":35.818059,"longitude":-80.235248},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":58691,"orgName":"Arboretum Urgent Care Center","handicapAccess":true,"specialtyCode1":"","address":{"address1":"7810 Providence Rd.","address2":"Suite 102","city":"Charlotte","state":"NC","postalCode":"28226","phoneNo":"(704) 543-6636","faxNo":""},"location":{"latitude":35.100468,"longitude":-80.780353},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":58706,"orgName":"Concentra Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"1614 South Blvd.","address2":"","city":"Charlotte","state":"NC","postalCode":"28203","phoneNo":"(866) 944-6046","faxNo":""},"location":{"latitude":35.213578,"longitude":-80.8563},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":58706,"orgName":"Concentra Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"2835 Jeff Adams Drive","address2":"#a","city":"Charlotte","state":"NC","postalCode":"28206","phoneNo":"(866) 944-6046","faxNo":""},"location":{"latitude":35.271135,"longitude":-80.83613},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":58706,"orgName":"Concentra Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"4104 Surles Court","address2":"Suites 9-13","city":"Durham","state":"NC","postalCode":"27703","phoneNo":"(866) 944-6046","faxNo":""},"location":{"latitude":35.8685043,"longitude":-78.849485},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":58706,"orgName":"Concentra Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"4221 Tuckaseegee Rd.","address2":"","city":"Charlotte","state":"NC","postalCode":"28208","phoneNo":"(866) 944-6046","faxNo":""},"location":{"latitude":35.245821,"longitude":-80.896247},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":58706,"orgName":"Concentra Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"4410 Providence Lane","address2":"Suite 1","city":"Winston Salem","state":"NC","postalCode":"27106","phoneNo":"(866) 944-6046","faxNo":""},"location":{"latitude":36.151412,"longitude":-80.270821},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":58706,"orgName":"Concentra Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"4909 Green Rd.","address2":"","city":"Raleigh","state":"NC","postalCode":"27616","phoneNo":"(866) 944-6046","faxNo":""},"location":{"latitude":35.8525648,"longitude":-78.5866741},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":58706,"orgName":"Concentra Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"646 Westinghouse Blvd.","address2":"","city":"Charlotte","state":"NC","postalCode":"28273","phoneNo":"(866) 944-6046","faxNo":""},"location":{"latitude":35.116054,"longitude":-80.925432},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":58706,"orgName":"Concentra Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"8943 South Tryon Street","address2":"Suite K","city":"Charlotte","state":"NC","postalCode":"28273","phoneNo":"(866) 944-6046","faxNo":""},"location":{"latitude":35.1367193,"longitude":-80.9374797},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":58706,"orgName":"Concentra Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"9200 Harris Corners Pkwy.","address2":"Suite K","city":"Charlotte","state":"NC","postalCode":"28269","phoneNo":"(866) 944-6046","faxNo":""},"location":{"latitude":35.347096,"longitude":-80.844395},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":58874,"orgName":"Carolina Quick Care, PA","handicapAccess":true,"specialtyCode1":"","address":{"address1":"1261 Julian R. Allsbrook","address2":"Highway","city":"Roanoke Rapids","state":"NC","postalCode":"27870","phoneNo":"(252) 537-5600","faxNo":""},"location":{"latitude":36.4348267,"longitude":-77.6410143},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":58874,"orgName":"Carolina Quick Care, PA","handicapAccess":true,"specialtyCode1":"","address":{"address1":"2503-B Forest Hills Rd.","address2":"","city":"Wilson","state":"NC","postalCode":"27893","phoneNo":"(252) 991-0555","faxNo":""},"location":{"latitude":35.734056,"longitude":-77.952602},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":58874,"orgName":"Carolina Quick Care, PA","handicapAccess":true,"specialtyCode1":"","address":{"address1":"2908 N. Heritage Street","address2":"","city":"Kinston","state":"NC","postalCode":"28501","phoneNo":"(252) 523-3111","faxNo":""},"location":{"latitude":35.2626103,"longitude":-77.5826783},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":58874,"orgName":"Carolina Quick Care, PA","handicapAccess":true,"specialtyCode1":"","address":{"address1":"3535 Memorial Drive","address2":"Suite C","city":"Greenville","state":"NC","postalCode":"27834","phoneNo":"(252) 353-3111","faxNo":""},"location":{"latitude":35.6753622,"longitude":-77.3638225},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":58874,"orgName":"Carolina Quick Care, PA","handicapAccess":true,"specialtyCode1":"","address":{"address1":"550 N. Winstead Ave.","address2":"","city":"Rocky Mount","state":"NC","postalCode":"27804","phoneNo":"(252) 451-3411","faxNo":""},"location":{"latitude":35.973255,"longitude":-77.849344},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":59026,"orgName":"Duke Urgent Care Morrisville","handicapAccess":true,"specialtyCode1":"","address":{"address1":"10950 Chapel Hill Rd.","address2":"Suite A","city":"Morrisville","state":"NC","postalCode":"27560","phoneNo":"(919) 327-1630","faxNo":""},"location":{"latitude":35.8553875,"longitude":-78.8411951},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":59133,"orgName":"Urgent Care Center","handicapAccess":true,"specialtyCode1":"","address":{"address1":"55 Buckeye Cove Rd.","address2":"","city":"Canton","state":"NC","postalCode":"28716","phoneNo":"(828) 648-0282","faxNo":""},"location":{"latitude":35.557203,"longitude":-82.853061},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":59133,"orgName":"Urgent Care Center","handicapAccess":true,"specialtyCode1":"","address":{"address1":"55 Buckeye Cove Rd.","address2":"","city":"Canton","state":"NC","postalCode":"28721","phoneNo":"(828) 648-0282","faxNo":""},"location":{"latitude":35.557203,"longitude":-82.853061},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":59133,"orgName":"Urgent Care Center","handicapAccess":true,"specialtyCode1":"","address":{"address1":"556 Hazelwood Ave.","address2":"","city":"Waynesville","state":"NC","postalCode":"28786","phoneNo":"(828) 452-8890","faxNo":""},"location":{"latitude":35.4780824,"longitude":-83.0048264},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":59179,"orgName":"Scotland Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"500 Lauchwood Drive","address2":"","city":"Laurinburg","state":"NC","postalCode":"28352","phoneNo":"(910) 277-8300","faxNo":""},"location":{"latitude":34.751245,"longitude":-79.467888},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":59341,"orgName":"Pro Med Minor Emergency","handicapAccess":true,"specialtyCode1":"","address":{"address1":"1867-D Remount Rd.","address2":"","city":"Gastonia","state":"NC","postalCode":"28054","phoneNo":"(704) 969-7030","faxNo":""},"location":{"latitude":35.268468,"longitude":-81.144573},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":59341,"orgName":"Pro Med Minor Emergency","handicapAccess":true,"specialtyCode1":"","address":{"address1":"628 W. Innes Street","address2":"","city":"Salisbury","state":"NC","postalCode":"28144","phoneNo":"(704) 637-8040","faxNo":""},"location":{"latitude":35.6729429,"longitude":-80.475541},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":59809,"orgName":"Cabarrus Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"1090 Northeast Gateway","address2":"Court N.E. Suite 202","city":"Concord","state":"NC","postalCode":"28025","phoneNo":"(704) 403-9050","faxNo":""},"location":{"latitude":35.4545629,"longitude":-80.5923961},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":60140,"orgName":"White Oak Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"197b NC Hwy 42 North","address2":"","city":"Asheboro","state":"NC","postalCode":"27203","phoneNo":"(336) 625-2560","faxNo":""},"location":{"latitude":35.7076241,"longitude":-79.8123634},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":60164,"orgName":"Immediate Care of Goldsboro","handicapAccess":true,"specialtyCode1":"","address":{"address1":"2604 Medical Office Place","address2":"","city":"Goldsboro","state":"NC","postalCode":"27534","phoneNo":"(919) 580-0004","faxNo":""},"location":{"latitude":35.400801,"longitude":-77.954913},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":606761,"orgName":"Fayetteville Urgent Care & Family","handicapAccess":true,"specialtyCode1":"","address":{"address1":"4534 Raeford Rd.","address2":"","city":"Fayetteville","state":"NC","postalCode":"28304","phoneNo":"(910) 425-5999","faxNo":""},"location":{"latitude":35.043772,"longitude":-78.955016},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":607082,"orgName":"A. Plus Urgent Care LLC","handicapAccess":true,"specialtyCode1":"","address":{"address1":"127 East Main Street","address2":"Suite 100","city":"Youngsville","state":"NC","postalCode":"27596","phoneNo":"(919) 263-9377","faxNo":""},"location":{"latitude":36.0246823,"longitude":-78.4757576},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":607082,"orgName":"A. Plus Urgent Care LLC","handicapAccess":true,"specialtyCode1":"","address":{"address1":"375 N. Wall Street","address2":"","city":"Benson","state":"NC","postalCode":"27504","phoneNo":"(919) 207-0259","faxNo":""},"location":{"latitude":35.385515,"longitude":-78.5473389},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":60711,"orgName":"Rex Express Care of Cary","handicapAccess":true,"specialtyCode1":"","address":{"address1":"1515 S.W. Cary Parkway","address2":"Suite 130","city":"Cary","state":"NC","postalCode":"27511","phoneNo":"(919) 387-3180","faxNo":""},"location":{"latitude":35.753655,"longitude":-78.810433},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":60798,"orgName":"Rocky Point Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"27 Commerce Drive","address2":"Suite B","city":"Rocky Point","state":"NC","postalCode":"28457","phoneNo":"(910) 675-8089","faxNo":""},"location":{"latitude":34.447496,"longitude":-77.8812559},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":60855,"orgName":"Sisters of Mercy Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"1201 Patton Ave.","address2":"","city":"Asheville","state":"NC","postalCode":"28806","phoneNo":"(828) 252-4878","faxNo":""},"location":{"latitude":35.586204,"longitude":-82.601245},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":60855,"orgName":"Sisters of Mercy Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"155 Weaver Blvd.","address2":"","city":"Weaverville","state":"NC","postalCode":"28787","phoneNo":"(828) 645-5088","faxNo":""},"location":{"latitude":35.7038803,"longitude":-82.5680498},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":60855,"orgName":"Sisters of Mercy Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"1833 Hendersonville Rd.","address2":"Suite 140","city":"Asheville","state":"NC","postalCode":"28803","phoneNo":"(828) 274-1462","faxNo":""},"location":{"latitude":35.5029977,"longitude":-82.5255307},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":60855,"orgName":"Sisters of Mercy Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"22 Trust Lane","address2":"Suite 101","city":"Brevard","state":"NC","postalCode":"28712","phoneNo":"(828) 883-2600","faxNo":""},"location":{"latitude":35.238481,"longitude":-82.732508},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":60855,"orgName":"Sisters of Mercy Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"77 Airport Rd.","address2":"","city":"Arden","state":"NC","postalCode":"28704","phoneNo":"(828) 651-0098","faxNo":""},"location":{"latitude":35.45358,"longitude":-82.522412},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":60984,"orgName":"Cornerstone Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"4515 Premier Drive","address2":"Suite 201","city":"High Point","state":"NC","postalCode":"27262","phoneNo":"(336) 802-2222","faxNo":""},"location":{"latitude":36.035563,"longitude":-79.950577},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":610496,"orgName":"Carolinas Healthcare Childrens Uc","handicapAccess":true,"specialtyCode1":"","address":{"address1":"6025 Blakeney Park Drive","address2":"Suite 100","city":"Charlotte","state":"NC","postalCode":"28277","phoneNo":"(704) 667-4480","faxNo":""},"location":{"latitude":35.0320066,"longitude":-80.8069805},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":61054,"orgName":"Johnston Med Associates Quickmed","handicapAccess":true,"specialtyCode1":"","address":{"address1":"514 N. Brightleaf Blvd.","address2":"Suite 1200","city":"Smithfield","state":"NC","postalCode":"27577","phoneNo":"(919) 938-0257","faxNo":""},"location":{"latitude":35.5134786,"longitude":-78.3337254},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":61054,"orgName":"Johnston Med Associates Quickmed","handicapAccess":true,"specialtyCode1":"","address":{"address1":"514 N. Brightleaf Blvd.","address2":"Suite 1620","city":"Smithfield","state":"NC","postalCode":"27577","phoneNo":"(919) 938-0257","faxNo":""},"location":{"latitude":35.5134786,"longitude":-78.3337254},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":612109,"orgName":"Nash Street Healthcare","handicapAccess":true,"specialtyCode1":"","address":{"address1":"3725 Nash Street N.W.","address2":"","city":"Wilson","state":"NC","postalCode":"27896","phoneNo":"(252) 234-1720","faxNo":""},"location":{"latitude":35.76937,"longitude":-77.940624},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":61229,"orgName":"Physicians East Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"1711 East Arlington Blvd.","address2":"","city":"Greenville","state":"NC","postalCode":"27858","phoneNo":"(252) 355-4357","faxNo":""},"location":{"latitude":35.568927,"longitude":-77.356351},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":61229,"orgName":"Physicians East Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"1850 West Arlington Blvd.","address2":"","city":"Greenville","state":"NC","postalCode":"27834","phoneNo":"(252) 413-6202","faxNo":""},"location":{"latitude":35.5993679,"longitude":-77.4052085},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":612844,"orgName":"Chuc Salisbury","handicapAccess":true,"specialtyCode1":"","address":{"address1":"340 Jake Alexander Blvd.","address2":"West Suite 105","city":"Salisbury","state":"NC","postalCode":"28147","phoneNo":"(704) 403-6240","faxNo":""},"location":{"latitude":35.657432,"longitude":-80.499675},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":614176,"orgName":"Health Zone PLLC","handicapAccess":true,"specialtyCode1":"","address":{"address1":"707 Lassiter Street","address2":"","city":"Smithfield","state":"NC","postalCode":"27577","phoneNo":"(919) 912-5160","faxNo":""},"location":{"latitude":35.515568,"longitude":-78.335719},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":614614,"orgName":"Primecare","handicapAccess":true,"specialtyCode1":"","address":{"address1":"111 Gateway Center Drive","address2":"","city":"Kernersville","state":"NC","postalCode":"27284","phoneNo":"(336) 996-2173","faxNo":""},"location":{"latitude":36.1140232,"longitude":-80.0660471},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":614614,"orgName":"Primecare","handicapAccess":true,"specialtyCode1":"","address":{"address1":"3833 High Point Rd.","address2":"","city":"Greensboro","state":"NC","postalCode":"27407","phoneNo":"(336) 852-7530","faxNo":""},"location":{"latitude":36.037027,"longitude":-79.857958},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":614614,"orgName":"Primecare","handicapAccess":true,"specialtyCode1":"","address":{"address1":"501 Hickory Branch Rd.","address2":"","city":"Greensboro","state":"NC","postalCode":"27409","phoneNo":"(336) 878-2260","faxNo":""},"location":{"latitude":36.074746,"longitude":-79.959824},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":614614,"orgName":"Primecare","handicapAccess":true,"specialtyCode1":"","address":{"address1":"7811 Northpoint Blvd.","address2":"","city":"Winston Salem","state":"NC","postalCode":"27106","phoneNo":"(336) 759-2070","faxNo":""},"location":{"latitude":36.150393,"longitude":-80.278525},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":617701,"orgName":"Firsthealth Firstcare Convenient","handicapAccess":true,"specialtyCode1":"","address":{"address1":"4565 Fayetteville Rd.","address2":"Suite A","city":"Raeford","state":"NC","postalCode":"28376","phoneNo":"(910) 878-5100","faxNo":""},"location":{"latitude":35.0093175,"longitude":-79.1777122},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":618787,"orgName":"Lakeside Family Physicians","handicapAccess":true,"specialtyCode1":"","address":{"address1":"130 Plantation Ridge Drive","address2":"Suite 100","city":"Mooresville","state":"NC","postalCode":"28117","phoneNo":"(704) 316-1635","faxNo":""},"location":{"latitude":35.5895432,"longitude":-80.8766873},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":618787,"orgName":"Lakeside Family Physicians","handicapAccess":true,"specialtyCode1":"","address":{"address1":"19485 Old Jetton Rd.","address2":"Suite 100","city":"Cornelius","state":"NC","postalCode":"28031","phoneNo":"(704) 384-1775","faxNo":""},"location":{"latitude":35.4800121,"longitude":-80.8918966},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":705487,"orgName":"Hickory Urgent Care Center","handicapAccess":true,"specialtyCode1":"","address":{"address1":"2134 14th Ave. Circle","address2":"N.W.","city":"Hickory","state":"NC","postalCode":"28601","phoneNo":"(828) 991-4660","faxNo":""},"location":{"latitude":35.7472106,"longitude":-81.2934167},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":714863,"orgName":"Wfup Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"231 Lewisville-Clemmons","address2":"Rd.","city":"Clemmons","state":"NC","postalCode":"27102","phoneNo":"(336) 713-0400","faxNo":""},"location":{"latitude":36.0944295,"longitude":-80.4168624},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":714863,"orgName":"Wfup Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"Healthcare Center","address2":"Davie-1188 Yadkinville Rd.","city":"Mocksville","state":"NC","postalCode":"27208","phoneNo":"(336) 713-0555","faxNo":""},"location":{"latitude":35.556588,"longitude":-79.5266211},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":71849,"orgName":"Duke Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"1901 Hillandale Rd.","address2":"Suite D","city":"Durham","state":"NC","postalCode":"27705","phoneNo":"(919) 383-4355","faxNo":""},"location":{"latitude":36.0334195,"longitude":-78.9357601},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":71849,"orgName":"Duke Urgent Care","handicapAccess":true,"specialtyCode1":"","address":{"address1":"5716 Fayetteville Rd.","address2":"","city":"Durham","state":"NC","postalCode":"27713","phoneNo":"(919) 572-1868","faxNo":""},"location":{"latitude":35.9220842,"longitude":-78.9279373},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":72226,"orgName":"Medac Health Services, PA","handicapAccess":true,"specialtyCode1":"","address":{"address1":"11711 Statesville Blvd.","address2":"","city":"Cleveland","state":"NC","postalCode":"27013","phoneNo":"(910) 791-0075","faxNo":""},"location":{"latitude":35.7299723,"longitude":-80.6926675},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":72226,"orgName":"Medac Health Services, PA","handicapAccess":true,"specialtyCode1":"","address":{"address1":"1225 Huffman Mill Rd.","address2":"Suite 102","city":"Burlington","state":"NC","postalCode":"27215","phoneNo":"(910) 791-0075","faxNo":""},"location":{"latitude":36.066214,"longitude":-79.500565},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":72226,"orgName":"Medac Health Services, PA","handicapAccess":true,"specialtyCode1":"","address":{"address1":"1331 North Elm Street","address2":"041","city":"Greensboro","state":"NC","postalCode":"27401","phoneNo":"(910) 791-0075","faxNo":""},"location":{"latitude":36.092262,"longitude":-79.789095},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":72226,"orgName":"Medac Health Services, PA","handicapAccess":true,"specialtyCode1":"","address":{"address1":"1442 Military Cutoff Rd.","address2":"","city":"Wilmington","state":"NC","postalCode":"28403","phoneNo":"(910) 256-6088","faxNo":""},"location":{"latitude":34.224932,"longitude":-77.830516},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":72226,"orgName":"Medac Health Services, PA","handicapAccess":true,"specialtyCode1":"","address":{"address1":"1503 E. Broad Street","address2":"","city":"Statesville","state":"NC","postalCode":"28625","phoneNo":"(910) 791-0075","faxNo":""},"location":{"latitude":35.791679,"longitude":-80.861121},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":72226,"orgName":"Medac Health Services, PA","handicapAccess":true,"specialtyCode1":"","address":{"address1":"301 N. Roxboro Rd.","address2":"","city":"Durham","state":"NC","postalCode":"27704","phoneNo":"(910) 791-0075","faxNo":""},"location":{"latitude":36.1434797,"longitude":-78.9054864},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":72226,"orgName":"Medac Health Services, PA","handicapAccess":true,"specialtyCode1":"","address":{"address1":"4402 Shipyard Blvd.","address2":"","city":"Wilmington","state":"NC","postalCode":"28403","phoneNo":"(910) 791-0075","faxNo":""},"location":{"latitude":34.1991797,"longitude":-77.8907789},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":72226,"orgName":"Medac Health Services, PA","handicapAccess":true,"specialtyCode1":"","address":{"address1":"4536 Technology Drive","address2":"Suite 4","city":"Wilmington","state":"NC","postalCode":"28405","phoneNo":"(910) 791-0075","faxNo":""},"location":{"latitude":34.309258,"longitude":-77.874744},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":72226,"orgName":"Medac Health Services, PA","handicapAccess":true,"specialtyCode1":"","address":{"address1":"509 Olde Waterford Way","address2":"Suite 101","city":"Leland","state":"NC","postalCode":"28451","phoneNo":"(910) 791-0075","faxNo":""},"location":{"latitude":34.225391,"longitude":-78.025885},"primaryPhysician":{"firstName":"","lastName":""}},{"providerNo":72226,"orgName":"Medac Health Services, PA","handicapAccess":true,"specialtyCode1":"","address":{"address1":"8115 Market Street","address2":"Suite 100","city":"Wilmington","state":"NC","postalCode":"28411","phoneNo":"(910) 686-1972","faxNo":""},"location":{"latitude":34.297282,"longitude":-77.79521},"primaryPhysician":{"firstName":"","lastName":""}}
  ];
   

	db.collection("centers", function(err, collection) {
		/*
		 * a bit of clean up. by removing everything in the
		 * collection, we won't have any trouble each time the
		 * server restarts.
		 */
		collection.remove({}, function() {
			
		});

		collection.insert(centers, {
			safe : true
		}, function(err, result) {
			if (err) {
				console.log("There was an error");
				console.log(err);
			}
		});

		// create a geospatial index on the location property
		collection.ensureIndex({location : "2d"}, function(err, indexName) {
			
		});
	});
};