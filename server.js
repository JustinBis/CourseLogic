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
	schedule = require('node-schedule'),
	debug = process.argv[2] == "debug";

// App configuration
console.log('Configuring App...');

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
  				knowledgable gorillas have been dispatched to check it out.");
});

// Bind the express app to a port, with 80 as the default
app.listen(process.env.PORT || 80);
console.log('App bound to port', process.env.PORT || 80);

// Include the scraper and run it once at startup
console.log('Loading scrapers and running first scrape...')
scraper = require('./scraper');
scraper.main();

// Schedule the scraper service with node-schedule
// This rule is run daily at 5AM
var rule = new schedule.RecurrenceRule();
rule.hour = 5;
rule.minute = 0;

var scraperJob = schedule.scheduleJob(rule, function(){
	console.log('Scraping websites as scheduled...');
	scraper.main();
});

