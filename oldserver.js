var http = require('http');
var url = require('url');
var querystring = require('querystring');
var static = require('node-static');

var database = require('./database'); // Library for PostgreSQL functions

////////////////////////
// User set variables //
////////////////////////

// Set the port by the deployment enviornment variable if possible
// Otherwise, the number after || here is the listening port.
var port = process.env.PORT || 80;

// The path that designates an API request
var APIURLPath = "/api/"

// The argument to Server() should be the path to the website's root
var fileServer = new static.Server('./website/');
var debug = false;

/////////////////
// Server Code //
/////////////////

/**
	The header info to write for a successful response
**/
var successHeader = {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'};
var errorHeader = {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'};

/**
	Create a http server for the to listen to on on the designated port
**/
http.createServer(function (request, response) {
	request.addListener('end', function (){

		if(debug) console.log("Handled request for "+ url.parse(request.url));

		// If the requested URL path starts with the API URL path, redirect the request
		if(url.parse(request.url).path.substring(0, APIURLPath.length) == APIURLPath)
		{
			APIHandler(request, response);
		}
		else
		{
			fileServer.serve(request, response, function (err, result) {
					if (err) { // There was an error serving the file
						// Don't log the errors I know always happen and that don't matter much.
						if(request.url != "/favicon.ico" && request.url != "/js/jquery-1.10.1.min.map")
							console.log("Error serving " + request.url + " - " + err.message);
		
						// Respond to the client
						response.writeHead(err.status, err.headers);
						response.end();
					}
				});
		}
	}).resume();
}).listen(port);


/**
	Function to handle requests for the API
**/
var APIHandler = function(request, response){
	// Get the path name, minus the leading API path
	var path = url.parse(request.url).pathname.substring(APIURLPath.length);
	
	// Parse the request data into an object we can reference
	var requestData = querystring.parse(url.parse(request.url).query);

	if(debug) console.log('Handled API request for '+url.parse(request.url).path);
	
	// Match the request to a dababase function
	if(path == "subjects"){
		database.getSubjects(function(rows){
			sendResponse(response, rows);
		});
	}
	else if(path == "topics"){
		database.getTopics(requestData.subjectid, function(rows){
			sendResponse(response, rows);
		});
	}
	else if(path == "classes"){
		database.getClasses(requestData.classid, function(rows){
			sendResponse(response, rows);
		});
	}
}

console.log('CourseLogic Back-End http API server running on port '+port);

/**
	Takes in an http reponse object and rows from the database and then sends the response back to the client.	
**/
var sendResponse = function(response, rows){
	if(rows){
		response.writeHead(200, successHeader);
		response.write(JSON.stringify(rows));
		response.end();
	}
	else{
		response.writeHead(500, errorHeader);
		response.write("Internal Database Error. Either your request was malformed or MySQL is acting up as usual. Sorry!")
		response.end();
	}
}