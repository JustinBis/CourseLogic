/**
	Function to activate all removal icons on the page
**/
var activateRemoveIcons = function(){
	activateTableRemoveIcon();
	activateRowRemoveIcon();
}

/**
	Function to activate the trashcan icon selector to delete the clicked table
**/
var activateTableRemoveIcon = function(){
	$(".icon-trash").click(function () {
		$(this).parent().parent().parent().parent().parent().slideUp(400, function(){
			$(this).remove();
		});
		updateSelections();
	});
}
/**
	Function to activate the delete icon selector to delete the clicked row
**/
var activateRowRemoveIcon = function(){
	$(".icon-remove").click(function () {
		$(this).parent().parent().remove();
		updateSelections();
	});
}

/**
	Function to create the outside structure of a class listing table
**/
var createTable = function(data){
	var s = '<div><table class="table table-bordered"><tbody id="'
	s += data.classid
	s += '"><tr class="info"><td colspan="6"><i class="icon-trash icon-large"></i> &nbsp; <strong>'
	s += data.classid
	s += ': '
	s += data.classname
	s += '</strong></td></tr><tr><th></th><th>Class#</th><th>Building</th><th>Professor</th><th>Days</th><th>Time</th></tr></tbody></table></div>'
	return s
}

/**
	Function to create a table row out of json data
	Should be appended to the end of a tbody tag selected by a classid
**/
var createRow = function(data){
	//var s = '<tr><td><i class="icon-remove"></i></td><td>'+data.classnum+'</td><td>'+data.build+'</td><td>'+data.prof'</td><td>'+data.days+'</td><td>'+data.time'</tr></tr>';
	var s = '<tr><td><i class="icon-remove"></i></td><td>'
	s += data.classnum
	s += '</td><td>'
	s += data.build
	s += '</td><td>'
	s += data.prof
	s += '</td><td>'
	s += data.days
	s += '</td><td>'
	s += data.time
	s += '</td></tr>'
	return s
}

var toggleRowSelect = function(element){
	if($(element).hasClass('success'))
		$(element).removeClass('success')
	else
	{
		$(element).parent().find('.success').removeClass('success')
		$(element).addClass('success')
	}
}

/**
	A function that searches for selected rows and then updates the visual with the new selections
**/
var updateSelections = function(){
	rows = $('#classes').find('.success')
	$.each(rows, function(){
		// Do something with each selected row here
		// Extract the data back oout for visual?
		// Build the info into global variables here
	});
	updateVisual()
}

/**
	A function to update the visual from the global variables
**/
var updateVisual = function(data){

}

// I should be drawing the visual from a set of global variables that store each selected class and their
// relevant attributes, such as classID and times


/////////////////////////////////////////////////////////////
// Area for example code
/////////////////////////////////////////////////////////////



/**
	Example JSON
**/
var exampleClassJson = {
"classnum": "999",
"build": "SOME",
"prof": "Dumbledore",
"days": "S/S",
"time": "10:00 - 11:45"
}

var exampleJson = {
	"classid": "CSCI-UA-102",
	"classname": "Intro to Computer Science 2",
	"classes":
	[{
		"classnum": "999",
		"build": "SOME",
		"prof": "Dumbledore",
		"days": "S/S",
		"time": "10:00 - 11:45"
	},
	{
		"classnum": "888",
		"build": "SOME",
		"prof": "Professor Snape",
		"days": "S/S",
		"time": "10:00 - 11:45"
	},
	{
		"classnum": "777",
		"build": "SOME",
		"prof": "Professor Moody",
		"days": "S/S",
		"time": "10:00 - 11:45"
	}]
}



/*$.getJSON('http://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?', {
    tags: "mount rainier",
    tagmode: "any",
    format: "json"
  }, function(data) {
	$('#jsontest').append("Oh "+data.title);
});*/

//$('#CSCI-UA-101').append(createRow(examplejson));
// TODO: Every time some row is added, we have to re-call the icon-remove on click jquery function so that the remove icons update
// Move this append action to a button in the overlay so the overlay controls it, not me.

$('#classes').append(createTable(exampleJson));

$.each(exampleJson.classes, function() {
  $('#'+exampleJson.classid).append(createRow(this));
});

activateRemoveIcons();

$('tr').click(function(){
	toggleRowSelect(this);
});