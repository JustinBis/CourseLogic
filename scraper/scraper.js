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
var scrapersPath = './scrapers/';

// Database class. Should exist one directory up.
var Database = require('../database')


/*
	This main function will run the main functions from each scraper
	in the scrapersPath directory, passing the results as a callback to
	the updateDatabase() function.
*/
function main(){
	// Loads all of the scrapers into a list.
	var scrapersList = loadScrapers(scrapersPath);

	// Loops through the list, calling the main() function of each scraper
	// and passes in the updateDatabase() function as the callback for each
	scrapersList.forEach(function(scraper) {
		scraper.main(updateDatabase);
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


/*
	TODO
	Input: data, an object formatted like the one described in the notes.txt
*/
function updateDatabase(data) {
	console.log("Called updateDatabase()")
}

// For testing, so we can run this directly
main();
