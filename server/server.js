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
		/*response.writeHead(200, successHeader);
		response.write(JSON.stringify(exampleJson));
		response.end();*/
		
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

/**
	Takes in an http reponse object and rows from the database and then sends the response back to the client.	
**/
var sendDatabaseResponse = function(response, rows){
	if(rows){
		response.writeHead(200, successHeader);
		response.write(JSON.stringify(rows));
		response.end();
	}
	else{
		response.writeHead(400);
		response.end();
	}
}





var exampleJson = [{
	"crn": "11126",
	"prof": "Teck G. Lee",
	"times": 
		[{
			"type": "Lecture",
			"days": "MWF",
			"time": "10:00am - 10:50am",
			"location": "Parker Hall 319"
		},
		{
			"type": "Lab",
			"days": "M",
			"time": "12:00pm - 2:50pm",
			"location": "Parker Hall 104"
		}]
	},
	{
	"crn": "123",
	"prof": "Dumbledore",
	"times": 
		[{
			"type": "Lecture",
			"days": "TR",
			"time": "11:00am - 12:15pm",
			"location": "Parker Hall 319"
		}]
	},
	{
	"crn": "8675",
	"prof": "Tommy Tutone",
	"times": 
		[{
			"type": "Lecture",
			"days": "MWF",
			"time": "10:00am - 10:50am",
			"location": "Parker Hall 319"
		},
		{
			"type": "Lab",
			"days": "M",
			"time": "12:00pm - 2:50pm",
			"location": "Parker Hall 000"
		}]
	}];