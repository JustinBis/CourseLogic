///////////////////////////
// Class scraper for     //
// University of Florida //
// Written by            //
// Justin Bisignano      //
///////////////////////////

// Required modules
var cheerio = require('cheerio');
var request = require('request');
var events = require('events');

// Debug and verbosity controls
var debug = false; // Print debug info?
var warnings = false; // Print warnings?

// Used to control flow between functions
var eventEmitter = new events.EventEmitter();

// The URL to begin scraping from.
var startURL = "http://www.registrar.ufl.edu/soc/201401/all/";


//*****************************//
//	All data below is used as  //
//	part of the output object  //
//*****************************//


// A unique ID to identify the school we are scraping classes for
var schoolID = "UF";
// The official name of the school
var schoolName = "University of Florida";

// The three data stores needed as part of the return object
var subjects = [];
var classTopics = {}; // Will be converted to a list by formatReturnObject
var classOptions = [];


/**
 * The main method; runs upon script initilization.
 * Passes a formatted javascript object of all 
 * scraped classes onto the given callback function
 */
function main(callback) {

	// First, collect a list of the pages we need to scrape (Async)
	// Will also call scrapeSubjects() with the startURL's html
	// so we don't send an extra request
	getPageURLs(startURL, function(urls){
		// Now, for each URL in the list, fire an asynchronous 
		// page reqest and pass it off to a handler
		// while keeping track of the number of requests so
		// we know when they've all completed
		var completedRequestsCount = 0;
		for( var i in urls )
		{
			request(urls[i], function(error, response, html){
				if (!error && response.statusCode == 200)
				{
					handleClassPage(html, function(){
						// Mark the request as complete
						completedRequestsCount += 1;
						requestComplete(completedRequestsCount, urls.length);
					});
				} else // Log the error and add to the finished request count
				{
					// Mark the request as complete
					completedRequestsCount += 1;
					requestComplete(completedRequestsCount, urls.length);
					console.log("Error requesting "+url+"\nLogged error: "+error+"\n");
				}
			});
		}
	});
	

	// Finally, attach an event listener to the 'scrapingFinished' event
	// so that we can call the callback with the finished object
	// once all tasks have completed
	eventEmitter.on('scrapingFinished', function(){
		callback( formatReturnObject() );
	});
};


/**
 * To be called every time a counted request is completed
 * Will compare the completedRequestsCount with the given listLength
 * If they are equal, fire the 'scrapingFinished' event to signal that
 * the requests are complete and the scraping is done 
 */
function requestComplete(completedRequestsCount, listLength){
	if (completedRequestsCount == listLength)
	{
		eventEmitter.emit('scrapingFinished');
	}
};

/**
 * Takes in an html page of class options for a particular subject,
 * interprets them sequentially, then calls the given callback when completed
 */
