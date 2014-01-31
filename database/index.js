var mongoose = require('mongoose'),
	schemas = require('./schemas'),
	ClassDataModel = mongoose.model('ClassData', schemas.classData),
	SubjectModel = mongoose.model('SubjectModel', schemas.subject); // May not be needed

// Connect to the database
mongoose.connect(process.env.MONGOHQ_URL || 'mongodb://localhost/CourseLogic');
mongoose.set('debug', true);

// Export our database functions
exports.getSubjects = function(req, res){
	var conditions = { schoolID : req.params.schoolID.toUpperCase()}
	// Query for whatever matches the conditions, selecting only the subjects field
	return ClassDataModel.findOne(conditions, 'subjects', function (err, results) {
		if(err) return console.error(err);
		res.send(results.subjects);
	});
}

exports.getTopics = function(req, res){

}

exports.getClasses = function(req, res){

}


/*
	This function should be called by the scrapers in order to 
	update their record in the database.
*/
exports.updateClassData = function(classDataObject){
	// Will update the first record that matches the query
	// 'upsert' will insert the classData if nothing is matched
	var query = { schoolID : classDataObject.schoolID };
	ClassDataModel.update( query, classDataObject, { upsert : true } );

	/*var dataModel = new ClassDataModel(classDataObject);

	dataModel.save(function (err) {
		if(err) return console.error(err);
		// Saved!
	});*/
}