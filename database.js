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
};

///////////////////
// Database Code //
///////////////////

// Override the db_config if a PostgreSQL connection string is given as an enviornment variable
if(process.env.DATABASE_URL){
	db_config = process.env.DATABASE_URL;
};


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