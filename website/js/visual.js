var canvas = document.getElementById('visual');
// Setup the canvas context
if(canvas.getContext){
	var context = canvas.getContext('2d');
	context.textAlign = "center";
	context.textBaseline = "middle";
}

/**
	Variable to keep track of the y-offset that comes from dragging the canvas
	Classes and times will be offset by this so we can draw more in a smaller space.
**/
// Initalize the offset so the schedule starts with the time from START_SCHEDULE_TIME
var dragYOffset = (EARLIEST_SCHEDULE_TIME - START_SCHEDULE_TIME)*rowHeight;

// Find the minimum and maximum transforrmation offsets we can have before we're beyond the
// times allowed by the EARLIEST_SCHEDULE_TIME and LATEST_SCHEDULE_TIME constants
// Remember, all the offsets are in the negatives with canvas since we're shifitng it up
var maxYOffset = (EARLIEST_SCHEDULE_TIME - START_SCHEDULE_TIME)*rowHeight + 2*rowHeight; // Add the 2*rowHeight ot account for the two extra top rows

// The maximum amount of downward scrolling would be the to the last schedule time + 1 (so we show the whole hour and not just the start)
// minus the start time and minus the amount of time that can be shown at once on the canvas.
// This is equal to the number of rows down we can before reaching the defined end.
// However, we also have to add the two extra top header rows, and then negate the whole thing as this is a transformation
var minYOffset = -1*((LATEST_SCHEDULE_TIME+1 - START_SCHEDULE_TIME - (context.canvas.height/rowHeight - 2))*rowHeight + 2*rowHeight);

function drawBase(){
	// Clear the canvas for a redraw
	context.clearRect(0, 0, canvas.width, canvas.height);

	// Set up the line style
	context.lineWidth = 0.5;
	context.strokeStyle = "#ddd";

	// Row lines will be affected by the dragYOffset as well
	// Save the context so we can undo all translations easily at the end of this function
	context.save();

	context.translate(0,dragYOffset%rowHeight);

	// Draw Row Lines
	context.beginPath();
	// Draw lines starting at the bottom of the second row all the way until we hit the canvas height
	for (var i = 1; i<=context.canvas.height/rowHeight; i++){
		var y = (i+1)*rowHeight
		context.moveTo(0, y);
		context.lineTo(context.canvas.width, y);
		context.stroke();
	}

	// Restore the context so everything else draws normally
	context.restore();

	// Draw Col Lines
	context.beginPath();
	var start = timesColWidth // Offset to first line
	// Draw a col line for every day of the week shown
	for (var i = 0; i<days.length; i++){
		var x = start+i*dayWidth;
		context.moveTo(x, rowHeight);
		context.lineTo(x, context.canvas.height);
		context.stroke();
	}
}

/**
	Draws a title header to the top row along with a background that matches the tables' headers
**/
function drawHeader(){
	// Draw the header
	context.fillStyle = "#d9edf7"; // Matches the bootstrap .info color
	context.fillRect(0,0,350,rowHeight);

	// Draw text on to the header
	context.fillStyle = "rgb(51,51,51)"; // Matches the bootstrap black
	context.font = "20pt Helvetica bold";
	context.fillText(VISUAL_TITLE, context.canvas.width/2, rowHeight/2); // Fill Text to the center
}

/**
	Draws the days of the week to the second row along with a background
**/
function drawDayOverlay(){
	// Draw Days Header Backgdrop

	/* Doesn't actually look very good, maybe tweak it later
	// Create linear gradient
	var gradient = context.createLinearGradient(0, rowHeight, 0, rowHeight*2);
	gradient.addColorStop(0, 'rgba(20, 180, 50, 1)');   
	gradient.addColorStop(1, 'rgba(20, 180, 50, 0.5)');
	context.fillStyle = gradient;
	*/
	context.fillStyle = "rgba(20, 180, 50, 0.5)";
	context.fillRect(timesColWidth, rowHeight, context.canvas.width, rowHeight);

	// Draw Days
	context.font = "14pt Helvetica bold";
	context.fillStyle = "rgb(51,51,51)";
	for (var i = 1; i<=days.length; i++){
		context.fillText(days[i-1], timesColWidth+(i*dayWidth)-(dayWidth/2), rowHeight+rowHeight/2);
	}
}

/**
	Function to draw the days and times over the classes and backrgound already drawn to the canvas 
**/
function drawTimeOverlay(){
	// Draw Times Verticle Backdrop
	context.fillStyle = "rgba(20, 180, 50, 0.5)";
	context.fillRect(0, rowHeight, timesColWidth, context.canvas.height);

	// Save the context so we can undo all translations easily at the end of this function
	context.save();

	context.translate(0,dragYOffset);

	// Draw Times
	context.font = "14pt Helvetica bold";
	context.fillStyle = "rgb(51,51,51)";
	var base = rowHeight*2 // Space before first time

	for (var i = 0; i <= LATEST_SCHEDULE_TIME - EARLIEST_SCHEDULE_TIME; i++){
		yLocation = base+(rowHeight/2)+i*rowHeight

		// Covert from the i-th index to a time string by using a modulus to wrap around the 12:00 point
		timeString = ((i+EARLIEST_SCHEDULE_TIME)%12).toString()+":00"

		// Handle noon being displayed improperly due to the modulus above
		if(timeString == "0:00")
			timeString = "12:00";
		context.fillText(timeString, 25, yLocation);
	}

	// Finally, restore the context so everything else draws normally
	context.restore();
}

/**
	Reads from the passed in list of classes 
**/
function drawClasses(classList){
	// Save the context so we can undo all translations easily at the end of this function
	context.save();
	context.translate(0,dragYOffset);

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
		/*var startOffset = -8;
		if(section.startTime[0]<=7)
			startOffset = 4;

		var endOffset = -8
		if(section.endTime[0]<=7)
			endOffset = 4;*/
		var startOffset = -EARLIEST_SCHEDULE_TIME;
		var endOffset = startOffset;

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

	// Finally, restore the context so everything else draws normally
	context.restore();
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
		try
		{
			var startTime = parseTime(rawTimes[0]);
			var endTime = parseTime(rawTimes[1]);
		}
		catch(e)
		{
			console.log("Error parsing times:")
			console.log(rawTimes);
			return;
		}


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
	A function to call all drawing functions in the proper order to update the visual
**/
function updateVisual(){
	drawBase();
	drawClasses(selectedSections);
	drawTimeOverlay();
	// Draw the day overlay after the classes so that it shows up above them and the transparency reveals classes behind it
	drawDayOverlay();
	// Draw the header last to hide everything behind it
	drawHeader();
}