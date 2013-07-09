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

// Will execute once the script is loaded. So long as the script is loaded after the canvas is created, we're good.
updateVisual();

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
		var classID = this.parentElement.id.split("-"); // CSCI-UA-101 becomes [CSCI, UA, 101]
		var name = [classID[0], classID[2]]; // Store as [CSCI, 101]

		// Extract the raw day and time data
		var rawDays = this.children[4].innerHTML.split("/");
		var rawTimes = this.children[5].innerHTML.split("-");

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
		// Remove any whitespace
		var startTime = rawTimes[0].replace(/\s+/g, '').split(":");
		var endTime = rawTimes[1].replace(/\s+/g, '').split(":");

		// Convert to integers
		startTime[0] = parseInt(startTime[0]);
		startTime[1] = parseInt(startTime[1]);
		endTime[0] = parseInt(endTime[0]);
		endTime[1] = parseInt(endTime[1]);

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
	A function to update the visual from the global variables
**/
function updateVisual(){
	drawBase();
	drawClasses(selectedSections);
}