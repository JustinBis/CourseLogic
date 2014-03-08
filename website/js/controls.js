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
$('#classes').on('click', '.icon-remove', function(event){
	// Stop the click from propgating so we don't toggle the row select
	event.stopPropagation();

	var row = $(this).parent().parent();
	var crn = $(row).attr('data-crn');
	var toRemove = $(row).parent().find('[data-crn="'+crn+'"]');

	// If the table has the number of removed rows plus two or fewer rows (<tr>s), it will be empty and should be removed.
	if(row.parent().children("tr").length <= 2 + toRemove.length){
		//toggleRowSelect(row);
		row.parent().parent().parent().slideUp(400, function(){
			this.remove(); // Removes the <div> surrouding the table
			updateSelections(); // Need to run again as slideUp fires async
		});
	}
	else
		toRemove.remove();
	
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
	Attaches a click handler to the dropdown icons in the table headers
**/
$('#classes').on('click', '.icon-circle-arrow-down', function(){
	// Save the icon element reference for later
	var icon = $(this);
	// If the icon is already rotated and was then clicked, slide the table back down
	if(icon.hasClass("icon-rotate-90")){
		// Show all the siblings of the info row. I would use .slideDown, but it doesn't work on tables
		// Note that siblings() excludes the selected row, which is good for us
		$(this).parent().parent().siblings().show(400, function(){
		
		});
		// Rotate the icon once the table has rolled down
		icon.removeClass("icon-rotate-90");
	}
	else{
		$(this).parent().parent().siblings().hide(400, function(){
			
		});
		// Rotate the icon once the table has been hidden up
		icon.addClass("icon-rotate-90");
	}
});



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
			if(professor != "TBA")
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
	s += '+Auburn+University+Rate+My+Professors" target="_blank">';
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

/**
	Controls the selection of rows. Will deselect other selected row, or toggle the selectd row off
**/
var toggleRowSelect = function(element){
	if($(element).hasClass('success'))
		$(element).parent().find('.success').removeClass('success');
	else if($(element).hasClass('info') || $(element).hasClass('tableHead'))
		return null;
	else
	{
		$(element).parent().find('.success').removeClass('success');
		// Add the .success class to every class with a matching crn in the table (to capture labs, etc.)
		var crn = $(element).attr('data-crn');
		$(element).parent().find('[data-crn="'+crn+'"]').addClass("success");
	}
};

/**
	When the topic select modal is opened, this will query the server for the relevant classe topics
**/
var subjectsFetched = false; // So we only make a subject request once
$('#selectSubject').on('show', function(){
	if(!subjectsFetched)
	{
		$.getJSON(APIhost+'subjects')
			// Function to run if the GET is successful
			.done(function(data) {
				$.each(data, function(){
					$('#classSubjectSelect').append('<option data-index="'+(this.subjectID)+'">'+this.subjectID+': '+this.subjectName+'</option>');
				});
				// Remove the loading dialogue
				$('#selectSubjectsLoading').slideUp(400);
				// Initialize Select2 on the loaded classes
				//$("#classSubjectSelect").select2();
				subjectsFetched = true;
			})
			// Function to run if the GET fails
			.fail(function(jqxhr, textStatus, err){
				console.log( "Subject Request Failed: "+ textStatus + ", " + err);
				$('#selectSubjectsLoading').hide();
				$('#classSubjectSelect').hide();
				$('#modalSelectSubjectButton').hide();
				$('#selectSubjectsError').show();
			});
	}
});

/**
	When the Subject Select button is clicked, this will hide the modal overlay
**/
$('#modalSelectSubjectButton').click(function(){
	$('#selectSubject').modal('hide');
	$('#selectTopic').modal('show');
});

/**
	When the topic select modal is opened, this will query the server for the relevant classe topics
**/
$('#selectTopic').on('show', function(){
	var subjectID = $('#classSubjectSelect option:selected').attr('data-index');
	// Show the loading text
	$('#selectTopicLoading').show();
	$.getJSON(APIhost+'topics?subjectID='+ encodeURIComponent(subjectID) )
		// Function to run if the GET is successful
		.done(function(data) {
			$.each(data, function(){
				$('#classTopicSelect').append('<option data-index="'+this.classID+'">'+this.classID+': '+this.className+'</option>');
			});
			// Slide the loading text up
			$('#selectTopicLoading').slideUp(400);
		})
		// Function to run if the GET fails
		.fail(function(jqxhr, textStatus, err){
			console.log( "Topic Request Failed: "+ textStatus + ", " + err);
			$('#selectTopicLoading').hide();
			$('#classTopicSelect').hide();
			$('#modalAddClassesButton').hide();
			$('#selectTopicError').show();
		});
});

/**
	When the "Add Selected Classes" button is clicked, hides the modal overlay and creates a table
**/
$('#modalAddClassesButton').click(function(){
	var classID = $('#classTopicSelect option:selected').attr('data-index');
	var className = $('#classTopicSelect option:selected').val();

	// Make the loading bar visible on the main page
	$('#loadingTable').show();

	// Request the classes and then make a table
	$.getJSON(APIhost+'classes?classID='+classID)
		// Function to run if the GET is successful
		.done(function(data){
			processClassData(className, classID, data);
			$('#loadingTable').hide();
		})
		// Function to run if the GET fails
		.fail(function(jqxhr, textStatus, err){
			console.log( "Class Times Request Failed: "+ textStatus + ", " + err);
			$('#loadingTable').hide();
			$('#loadingTableError').append('<div class="alert alert-error"><button type="button" class="close" data-dismiss="alert">&times;</button><strong>Error Loading Table</strong> Try again in a minute or two. Sorry!</div>');
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

/**
	Attach a listener to the visual so that it can detect when it's being dragged
	Also attach a listener to the body so we can deactivate the mousemove listener one the mouse button has been released
**/
$('#visual').mousedown(function(){
	previousPageY = null; // Used for tracking in the mouseMoveHandler
	$('#visual').mousemove(mouseMoveHandler);
});
// Note: binding this to the body can break some other extensions that rely on mouseup listeners.
// However, it's best to bind this to the body so we don't have to deal with mouseup happening outside of the visual and it not being caught
$(document).mouseup(function(){
	$('#visual').unbind("mousemove", mouseMoveHandler);
});

var mouseMoveHandler = function(e) {
	if(previousPageY){
		// Only update dragYOffset if it won't fall out of the allowed range
		if( (dragYOffset + e.pageY - previousPageY) >= minYOffset && (dragYOffset + e.pageY - previousPageY) <= maxYOffset){
			dragYOffset += e.pageY - previousPageY;
			updateVisual();
		}
		previousPageY = e.pageY;
	}
	else{
		previousPageY = e.pageY;
	}
};

/**
	Attach a listener to the visual for mousewheel scrolling so that works too.
	Note: requires a 3rd party jQuery library (https://github.com/brandonaaron/jquery-mousewheel)
**/
$('#visual').bind('mousewheel', function(event, delta, deltaX, deltaY) {
	// Normally I would stop the event propogation here so that the page doesn't continue scrolling,
	// but this is a custom event, as the mouse wheel event is a very fractured web standard.

	// Each scroll 'click' is a single deltaY, so let's scale it:
	var change = deltaY*25;

    if( (dragYOffset + change) >= minYOffset && (dragYOffset + change) <= maxYOffset){
		dragYOffset += change;
		updateVisual();
	}
	// If we're trying to scroll out of range, just set it to the limit
	else if((dragYOffset + change) < minYOffset)
		dragYOffset = minYOffset;
	else if((dragYOffset + change) > maxYOffset)
		dragYOffset = maxYOffset;
});