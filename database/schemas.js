//Schemas for Mongoose

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var subjectSchema = new Schema({
	schoolID: String,
	subjectID: String,
	subjectName: String
});

var classTopicSchema = new Schema({
	schoolID: String,
	subjectID: String,
	classID: String,
	className: String
});

var classOptionSchema = new Schema({
	schoolID: String,
	crn: String,
	classID: String,
	prof: String,
	times: [classTimeSchema]
});

var classTimeSchema = new Schema({
	days: String,
	location: String,
	time: String,
	type: String
});

exports.Subject = subjectSchema;
exports.ClassTopic = classTopicSchema;
exports.ClassOption = classOptionSchema;