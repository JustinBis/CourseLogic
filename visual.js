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