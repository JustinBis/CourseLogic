var http = require('http');
var connect = require('connect');

/**
	Create a static fileserver for the frontend pages on port 89
**/
connect.createServer(
    connect.static('../')
).listen(80);

console.log('CourseLogic Front-End connect webserver running at http://127.0.0.1:80');

http.createServer(function (request, response) {
	response.writeHead(200, {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'});
	response.write(JSON.stringify(exampleJson));
	response.end();
}).listen(8088);

console.log('CourseLogic Back-End http webserver running at http://127.0.0.1:8088/');

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

var interpretRequest = function(request){

}