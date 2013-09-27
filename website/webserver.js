//var connect = require('connect');
var static = require('node-static');

// Set the port by the deployment enviornment variable if possible
// Otherwise, the number after the || is the listening port.
var port = process.env.PORT || 80;

var fileServer = new static.Server('./');

require('http').createServer(function (request, response) {
    request.addListener('end', function () {
        fileServer.serve(request, response, function (err, result) {
            if (err) { // There was an error serving the file
            	// Don't log the errors I know always happen and that don't matter much.
            	// May need to parse URLs to just path
                if(request.url != "/favicon.ico" && request.url != "/js/jquery.1.10.1.min.map")
                	console.log("Error serving " + request.url + " - " + err.message);

                // Respond to the client
                response.writeHead(err.status, err.headers);
                response.end();
            }
        });
    }).resume();
}).listen(port);

console.log('CourseLogic Front-End connect webserver started on port 80');