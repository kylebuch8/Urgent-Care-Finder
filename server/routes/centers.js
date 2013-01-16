var mongo = require("mongodb");
 
var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;
 
var server = new Server("localhost", 27017, {auto_reconnect : true});
db = new Db("urgentcare", server, {safe : true});

db.open(function(err, db) {
	if (!err) {
		console.log("Connected to 'urgentcare' database");

		db.createCollection("centers", {strict : false}, function(err, collection) {
			if (!err) {
				console.log("The 'centers' collection doesn't exist. Creating it with sample data...");
				populateDb();
			}
		});
	}
});

exports.findAll = function(req, res) {
	db.collection("centers", function(err, collection) {
		collection.find().toArray(function(err, items) {
			res.send(items);
		});
	});
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
	var centers = [
		{"provider_id":498228,"name":"Haymount Urgent Care PC","phone_number":"(910) 484-1210","street_address1":"1909 Bragg Blvd.","street_address2":"Suite 94","city":"Fayetteville","state_code":"NC","zip_code":"28303","location":{"longitude":-78.9102155,"latitude":35.0689414},"handicap_accessible":true},
		{"provider_id":498754,"name":"Roxboro Med Access PLLC","phone_number":"(336) 330-0400","street_address1":"3762 Durham Rd.","street_address2":"Suite A","city":"Roxboro","state_code":"NC","zip_code":"27573","location":{"longitude":-78.982451,"latitude":36.341315},"handicap_accessible":true},
		{"provider_id":505890,"name":"Duke Urgent Care Knightdale","phone_number":"(919) 232-5205","street_address1":"162 Legacy Oaks Drive","street_address2":"Suite 101","city":"Knightdale","state_code":"NC","zip_code":"27545","location":{"longitude":-78.517647,"latitude":35.797663},"handicap_accessible":true},
		{"provider_id":512721,"name":"Rex Express Care of Knightdale","phone_number":"(919) 747-5210","street_address1":"6602 Knightdale Blvd.","street_address2":"Suite 102","city":"Knightdale","state_code":"NC","zip_code":"27545","location":{"longitude":-78.507744,"latitude":35.795243},"handicap_accessible":true},
		{"provider_id":516185,"name":"Community Immediate Care Center","phone_number":"(919) 528-7171","street_address1":"1614 NC Hwy 56","street_address2":"","city":"Creedmoor","state_code":"NC","zip_code":"27522","location":{"longitude":-78.7214842,"latitude":36.143907},"handicap_accessible":true},
		{"provider_id":516807,"name":"Duke Urgent Care Brier Creek","phone_number":"(919) 206-4889","street_address1":"10211 Alm Street","street_address2":"Suite 1200","city":"Raleigh","state_code":"NC","zip_code":"27617","location":{"longitude":-78.798196,"latitude":35.900576},"handicap_accessible":true},
		{"provider_id":521887,"name":"Medcenter Urgent Care Kernersville","phone_number":"(336) 992-4800","street_address1":"1635 NC Highway 66 South","street_address2":"Suite 235","city":"Kernersville","state_code":"NC","zip_code":"27284","location":{"longitude":-80.061821,"latitude":36.080696},"handicap_accessible":true},
		{"provider_id":523084,"name":"Onslow Urgent Care PLLC","phone_number":"(910) 577-1555","street_address1":"325 Western Blvd.","street_address2":"","city":"Jacksonville","state_code":"NC","zip_code":"28546","location":{"longitude":-77.383663,"latitude":34.764645},"handicap_accessible":true},
		{"provider_id":523084,"name":"Onslow Urgent Care PLLC","phone_number":"(910) 269-2053","street_address1":"4222 Long Beach Rd.","street_address2":"","city":"Southport","state_code":"NC","zip_code":"28461","location":{"longitude":-78.066337,"latitude":33.933417},"handicap_accessible":true},
		{"provider_id":523084,"name":"Onslow Urgent Care PLLC","phone_number":"(919) 639-9001","street_address1":"511 N. Raleigh Street","street_address2":"","city":"Angier","state_code":"NC","zip_code":"27501","location":{"longitude":-78.741199,"latitude":35.514638},"handicap_accessible":true},
		{"provider_id":52956,"name":"Cox Road Urgent Care","phone_number":"(704) 852-9561","street_address1":"603 Cox Rd.","street_address2":"","city":"Gastonia","state_code":"NC","zip_code":"28054","location":{"longitude":-81.1346318,"latitude":35.26924},"handicap_accessible":true},
		{"provider_id":530742,"name":"Priority Care","phone_number":"(910) 590-2916","street_address1":"522 Beaman Street","street_address2":"","city":"Clinton","state_code":"NC","zip_code":"28328","location":{"longitude":-78.3238435,"latitude":35.0082181},"handicap_accessible":true},
		{"provider_id":53159,"name":"Piedmont Urgent Care of NC","phone_number":"(828) 431-4955","street_address1":"2972 N. Center Street","street_address2":"","city":"Hickory","state_code":"NC","zip_code":"28601","location":{"longitude":-81.329799,"latitude":35.7715303},"handicap_accessible":true},
		{"provider_id":53532,"name":"Pine Ridge Urgent Care & Occupation","phone_number":"(919) 775-3020","street_address1":"1413 Greenway Court","street_address2":"","city":"Sanford","state_code":"NC","zip_code":"27330","location":{"longitude":-79.1775673,"latitude":35.5057281},"handicap_accessible":true},
		{"provider_id":53539,"name":"Wake Forest Urgent Care","phone_number":"(919) 570-2000","street_address1":"2115-A South Main Street","street_address2":"","city":"Wake Forest","state_code":"NC","zip_code":"27587","location":{"longitude":-78.534201,"latitude":35.947752},"handicap_accessible":true},
		{"provider_id":53649,"name":"White Oak Urgent Care","phone_number":"(336) 495-1001","street_address1":"608 W. Academy Street","street_address2":"","city":"Randleman","state_code":"NC","zip_code":"27317","location":{"longitude":-79.816216,"latitude":35.820754},"handicap_accessible":true},
		{"provider_id":537516,"name":"Southeastern Urgent Care Pembroke","phone_number":"(910) 521-0564","street_address1":"812 Candy Park Rd.","street_address2":"","city":"Pembroke","state_code":"NC","zip_code":"28372","location":{"longitude":-79.1818059,"latitude":34.6600984},"handicap_accessible":true},
		{"provider_id":53786,"name":"Lakeview Urgent Care","phone_number":"(910) 423-7771","street_address1":"3622 N. Main Street","street_address2":"","city":"Hope Mills","state_code":"NC","zip_code":"28348","location":{"longitude":-78.947238,"latitude":34.972814},"handicap_accessible":true},
		{"provider_id":53786,"name":"Lakeview Urgent Care","phone_number":"(910) 486-0044","street_address1":"726 Ramsey Street","street_address2":"","city":"Fayetteville","state_code":"NC","zip_code":"28304","location":{"longitude":-78.8771496,"latitude":35.0649336},"handicap_accessible":true},
		{"provider_id":538089,"name":"Carolinas Healthcareurgent Care","phone_number":"(980) 212-7000","street_address1":"275 Hwy 16 North","street_address2":"Suite 104","city":"Denver","state_code":"NC","zip_code":"28037","location":{"longitude":-81.0068498,"latitude":35.4395573},"handicap_accessible":true}
	];

	db.collection("centers", function(err, collection) {
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