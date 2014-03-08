// Dependencies and models
var mongoose = require('mongoose'),
	schemas = require('./schemas'),
	Subject = mongoose.model('SubjectModel', schemas.Subject),
	ClassTopic = mongoose.model('ClassTopicModel', schemas.ClassTopic),
	ClassOption = mongoose.model('ClassOptionModel', schemas.ClassOption);


// Connect to the database (and keep this connection alive)
console.log('Opening MongoDB connection...');
var options = {
	db: { native_parser: true },
	server: { poolSize: 5 },
	replset: { rs_name: 'myReplicaSetName' },
};
options.server.socketOptions = options.replset.socketOptions = { keepAlive: 1 };
mongoose.connect(process.env.MONGOHQ_URL || 'mongodb://localhost/CourseLogic', options);


// Print DB calls if debug mode is on. Default to false.
mongoose.set('debug', process.argv[2] == "debug" || false);


// Export our database functions

/**
 * Retrieves the 'subjects' documents from the DB for the given school
 * and sends it via the passed response object.
 *
 * Expects a request object that has the schoolID parameter set
 * such as http://host/api/:schoolid/subjects
 */
exports.getSubjects = function(req, res){
	Subject
	.find({ schoolID: req.params.schoolID.toUpperCase() })
	.select('-schoolID -_id') // Exclude schoolID and _id
	.sort({ subjectID: 'ascending'})
	.exec(function(err, results) {
		if(err) return logError('Error getting subjects from DB', err);
		res.send(results);
	});
}


/**
 * Retrieves the 'classTopics' documents from the DB for the given school
 * and the queried subjectID, then sends it via the passed response object.
 *
 * Expects a request object that has the schoolID parameter set and a query
 * that defines the subjectID.
 */
exports.getTopics = function(req, res){
	ClassTopic
	.find({ schoolID: req.params.schoolID.toUpperCase() })
	.where({ subjectID: req.query.subjectID.toUpperCase() })
	.select('-schoolID -_id') // Exclude schoolID and _id
	.sort({ classID: 'ascending'})
	.exec(function(err, results) {
		if(err) return logError('Error getting class topics from DB', err);
		res.send(results);
	});
}

/**
 * Retrieves the 'classOptions' documents from the DB for the given school
 * and the queried subjectID, then sends it via the passed response object.
 *
 * Expects a request object that has the schoolID parameter set and a query
 * that defines the classID.
 */
exports.getClasses = function(req, res){
	ClassOption
	.find({ schoolID: req.params.schoolID.toUpperCase() })
	.where({ classID: req.query.classID.toUpperCase() })
	.select('-schoolID -_id') // Exclude schoolID and _id
	.sort({ crn: 'ascending'})
	.exec(function(err, results) {
		if(err) return logError('Error getting class options from DB', err);
		res.send(results);
	});
}


/**
 * This function should be called by the scrapers in order to 
 * update their record in the database.
 * 
 * Requires a valid classDataObject to be passed in as the only arg
 */
exports.updateClassData = function(classDataObject){
	// First, update the subjects
	updateSubjects( classDataObject.subjects, classDataObject.schoolID );

	// Next, update the class topics
	updateClassTopics( classDataObject.classTopics, classDataObject.schoolID );

	// Finally, update the class options
	updateClassOptions( classDataObject.classOptions, classDataObject.schoolID );

	// Log that we've finished here
	console.log('Updating UF classes in the database...');
}


// Insertion and updater functions to be called from updateClassData()

/**
 * Will update the subjects in the DB
 *
 * A Note from the Mongoose docs: Although values are cast to their appropriate 
 * types when using the findAndModify helpers, the following are not applied:
 * defaults, setters, validators, middleware
 * So watch out for that if the schema or function changes.
 */
function updateSubjects(subjects, schoolID) {
	// First, empty the current collection as upserting will leave old entries that should be removed
	Subject.remove({}, function () { });

	// Insert each subject as its own document
	subjects.forEach( function(subject) {
		var conditions = {
			schoolID: schoolID,
			subjectID: subject.subjectID,
			subjectName: subject.subjectName
		}

		// The passed object should define all of the fields to update except for the schoolID
		subject.schoolID = schoolID

		var options = {
			upsert: true // Will insert if no doc is found
		}

		Subject.findOneAndUpdate(conditions, subject, options, function(err, result){
			if(err) return logError('Error updating subjects in the DB', err);
		});
	});
}


/**
 * Will update the class topics in the DB
 * Carries the same note as updateSubjects(), that 
 * defaults, setters, validators, and middleware are ignored
 */
function updateClassTopics(classTopics, schoolID) {
	// First, empty the current collection as upserting will leave old entries that should be removed
	ClassTopic.remove({}, function () { });

	// Insert each topic as its own document
	classTopics.forEach( function(topic) {
		var conditions = {
			schoolID: schoolID,
			subjectID: topic.subjectID,
			classID: topic.classID
		}

		// The passed object should already define all of the fields to update except for the schoolID
		topic.schoolID = schoolID;

		var options = {
			upsert: true // Will insert if no doc is found
		}

		ClassTopic.findOneAndUpdate(conditions, topic, options, function(err, result){
			if(err) return logError('Error updating class topics in the DB', err);
		});
	});
}

/**
 * Will update the class options in the DB
 * Carries the same note as updateSubjects(), that 
 * defaults, setters, validators, and middleware are ignored
 */
function updateClassOptions(classOptions, schoolID) {
	// First, empty the current collection as upserting will leave old entries that should be removed
	ClassOption.remove({}, function () { });

	// Insert each class as its own document
	classOptions.forEach( function(classOption) {
		var conditions = {
			schoolID: schoolID,
			classID: classOption.classID,
			crn: classOption.crn
		}

		// The passed object should define all of the fields to update except for the schoolID
		classOption.schoolID = schoolID;

		var options = {
			upsert: true // Will insert if no doc is found
		}

		ClassOption.findOneAndUpdate(conditions, classOption, options, function(err, result){
			if(err) return logError('Error updating class options in the DB', err);
		});
	});
}


/**
 * Logs errors in a cleaner and easier fasion than
 * directly calling console.log(err)
 * @param {String} message - Message to be printed before error
 * @param {Object} err - Error object
 */
function logError(message, err) {
	console.error('Error in the database module:' + message);
	console.error(err);
}