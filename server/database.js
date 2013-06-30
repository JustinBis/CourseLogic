var mysql = require('mysql'); // requires installation: npm install mysql@2.0.0-alpha8


/////////////////////////
// USER DATABASE OPTIONS
/////////////////////////
var username = 'CourseLogicUser';
var password = 'YsaEJNTHPmKyVNFs'; // Randomly Generated Pass
var host = '192.168.1.77'; // No getting into to my server now! Local only
var database = 'CourseLogic';

/*
	A pool of connections is used here for speed and ease of creating connections on request
*/
var pool = mysql.createPool({
	host : host,
	user : username,
	password : password,
	database : database
});

function getSubjects(callback){
	// Create a new connection from the pool and query for info
	pool.getConnection(function(err, connection){
		connection.query('SELECT * FROM `Subjects` WHERE `hasClasses` = 1', function(err, rows){
			if(err){
				console.log("\nError on call of getSubjects()");
				logError(err);
			}
			callback(rows);
			connection.end();
		});
	});
}

function getTopics(subjectID, callback){
	// Create a new connection from the pool and query for info
	pool.getConnection(function(error, connection){
		if(error) console.log(error);

		connection.query('SELECT * FROM `ClassTopics` WHERE `subjectID` = ? AND `hasClasses` = 1', subjectID, function(err, rows){
			if(err){
				console.log("\nError on call of getTopics() with subjectID: "+subjectID);
				logError(err);
			}
			callback(rows);
			connection.end();
		});
	});
}

function getClasses(classID, callback){
	// Create a new connection from the pool and query for info
	pool.getConnection(function(error, connection){
		if(error) console.log(error);

		connection.query('SELECT * FROM `ClassOptions` WHERE `classID` = ?', classID, function(err, rows){
			if(err){
				console.log("\nError on call of getClasses() with classID: "+classID);
				logError(err);
			}
			callback(rows);
			connection.end();
		});
	});
}

function logError(err){
	console.log(err.code);
	console.log(err.fatal);
	console.log(err);
	console.log("\n")
}

exports.getTopics = getTopics;
exports.getSubjects = getSubjects;
exports.getClasses = getClasses;