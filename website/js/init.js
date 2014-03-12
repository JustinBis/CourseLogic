/**
	This script contains all functions to be called when the DOM is ready
	according to jQuery's .ready() function.

	This should be loaded after all other scripts that provide page functions
	so we can't call functions that don't yet exist.

	Things to do when the DOM is ready:
	1. Initialize Select2 on all <select> tags
	2. Draw the #visual canvas
	3. Activate bootstrap tooltips to show users how to use the site
	4. Offer help to new users via the tutorial that highlights the tooltips
**/

$( document ).ready(function() {
	// Initialize select2 on the subject modal's <select>
	$("#classSubjectSelect").select2();
	// Initialize select2 on the topic modal's <select>
	$("#classTopicSelect").select2();

	// Draw the #visual canvas
	updateSelections();

	// Check if the user has been here before and offer help if they haven't.
	if(readCookie('firstTime') == null)
	{
		// This is their first time! Offer help!
		window.setTimeout(function()
		{
			$("#tutorialButton").tooltip('show');
		}, 4000); // 4 second delay before the tooltip is automatically shown.
	}

});