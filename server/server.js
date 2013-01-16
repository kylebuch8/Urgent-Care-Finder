var express = require("express"),
	centers = require("./routes/centers");
	app = express();

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      next();
    }
};

app.configure(function() {
	app.use(allowCrossDomain);
	app.use(express.logger("dev"));
	app.use(express.bodyParser());
});

app.get("/centers", centers.findAll);
app.get("/centers/:id", centers.findById);

app.listen(3000);
console.log("Listening on port 3000...");