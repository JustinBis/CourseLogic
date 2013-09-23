var mysql = require('mysql'); // requires installation: npm install mysql@2.0.0-alpha8


/////////////////////////
// USER DATABASE OPTIONS
/////////////////////////
var username = 'CourseLogicUser';
var password = 'YsaEJNTHPmKyVNFs'; // Randomly Generated Pass
//var host = '192.168.1.77'; // No getting into to my server now! Local only
var host = '66.172.33.243'; // Chunk host
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
		if (err){
			logError(err);
			callback(null); // Return null to the callback so that it will send a HTTP error to the client
			return false; // Prevent the program from moving on
		}
		
		connection.query('SELECT * FROM `Subjects` ORDER BY `Subjects`.`subjectID` ASC', function(err, rows){
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
		if(error){
			console.log(error);
			callback(null); // Return null to the callback so that it will send a HTTP error to the client
			return false; // Prevent the program from moving on
		}

		connection.query('SELECT * FROM `ClassTopics` WHERE `subjectID` = ? ORDER BY `ClassTopics`.`classID` ASC', subjectID, function(err, rows){
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
		if(error){
			console.log(error);
			callback(null); // Return null to the callback so that it will send a HTTP error to the client
			return false; // Prevent the program from moving on
		}

		connection.query('SELECT * FROM `ClassOptions` WHERE `classID` = ? ORDER BY `ClassOptions`.`crn` ASC', classID, function(err, rows){
			if(err){
				console.log("\nError on call of getClasses() with classID: "+classID);
				logError(err);
			}
			// Parse the times JSON in the DB so that we don't send escaped strings back instead of an object
			try{
				for(var index in rows)
					rows[index].times = JSON.parse(rows[index].times);
			}
			catch(e){
				console.log("Error parsing times JSON from the DB:");
				console.log(e);
				rows = null; // Clear the rows so we return an error on the HTTP request
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