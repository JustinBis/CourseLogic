/**
	This script contains all user set variables and should be
	loaded before any scripts that may reference these variables.
**/

////////////////////////
// CONTROLS VARIABLES //
////////////////////////

// The base URL for CourseLogic API requests
var APIhost = "api/uf/";


//////////////////////
// VISUAL VARIABLES //
//////////////////////

// These constants define the earliest and latest hours the
// schedule canvas will scroll to, in 24-hour format
var EARLIEST_SCHEDULE_TIME = 6; // 6 A.M.
var LATEST_SCHEDULE_TIME = 22; // 10 P.M.

// This constant defines the time-position for the first canvas draw.
var START_SCHEDULE_TIME = 8; // 8 A.M.

// NOTE: Changing any of these next 4 vars requires you to resize the visual.
// A list of the days to print to the header row.
// Its length is also used to know how many class columns there should be.
var days = ['Mon.', 'Tues.', 'Wed.', 'Thurs.', 'Fri.'];
// Height of each drawn row in pixels
var rowHeight = 50; 
// Width of each day's column
var dayWidth = 60;
// Width of the times column
var timesColWidth = 50;