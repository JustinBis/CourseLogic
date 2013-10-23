/**
	This script contains all functions to be called when the DOM is ready
	according to jQuery's .ready() function.

	This should be loaded after all other scripts that provide page functions
	so we can't call functions that don't yet exist.

	Things to do when the DOM is ready:
	1. Initialize Select2 on all <select> tags
	2. Draw the #visual canvas
	3. Activate bootstrap tooltips to show users how to use the site
**/

$( document ).ready(function() {
	//?? May have to initilize after loading, or provide loading functions
	// Initialize select2 on the subject modal's <select>
	$("#classSubjectSelect").select2();
	// Initialize select2 on the topic modal's <select>
	$("#classTopicSelect").select2();

	// Draw the #visual canvas
	updateSelections();

	//Activate all bootstrap tooltips
	$("[data-toggle='tooltip']").tooltip();
});