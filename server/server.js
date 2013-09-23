var http = require('http');
var connect = require('connect');
var url = require('url');
var querystring = require('querystring');

var database = require('./database'); // database.js

////////////////////
//User set variables
////////////////////
var APIPort = 8088
var debug = true;

/**
	The header info to write for a successful response
**/
var successHeader = {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'};

/**
	Create a static fileserver for the frontend pages on port 80 (standard HTTP)
**/
connect.createServer(
    connect.static('../website/')
).listen(80);

console.log('CourseLogic Front-End connect webserver running at http://127.0.0.1:80');

http.createServer(function (request, response) {
	// Seperate the request into it's important parts
	if(debug) console.log('Handled API request for '+url.parse(request.url).path);
	var path = url.parse(request.url).pathname;
	var requestData = querystring.parse(url.parse(request.url).query);

	// Match the request to a dababase function
	if(path == "/subjects"){
		database.getSubjects(function(rows){
			sendResponse(response, rows);
		});
	}
	else if(path == "/topics"){
		database.getTopics(requestData.subjectID, function(rows){
			sendResponse(response, rows);
		});
	}
	else if(path == "/classes"){
		database.getClasses(requestData.classID, function(rows){
			sendResponse(response, rows);
		});
	}

}).listen(APIPort);

console.log('CourseLogic Back-End http webserver running at http://127.0.0.1:'+APIPort+'/');

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
		response.writeHead(500);
		response.write("Internal Database Error. Either your request was malformed or MySQL is acting up as usual. Sorry!")
		response.end();
	}
}