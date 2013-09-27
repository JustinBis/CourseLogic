var pg = require('pg'); // requires installation: npm install pg

///////////////////////////
// USER DATABASE OPTIONS //
///////////////////////////
/**
	This object contains the connection settings for your PostgreSQL database
**/
var db_config = {
    user: 'name',
    password: 'pass',
    database: 'CourseLogic', // Name of the CourseLogic database
    host: 'localhost', // Hostname, e.g. localhost or 99.88.777.123
    ssl: true,
}


///////////////////
// Database Code //
///////////////////

// Override the db_config if a PostgreSQL connection string is given as an enviornment variable
if(process.env.DATABASE_URL){
	db_config = process.env.DATABASE_URL
}

function getSubjects(callback){
	// The SQL statement to use
	var stmt = 'SELECT * FROM subjects ORDER BY subjectid;';

	pg.connect(db_config, function(err, client, done){
		if(err)
			return logError('Error creating a new connection: ', err, callback);

		client.query(stmt, function(err, result){
			// Release the client
			done();

			if(err)
				return logError('Error getting subjects: ', err, callback);

			// Pass the rows back to the calling function
			callback(result.rows);
		});
	});
}


function getTopics(subjectID, callback){
	// The SQL statement to use
	var stmt = 'SELECT * FROM classtopics WHERE subjectid = $1 ORDER BY classid;';

	pg.connect(db_config, function(err, client, done){
		if(err)
			return logError('Error creating a new connection: ', err, callback);

		client.query(stmt, [subjectID], function(err, result){
			// Release the client
			done();

			if(err)
				return logError('Error getting topics: ', err, callback);

			// Pass the rows back to the calling function
			callback(result.rows);
		});
	});
}


function getClasses(classID, callback){
	// The SQL statement to use
	var stmt = 'SELECT * FROM classoptions WHERE classid = $1 ORDER BY crn;';

	pg.connect(db_config, function(err, client, done){
		if(err)
			return logError('Error creating a new connection: ', err, callback);

		client.query(stmt, [classID], function(err, result){
			// Release the client
			done();

			if(err)
				return logError('Error getting classes: ', err, callback);

			// Parse the times JSON in the DB so that we don't send escaped strings back instead of an object
			try
			{
				for(var index in result.rows)
					result.rows[index].times = JSON.parse(result.rows[index].times);
			}
			catch(e)
			{
				return logError('Error parsing times JSON from the DB: ', e, callback);
			}

			// Pass the rows back to the calling function
			callback(result.rows);
		});
	});
}


///////////////////
//   OLD CODE    //
///////////////////
function getSubjects_depricated(callback){
	// Create a new connection from the pool and query for info
	pool.getConnection(function(err, connection){
		if (err){
			logError(err);
			callback(null); // Return null to the callback so that it will send a HTTP error to the client
			return false; // Prevent the program from moving on
		}
		// Already fixed this one
		connection.query('SELECT * FROM Subjects ORDER BY subjectID;', function(err, rows){
			if(err){
				console.log("\nError on call of getSubjects()");
				logError(err);
			}
			callback(rows);
			connection.end();
		});
	});
}

function getTopics_depricated(subjectID, callback){
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

function getClasses_depricated(classID, callback){
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


/**
	A function to log database errors and send a null object to the callback
	so that the server can return an error to the client.
**/
function logError(infoString, err, callback){
	console.log(infoString, err);
	callback(null);
}

exports.getTopics = getTopics;
exports.getSubjects = getSubjects;
exports.getClasses = getClasses;