function handleClassPage(html, callback){
	// Load the page into cheerio, treating it just like jQuery
	$ = cheerio.load(html);

	// Create a variable to track the previous class, just in
	// case we encounter a row that is connected to the last one
	var previousClassTimes;

	// Select all of the available rows
	$('#soc_content > center > table').find('tr').
	// Filter out all of the rows that have a <th> as they are note rows
	filter(function( index )
	{
		// Returns true only if there are no descendent <th>s in 'this'
		return $( "th", this ).length === 0;
	}).
	// Skip the first matched row since it's a header
	slice(1).
	// Loop through each matching row, adding them to the classOptions list
	each(function()
	{
		handleClassRow(this);
	});

	// Once done, call the callback to mark the reqest as complete
	callback();

	//
	// These helper functions form closures, allowing us to reference
	// the previousClass variable without it going out of scope
	//

	/**
		Helper function for handleClassPage to handle a given row, create a
		class object and push the object onto the 'classOptions' variable
		Will also check if the class has been listed on the 'classTopics' list
		and add it there if it hasn't been added before.
		Input: row: the row to be handled
	**/
	function handleClassRow(row){
		/* The row structure I'm following is: (- is skip)
	   	0   1 2 3 4    5    6  7     8       9      10  11    12          13
		Class ID|-|-|-|-|Section|-|Days|Period|Building|Room|-|Class Name|Professor(s)
		*/
		// First, select all of the <td>s in the row
		var data = $(row).children('td');
	
		// Extract the information into a raw object
		var raw = {}
		raw.classID = data.eq(0).text().trim();
		raw.crn = data.eq(5).text().trim();
		raw.days = data.eq(7).text().trim();
		raw.period = data.eq(8).text().trim();
		raw.building = data.eq(9).text().trim() || ""; // Set to empty string if null
		raw.room = data.eq(10).text().trim() || "";
		raw.className = data.eq(12).text().trim();
		raw.professor = data.eq(13).text().trim();
	
		// Check if the scraped row is a child of the previousClass
		// This is when the classID and courseTitle are empty
		if(raw.classID === "" && raw.className === "")
		{
			handleChildRow(raw);
	
		}
		// Otherwise handle it normally
		else
		{
			// Since this is a primary class, conform the data to the specifications
			raw.classID = raw.classID.replace(' ', '-');
		
		
			// Add the class to the classTopics if not already present
			addClassTopic(raw.classID, raw.className);
		
			// Now we need to add the class info to the global classOptions object
		
			// Create an object to store the data
			var thisClass = {};
			thisClass.crn = raw.crn;
			thisClass.classID = raw.classID;
			// Selects only the first professor and adds a missing space
			thisClass.prof = raw.professor.split('\n')[0].replace(',', ', ');
			thisClass.times = []; // Empty list
			thisClass.times.push( formatTimes(raw) ); // First time given by this row
		
		
			// Finally, push the object onto the classOptions list
			classOptions.push(thisClass);
		
			// Set the previousClass so we can come back to it in the next iteration if necessary
			// Will store this one level up in context so it's only defined for each
			// subject area and not the whole scaper.
			previousClassTimes = thisClass.times;
		}
	
	};
	
	/*
		Will interpret the information in a child (lab) row and add it
		as a time to the given previousClass
	*/
	function handleChildRow(rawData){
		// Format the times and push them onto the previousClass
		previousClassTimes.push( formatTimes(rawData) );
	};

};


/**
 * Takes in a raw class row data object and extracts the times from it
 * Will return a properly formatted class time object
 */
function formatTimes(rawData){
	// Create a new object to store the time
	var time = {};

	// Replace all whitespace in the days string
	time.days = rawData.days.replace(/\s/g, '');

	// Combine the location into one string, trimming excess whitespace
	time.location = (rawData.building + " " + rawData.room).trim();

	// Check if the class is an online class and set the type
	if(rawData.building === "WEB")
	{
		time.type = "Online";
		time.time = "Online";
	}
	else
	{
		time.type =  "Class";
	}

	// Now, extract the class period and convert it to real time
	var startTime, endTime;

	// This object stores all the standard times for UF periods
	UFPeriods = 
	{
		"1": {"start": "7:25 am", "end": "8:15 am"},
		"2": {"start": "8:30 am", "end": "9:20 am"},
		"3": {"start": "9:35 am", "end": "10:25 am"},
		"4": {"start": "10:40 am", "end": "11:30 am"},
		"5": {"start": "11:45 am", "end": "12:35 pm"},
		"6": {"start": "12:50 pm", "end": "1:40 pm"},
		"7": {"start": "1:55 pm", "end": "2:45 pm"},
		"8": {"start": "3:00 pm", "end": "3:50 pm"},
		"9": {"start": "4:05 pm", "end": "4:55 pm"},
		"10": {"start": "5:10 pm", "end": "6:00 pm"},
		"11": {"start": "6:15 pm", "end": "7:05 pm"},
		"E1": {"start": "7:20 pm", "end": "8:10 pm"},
		"E2": {"start": "8:20 pm", "end": "9:10 pm"},
		"E3": {"start": "9:20 pm", "end": "10:10 pm"}
	};

	// If it's just one period long and is a listed period
	if ((rawData.period.length === 1 || rawData.period.length === 2) && (rawData.period in UFPeriods))
	{
		startTime = UFPeriods[rawData.period].start;
		endTime = UFPeriods[rawData.period].end;
	}
	// Else figure out what the start and end periods are
	else
	{
		// If there is a dash, split over it and extract the times
		if(rawData.period.split('-').length === 2)
		{
			startTime = UFPeriods[ rawData.period.split('-')[0] ].start;
			endTime = UFPeriods[ rawData.period.split('-')[1] ].end;
		}
		// If the length is 4, it's probably  of the form "1011"
		else if (rawData.period.length === 4)
		{
			try
			{
				// The first two characters are the start
				startTime = UFPeriods[ rawData.period.substr(0, 2) ].start;
				// The end two characters are the end time
				endTime = UFPeriods[ rawData.period.substr(2, 4) ].end;
			}
			catch(e)
			{
				if(warnings)
				{
					console.log('Warning: Error on period: ' + rawData.period);
					console.log('For class: ' + rawData.classID + 'And previous class: ' + previousClass.classID);
				}
				// Set the time to Online or TBA
				time.type = "Online";
				time.time = "Online or TBA";
			}
			
		}
		// Otherwise, let's assume it's a web class or TBA
		else
		{
			time.type = "Online";
			time.time = "Online or TBA";
		}
	}

	// Only set if it isn't an online class and the time has been defined
	if(time.type !== "Online")
	{
		time.time = startTime + " - " + endTime;
	}

	// Finally, return the formatted time object
	return time;
};

