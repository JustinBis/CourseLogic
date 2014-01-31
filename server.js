/* * * * * * * * * * * * * * * * * * * * * * * * * * *
 * CourseLogic Main Server
 * 
 * This is the main server for the CourseLogic website
 * and API. It will serve both static files for the
 * front-end and properly route API requests for the
 * REST-style back-end.
 *
 * By Justin Bisignano
 * * * * * * * * * * * * * * * * * * * * * * * * * * */

var
	express = require('express'),
	routes = require('./routes'),
	database = require('./database'),
	app = express(),
	debug = process.argv[2] == "debug";

// App configuration
if (debug) app.use(express.logger('dev'));
app.use(app.router);
app.use(routes);

app.get('/updateAll', function(req, res){
	
	res.send('Updated');
});

app.use(express.static(__dirname + '/website' ));
// 404
app.use(function(req, res){
  res.send(404, "Looking around, eh? Well, see, this page doesn't exist. \
  				Or does it? Either way, 404.");
});
// Error handling
app.use(function(err, req, res, next){
  console.error(err);
  res.send(500, "Oh no! Internal Server Error! Don't worry, a team of highly \
  				trained monkeys have been dispatched to check it out.");
});

// Finally, bind the express app to a port, with 80 as the default
app.listen(process.env.PORT || 80);