/* * * * * * * * * * * * * * * * * * * * * * * * * * *
 * CourseLogic Server Keep-Alive Script
 * 
 * This script will use the Forever module to keep
 * the CourseLogic main server alive in case it
 * encounters an error and crashes.
 *
 * By Justin Bisignano
 * * * * * * * * * * * * * * * * * * * * * * * * * * */

var forever = require('forever-monitor');

var child = new (forever.Monitor)('server.js', {
	max: 5,
	silent: false, // Don't silence the std streams
	options: []
});

child.on('exit', function () {
	console.log('server.js crashed 5 times! Killing the process...');
});

child.start();