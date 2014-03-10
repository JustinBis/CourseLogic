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
	max: 8,
	silent: false, // Don't silence the std streams
	options: []
	minUptime: 3000,     // Minimum time a child process has to be up. Forever will 'exit' otherwise.
    spinSleepTime: 15000, // Interval between restarts if a child is spinning (i.e. alive < minUptime).
});

child.on('exit', function () {
	console.log('server.js crashed too many times! Killing the process...');
});

child.start();