/**
 * Will add a class to the global classTopics list, if not already present
 */
function addClassTopic(classID, className){
	// Check if the class is already listed, and if it isn't, list it
	if (! (classID in classTopics))
	{
		// Create a new object to store the classTopic data
		var classToAdd = {};
		// Select the first part of the class ID as the subjectID
		classToAdd.subjectID = classID.split('-')[0];
		classToAdd.className = className;

		// Add classToAdd to the classTopics object with the classID as a key
		classTopics[classID] = classToAdd;
	}

	// Check for a name conflict, sending a warning if one is found.
	// Skip this if we just added a class (that's what 'else' does here)
	else if( classTopics[classID].className !== className )
	{
		if(debug || warnings)
			console.log("Warning: Name conflict for class "+classID+". Keeping original name.");
		return;
	}
};


/**
 * Looks through the select at the top of the page to find all URLs
 * that we have to look through to collect class data.
 * Args: a baseURL to look at for the links and a callback to call
 * with a list of full URLs to scrape when done.
 */
function getPageURLs(baseURL, callback) {
	request(baseURL, function (error, response, html) {
		// Only continue if we got a successful response
		if (!error && response.statusCode == 200)
		{
			// Load the html into cheerio and treat it just like jQuery
			var $ = cheerio.load(html);

			// Create an empty list for the URLs of the pages we need to scrape
			var urls = []

			// Find the first select, then loop through each available option
			// and grab the url from its 'value' field, ignoring any blanks.
			$('select').find('option').each(function(){
				if ($(this).val() != "")
				{
					// Push the value onto the list of urls, adding 
					// in the baseURL as a prefix
					urls.push(baseURL + $(this).val());
				}
			});

			// Since the subjects are listed on this page, go ahead and
			// send the already requested html to the subject scraper
			scrapeSubjects(html);

			// Finally, call the callback, passing along the list of URLs
			callback(urls);
		}
		else // Log any errors
		{
			console.log("Error requesting "+baseURL+"\nLogged error: "+error);
		}
	});
}


/**
 * Takes in the HTML from the start page and scrapes the list of subjects
 * from the main table, adding them to the global 'subjects' variable
 */
function scrapeSubjects(html){
	// Load the html into cheerio, treating it just like jQuery
	var $ = cheerio.load(html);

	// Select the <tr>s containing subject data, slicing away 
	// the first header result and then looping through each
	$('.filterable').find('tr').slice(1).each(function(){
		// Create a new object to store the subject
		var subject = {};

		// Select the first row of data and store it as the subjectID
		subject.subjectID = $(this).find('td').eq(0).text();

		// Select the second row of data and store it as the subjectID
		subject.subjectName = $(this).find('td').eq(1).text();

		// Push the completed subject object onto the global subjects list
		subjects.push(subject);
	});
};


/**
 * Formats all of the scraped data into a well-formed obeject
 * that follows the output specifications in the README.
 */
function formatReturnObject(){
	// Incorporate global variables into a single return object
	output = {};
	output.schoolID = schoolID;
	output.schoolName = schoolName;
	output.subjects = subjects;
	output.classTopics = formatClassTopics(classTopics); 
	output.classOptions = classOptions;

	return output;
}

/**
 * Takes in a classTopics object that is keyed by classID
 * and converts and returns it as an equivalent list
 */
function formatClassTopics(topicsObject){
	var topicsList = [];

	for(key in topicsObject)
	{
		topicsList.push(
		{
			subjectID: topicsObject[key].subjectID,
			classID: key,
			className: topicsObject[key].className
		}
		);
	}

	return topicsList;
}


// Finally, export the main method 
exports.main = main;
