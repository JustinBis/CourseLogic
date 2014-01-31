//Schemas for Mongoose

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var classDataSchema = new Schema({
	schoolID: String,
	schoolName: String,
	subjects: [subjectSchema],
	classTopics: [classTopicSchema],
	classOptions:[classOptionSchema]
});

var subjectSchema = new Schema({
	subjectID: String,
	subjectName: String
});

var classTopicSchema = new Schema({
	subjectID: String,
	classID: String,
	className: String
});

var classOptionSchema = new Schema({
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

exports.classData = classDataSchema;
exports.subject = subjectSchema;
exports.classTopic = classTopicSchema;
exports.classOption = classOptionSchema;