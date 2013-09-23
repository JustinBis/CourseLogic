var connect = require('connect');

/**
	Create a static fileserver for the frontend pages on port 80 (standard HTTP)
**/
connect.createServer(
    connect.static('./')
).listen(80);

console.log('CourseLogic Front-End connect webserver started on port 80');