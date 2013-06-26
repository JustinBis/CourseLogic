/**
	Attaches a click handler to the trash icons that works even when new tables are added.
**/
$('#classes').on('click', '.icon-trash', function(){
	$(this).parent().parent().parent().parent().parent().slideUp(400, function(){
		$(this).remove();
	});
	updateSelections();
});

/**
	Attaches a click handler to the remove row icons that works even when new rows are added.
**/
$('#classes').on('click', '.icon-remove', function(){
	$(this).parent().parent().remove();
	updateSelections();
});

/**
	Attaches a click handler to the table rows that will work even for newly added rows
**/
$('#classes').on('click', 'tr', function(){
	toggleRowSelect(this);
	updateSelections();
});


/**
	Function to create the outside structure of a class table
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

/**
	Function to append a table based on the given JSON-formatted data
**/
var appendTable = function(data){
	$('#classes').append(createTable(data));

	$.each(data.classes, function() {
		$('#'+data.classid).append(createRow(this));
	});
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


// Example getJSON call to an API with passed data
/*$.getJSON('http://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?', {
    tags: "mount rainier",
    tagmode: "any",
    format: "json"
  }, function(data) {
	$('#classes').append("Oh "+data.title);
});*/

$('#modalAddClassesButton').click(function(){
	$.getJSON('http://localhost:8088/', function(data) {
		appendTable(data);
	});
	$('#addAClass').modal('hide'); // Hide the modal overlay when the "Add Selected Classes" button is clicked
})

