var express = require('express'),
	app = module.exports = express(),
	db = require('../database');

app.get('/api', function(req, res){
	res.send("CourseLogic API v0.1 (If you're seeing this, the API is running)");
});

app.get('/api/:schoolID/subjects', db.getSubjects);
app.get('/api/:schoolID/topics', db.getTopics);
app.get('/api/:schoolID/classes', db.getClasses);