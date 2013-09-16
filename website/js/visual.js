var canvas = document.getElementById('visual');
if(canvas.getContext)
	var context = canvas.getContext('2d');

var rowHeight = 50; // Height of each drawn row in pixels
var dayWidth = 60; // Width of each day's column
var timesColWidth = 50; // Width of the times col
var firstHour = 8; // The first drawn hour on the table

var times = [8, 9, 10, 11, 12, 1, 2, 3, 4, 5];
var days = ['Mon.', 'Tues.', 'Wed.', 'Thurs.', 'Fri.'];

var selectedSections = [
{
	"name" : ["EXAMP", "101"],
	"days" : [1, 3],
	"startTime" : [11,00],
	"endTime": [12,45]
}];

function drawBase(){
	// Clear the canvas for a redraw
	context.clearRect(0, 0, canvas.width, canvas.height);

	// Draw the header
	context.fillStyle = "#d9edf7"; // Matches the bootstrap .info color
	context.fillRect(0,0,350,rowHeight);

	// Draw text on to the header
	context.fillStyle = "rgb(51,51,51)"; // Matches the bootstrap black
	context.font = "20pt Helvetica bold";
	context.textAlign = "center";
	context.textBaseline = "middle";
	context.fillText("Visual", context.canvas.width/2, rowHeight/2); // Fill Text to the center


	// Draw Row Lines
	context.lineWidth = 0.5;
	context.strokeStyle = "#ddd";
	context.beginPath();
	for (var i = 1; i<=times.length; i++){
		var y = (i+1)*rowHeight
		context.moveTo(0, y);
		context.lineTo(context.canvas.width, y);
		context.stroke();
	}

	// Draw Col Lines
	context.beginPath();
	var start = timesColWidth // Offset to first line
	for (var i = 0; i<5; i++){
		var x = start+i*dayWidth;
		context.moveTo(x, rowHeight);
		context.lineTo(x, context.canvas.height);
		context.stroke();
	}

	// Draw Times Header Backdrop
	context.fillStyle = "rgba(20, 180, 50, 0.5)";
	context.fillRect(0, rowHeight, timesColWidth, context.canvas.height);
	// Draw Days Header Backgdrop
	context.fillRect(0, rowHeight, context.canvas.width, rowHeight);

	// Draw Days
	context.font = "14pt Helvetica bold";
	context.fillStyle = "rgb(51,51,51)";
	for (var i = 1; i<=days.length; i++){
		context.fillText(days[i-1], timesColWidth+(i*dayWidth)-(dayWidth/2), rowHeight+rowHeight/2);
	}

	// Draw Times
	var base = rowHeight*2 // Space before first time
	for (var i = 0; i<times.length; i++){
		context.fillText(times[i].toString()+":00", 25, base+(rowHeight/2)+i*rowHeight);
	}
}

/**
	Reads from the passed in list of classes 
**/
function drawClasses(classList){
	for (var i = 0; i<classList.length; i++)
	{
		// Assign the current working class section to a variable
		var section = classList[i];

		// Set the font context
		context.font = "12pt Helvetica bold";
		context.textAlign = "center";
		context.textBaseline = "middle";

		// Calculate the start time offset to use for box placement
		// Normally, we will need to shift the box up 8 hours, since we don't draw earlier than 8 AM as no classes occur any earlier
		var startOffset = -8;
		if(section.startTime[0]<=7)
			startOffset = 4;

		var endOffset = -8
		if(section.endTime[0]<=7)
			endOffset = 4;

		// Find top and bottom bounds for the box
		var top = rowHeight*2 + (section.startTime[0]+startOffset)*rowHeight; //TODO: Account for after noon
		// Deal with the minutes - int divide by 15 to get the number of quarters past the hour, and multiply by the offset given by the quarters of a rowHeight
		top += (section.startTime[1]/15)*(rowHeight/4.0);

		var bottom = rowHeight*2 + (section.endTime[0]+endOffset)*rowHeight;
		// Deal with the minutes again
		bottom += (section.endTime[1]/15)*(rowHeight/4.0);

		// The height of the square
		var height = bottom - top;

		// Repeat drawing for each day
		for(var j = 0; j<section.days.length; j++)
		{
			// Calculate the left side offset
			var left = timesColWidth+(section.days[j]*dayWidth);

			// Set the style for the squares we will draw and then draw them
			context.fillStyle = "rgba(212, 228, 203, 0.8)";  //"#d4e4cb" with Alpha. Is close to bootstrap's .success color to match the selected rows
			context.fillRect(left, top, dayWidth, height);

			// Set the style for the label and then draw it
			context.fillStyle = "rgb(51,51,51)";
			context.fillText(section.name[0], left+(dayWidth/2), top+(height/2)-10);
			context.fillText(section.name[1], left+(dayWidth/2), top+(height/2)+10);			
		}

	}
}

/**
	A function that searches for selected rows and then updates the visual with the new selections
**/
var updateSelections = function(){
	// Clear the previous selections
	selectedSections = [];
	rows = $('#classes').find('.success')
	$.each(rows, function(){
		// First, extract the name by selecting the parent's ID, then splitting over every -
		var classID = this.parentElement.id.split("-"); // EXAMP 0101 becomes [EXAMP, 0101]
		var name = [classID[0], classID[1]]; // Store as [EXAMP, 0101]

		// Extract the raw day and time data, removing any witespace.
		columns = this.children.length - 1; // Number of columns in this row, zero indexed
		var rawDays = this.children[columns-1].innerHTML.replace(/\s+/g, '');
		var rawTimes = this.children[columns].innerHTML.replace(/\s+/g, '').split("-");

		// Parse the days
		var days = [];
		for(var i = 0; i<rawDays.length; i++)
		{
			switch(rawDays[i])
			{
				case "M": days[i] = 0; break;
				case "T": days[i] = 1; break;
				case "W": days[i] = 2; break;
				case "R": days[i] = 3; break;
				case "F": days[i] = 4; break;
			}
		}

		// Parse the times
		var startTime = parseTime(rawTimes[0]);
		var endTime = parseTime(rawTimes[1]);


		// Finally, build the object and push it onto the global store
		selectedSections.push({
			"name" : name,
			"days" : days,
			"startTime" : startTime,
			"endTime" : endTime
		});
	});
	updateVisual()
}

/**
	A function that takes a 12 hour time and converts it to 24 hour,
	then returns a formatted time arrary with integers [hours, minutes]
**/
function parseTime(inputTime){
	// Store a cleaned and split version of the input time in numbers only
	var split = inputTime.replace(/[a-zA-Z]/g, '').split(":");
	var hours = split[0];
	var minutes = split[1];

	// If the time is am, don't change the hours
	if(/am/.test(inputTime)){
		// Handle the edge case of 12:00 am being 00 hours (if input starts with 12)
		if(/^12/.test(inputTime))
			hours = 00;
	}
	// If the time is pm, change the hours to 24 hour time
	else if(/pm/.test(inputTime)){
		// Don't handle the edge case of 12:00 pm, as it is the correct hour already
		if(!(/^12/.test(inputTime))){
			// Convert to an integer and add 12 hours to make it 24 hour time
			hours = parseInt(hours) + 12;
		}
	}

	return [parseInt(hours), parseInt(minutes)];
}

/**
	A function to update the visual from the global variables
**/
function updateVisual(){
	drawBase();
	drawClasses(selectedSections);
}

// Will execute once the script is loaded. So long as the script is loaded after the canvas is created, we're good.
updateVisual();