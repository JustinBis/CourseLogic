/*
 * Displays all of the tooltips in a tutorial order,
 * waiting on the user to click before advancing to the next step.
 */
function runTutorial() {
	// First set a cookie and destroy the tooltip so it doesn't show up again
	// Make the cookie last ~3 months (90 days)
	createCookie("firstTime", "no", 90);
	$("#tutorialButton").tooltip('destroy');

	// Define the order in which the tutorial tooltips are shown
	// (Defined as jQuery selector strings)
	var tipList = 
	[
		'#tutorialRow', // Select a class
		'#visual', // Scroll the canvas
		'#tutorialRMP', // Rate My Professor
		'#tutorialX', // Show the 'x' delete a row button
		'#tutorialMinimize', // Show the minimize button
		'#tutorialTrashcan', // Show the 'trashcan' delete class button
		'#selectSubjectButton' // Finally, tell them to add their own class!
	];

	// Keep track of our place in the tip list
	var tipIndex = 0;

	function nextTip() {
		if( tipList[tipIndex] )
		{
			$( tipList[tipIndex] )
			.tooltip('show')
			.one('click', function() {
				$( tipList[tipIndex] ).tooltip('destroy');
				tipIndex += 1;
				nextTip();
			});
		}
	}

	// Give the first tip
	nextTip();

/*
	// Show how to select a class
	$('#tutorialRow')
	.tooltip('show')
	.one('click', function() {
		$('#tutorialRow').tooltip('destroy');
	});

	// Show how to scroll the canvas
	$('#visual').tooltip('show');

	// Show the rate my professor button
	$('#tutorialRMP')
	.tooltip('show')
	.one('click', function() {
		$('#tutorialRMP').tooltip('destroy');
	});

	// Show the 'x' delete a row button
	$('#tutorialX').tooltip('show');

	// Show the minimize button
	$('#tutorialMinimize').tooltip('show');

	// Show the 'trashcan' delete class button
	$('#tutorialTrashcan').tooltip('show');

	// Finally, tell them to add their own class!
	$('#selectSubjectButton').tooltip('show');
*/
}