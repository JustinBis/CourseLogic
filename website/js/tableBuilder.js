/************************************************
 * This file contains all of the functions for  *
 * building the class data tables from the      *
 * JSON recieved from the CourseLogic API       *
 ************************************************/

/**
	Function to create the outside structure of a class table
**/
var createOuterTableHTML = function(tableTitle, classID){
	var s = '<div><table class="table table-bordered"><tbody id="';
	s += classID;
	s += '"><tr class="info"><td colspan="5"><i class="icon-trash icon-large"></i> &nbsp; <strong>';
	s += tableTitle;
	s += '</strong><i class="icon-circle-arrow-down icon-large pull-right"></i></td></tr><tr class="tableHead"><th></th><th>CRN</th><th>Professor</th><th>Days</th><th>Time</th></tr></tbody></table></div>';
	return s;
};

/**
	Function to create a table row out of json data
	Should be appended to the end of a tbody tag selected by a classID
	Input: crn as a string, professor as a string, and times as an array of objects
**/
var createClassRowHTML = function(crn, professor, times){
	var i = 0;
	// Create HTML string here so we can add to it in the iterator but the delete icon won't duplicate
	var s = '<tr data-crn="'+crn+'"><td rowspan="'+times.length+'"><i class="icon-remove"></i></td><td>';
	// Create a row for each set of times a class has
	$.each(times, function() {
		// If there is more than one time for a class, handle the CRN area differently to show connection
		// If it's the first time, show the crn, else show the connection icon
		if (i == 0)
			s += crn;
		else
			s += '<tr data-crn="'+crn+'"><td><i class="icon-share-alt icon-flip-vertical"></i> '+this.type;

		s += '</td><td>';

		if (i==0)
		{
			s += professor;
			// Don't show the Rate My Prof icon if the professor is unknown
			if(professor != "TBA" || professor != "STAFF")
				s += createRateMyProfessorIcon(professor);
		}
		else
		{
			s += " "; // Leave a blank space under the professor heading in classes with more than one row
		}

		s += '</td><td>';
		s += this.days;
		s += '</td><td>';
		s += this.time;
		s += '</td></tr>';
		i++; // Iterate so the previous check will show a connected row if there are more than one time
	});
	// Return the complete string
	return s;
};

var createRateMyProfessorIcon = function(professor){
	var s = '&nbsp;&nbsp;<a href="https://www.google.com/search?q=';
	s += professor.replace(" ", "+");
	s += "+"
	s += schoolName.replace(" ", "+");
	s += '" target="_blank">';
	s += '<i class="icon-question-sign"></i>';
	return s;
};

/**
	Function called when selecting "Add Class" from the modal dialogue
	and all selections have been made.
**/
var processClassData = function(className, classID, rows){
	// First, remove existing class table if it already exists.
	$('#'+classID).parent().parent().remove();
	updateSelections();

	// Create the needed outer HTML and append it
	var tableHTML = createOuterTableHTML(className, classID);
	$('#classes').append(tableHTML);

	// Loop through each section and add them as rows to the new table
	$.each(rows, function() {
		$('#'+classID).append(createClassRowHTML(this.crn, this.prof, this.times));
	});

};