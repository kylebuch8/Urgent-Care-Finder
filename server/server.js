var express = require("express"),
	centers = require("./routes/centers");
	app = express();

// setup jsonp
app.enable("jsonp callback");

app.get("/centers", centers.findAll);
app.get("/centers/:id", centers.findById);

app.listen(3000);
console.log("Listening on port 3000...");