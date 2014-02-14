/////////////////////////////////////
// CourseLogic Scraper Main Class  //
//                                 //
// This base is intended to read   //
// all of the scrapers found in    //
// the ./scrapers/ sub-folder,     //
// running them sequentially and   //
// pushing results to the database //
//                                 //
// Written by Justin Bisignano     //
// Spring 2013                     //
/////////////////////////////////////


// Path to the folder containing all of scrapers
var scrapersPath = __dirname+'/scrapers/';

// Database class. Should exist one directory up.
var database = require('../database')


/*
	This main function will run the main functions from each scraper
	in the scrapersPath directory, passing the results as a callback to
	the updateDatabase() function.
*/
function main(){
	// Loads all of the scrapers into a list.
	var scrapersList = loadScrapers(scrapersPath);

	// Loops through the list, calling the main() function of each scraper
	// and then passing the results to the database handler
	scrapersList.forEach(function(scraper) {
		scraper.main( database.updateClassData );
	});
}


/*
	Searches the given path for all .js files and requires each, adding
	each result to the returned array.
*/
function loadScrapers(path){
	var scrapersList = [];

	require("fs").readdirSync(path).forEach(function(file) {
		// Checks if .js is at the end of the file string
		if(/.js$/.test(file))
		{
			scrapersList.push(require(path + file));
		}
	});

	return scrapersList;
}

// Export the main method
exports.main = main;
