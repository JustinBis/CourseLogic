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
    connect.static('../')
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
			response.writeHead(200, successHeader);
			response.write(JSON.stringify(rows));
			response.end();
		});
	}
	else if(path == "/topics"){
		database.getTopics(requestData.subjectID, function(rows){
			if(rows){
				response.writeHead(200, successHeader);
				response.write(JSON.stringify(rows));
				response.end();
			}
			else{
				response.writeHead(400);
				response.end();
			}
		});
	}
	else if(path == "/classes"){
		console.log(requestData.classID);
		database.getClasses(requestData.classID, function(rows){
			if(rows){
				response.writeHead(200, successHeader);
				response.write(JSON.stringify(rows));
				response.end();
			}
			else{
				response.writeHead(400);
				response.end();
			}
		});
	}

}).listen(APIPort);

console.log('CourseLogic Back-End http webserver running at http://127.0.0.1:'+APIPort+'/');

var handleRequest = function(){

}





var exampleJson = {
	"classid": "CSCI-UA-102",
	"classname": "Intro to Computer Science 2",
	"classes":
	[{
		"classnum": "999",
		"build": "SOME",
		"prof": "Dumbledore",
		"days": "S/S",
		"time": "10:00 - 11:45"
	},
	{
		"classnum": "888",
		"build": "SOME",
		"prof": "Professor Snape",
		"days": "S/S",
		"time": "10:00 - 11:45"
	},
	{
		"classnum": "777",
		"build": "SOME",
		"prof": "Professor Moody",
		"days": "S/S",
		"time": "10:00 - 11:45"
	}]
}