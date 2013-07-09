/////////////////////
// USER SET VARIABLES
/////////////////////
var host = "localhost:8088"; // Maps to the API host


/**
	Attaches a click handler to the trash icons that works even when new tables are added.
**/
$('#classes').on('click', '.icon-trash', function(){
	$(this).parent().parent().parent().parent().parent().slideUp(400, function(){
		$(this).remove();
		updateSelections();
	});
});

/**
	Attaches a click handler to the remove row icons that works even when new rows are added.
**/
$('#classes').on('click', '.icon-remove', function(){
	var row = $(this).parent().parent();
	// If the table has three or fewer rows (<tr>s), it will be empty now and should be removed.
	if(row.parent().children("tr").length <= 3)
		row.parent().parent().parent().slideUp(400, function(){
			this.remove(); // Removes the <div> surrouding the table
		});
	else
		row.remove();
	
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
var createTable = function(tableTitle, classID){
	var s = '<div><table class="table table-bordered"><tbody id="'
	s += classID
	s += '"><tr class="info"><td colspan="6"><i class="icon-trash icon-large"></i> &nbsp; <strong>'
	s += tableTitle
	s += '</strong></td></tr><tr class="tableHead"><th></th><th>Class#</th><th>Building</th><th>Professor</th><th>Days</th><th>Time</th></tr></tbody></table></div>'
	return s
}

/**
	Function to create a table row out of json data
	Should be appended to the end of a tbody tag selected by a classid
**/
var createRow = function(data){
	//var s = '<tr><td><i class="icon-remove"></i></td><td>'+data.classnum+'</td><td>'+data.build+'</td><td>'+data.prof'</td><td>'+data.days+'</td><td>'+data.time'</tr></tr>';
	var s = '<tr><td><i class="icon-remove"></i></td><td>'
	s += data.classNum
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
var appendTable = function(tableTitle, classID, rows){
	$('#classes').append(createTable(tableTitle, classID));

	$.each(rows, function() {
		$('#'+classID).append(createRow(this));
	});
}

/**
	Controls the selection of rows. Will deselect other selected row, or toggle the selectd row off
**/
var toggleRowSelect = function(element){
	if($(element).hasClass('success'))
		$(element).removeClass('success')
	else if($(element).hasClass('info') || $(element).hasClass('tableHead'))
		return null;
	else
	{
		$(element).parent().find('.success').removeClass('success')
		$(element).addClass('success')
	}
}

/**
	When the topic select modal is opened, this will query the server for the relevant classe topics
**/
//
var subjectsFetched = false; // So we only make a subject request once
$('#selectSubject').on('show', function(){
	if(!subjectsFetched){
		$.getJSON('http://'+host+'/subjects', function(data) {
			$.each(data, function(){
				$('#classSubjectSelect').append('<option data-index="'+(this.subjectID)+'">'+this.subjectCode+': '+this.subjectName+'</option>');
			});
		});
		subjectsFetched = true;
	}
});

/**
	When the Subject Select button is clicked, this will hide the modal overlay and save the relevant selection info
**/
$('#modalSelectSubjectButton').click(function(){
	$('#selectSubject').modal('hide');
	//$('.modal-backdrop').remove();
	$('#selectTopic').modal('show');
});

/**
	When the topic select modal is opened, this will query the server for the relevant classe topics
**/
$('#selectTopic').on('show', function(){
	var subjectID = $('#classSubjectSelect option:selected').attr('data-index');
	$.getJSON('http://'+host+'/topics?subjectID='+subjectID, function(data) {
		$.each(data, function(){
			$('#classTopicSelect').append('<option data-index="'+this.classID+'">'+this.classID+': '+this.className+'</option>');
		});
	});
});

/**
	When the "Add Selected Classes" button is clicked, hides the modal overlay and creates a table
**/
$('#modalAddClassesButton').click(function(){
	var classID = $('#classTopicSelect option:selected').attr('data-index');
	var tableTitle = $('#classTopicSelect option:selected').val();

	// Request the classes and then make a table
	$.getJSON('http://'+host+'/classes?classID='+classID, function(data){
		appendTable(tableTitle, classID, data);
	});

	// Hide the overlay
	$('#selectTopic').modal('hide');
});

/**
	When the topic selector is closed, clean up the options
**/
$('#selectTopic').on('hidden', function(){
	$('#classTopicSelect').empty();
});
