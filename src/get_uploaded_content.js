/*
 * ---- Beatutiful Cal ----
 * 
 * The purpose of this code is to get uploaded .ics file and parse it
 * to instances of Event class in one Events class that is passed to
 * the newCalReady function. The newCalReady function can be found in
 * prepare_content.js.
 * 
 *    - input: .ics file
 *    - output: Events class (includes instances of Event class)
 *    - Event: each Event has structure of 
 *        Event.data
 *            ...
 *            data['attribute'] = 'value'
 *            data['attribute'] = 'value'
 *            data['attribute'] = 'value'
 *            ...
 *            
 *        Other event related information such as settings should be
 *        here i.e. Event.excluded = true/false
 *        
 *    - Events:
 *        Events.all
 *            ...
 *            Event
 *            Event
 *            Event
 *            ...
 *        Other Events related information should be here, i.e.
 *        Events.dstart and Events.dend
 * 
 * Each .ics file consists of a start (BEGIN:VCALENDAR) and an end (END:VCALENDAR).
 * The events start with "BEGIN:VEVENT" and end with "END:VEVENT". The event
 * information is stored between those lines. The order of the contents between start
 * and end does not matter.
 *            
 */

function putInput() {
	/*
	 * Generates an upload field to the index page. Presumes that the file is 
	 * a .ics file.
	 */
    var x = document.createElement("INPUT");
    x.setAttribute("type", "file");
    x.setAttribute("accept", ".ics");
    x.setAttribute("onchange", "checkData()");
    x.setAttribute("id", "icalFile");
    // Put field to the upload div
    $(".upload").prepend(x);
}

function checkData() {
	/*
	 * Checks that the uploaded file is a right format then loads it. Puts
	 * messages in the messages div.
	 */
	var x = document.getElementById("icalFile");;
	var txt = "";
	if ('files' in x) {
		for (var i = 0; i < x.files.length; i++){
			var file = x.files[i];
			$(".messages").empty();
			if (file.type == "text/calendar"){
				$(".messages").append("<p>Upload successful</p>");	
				loadData(file);
			}
			else {
				$(".messages").append("<p>wrong file type</p>");
			}
		}
	}
}

function loadData(file) {
	/*
	 * Called by checkData. Passes the file to the FileReader
	 * and calls parseData.
	 */
	if (typeof file != 'undefined') {
		var reader = new FileReader();
		reader.onload = (function(theFile){
			return function(e) {
				// Whenever file is loaded, call parseData function
		          parseData(e.target.result);
		        };
		})(file);
		reader.readAsText(file);
	}
}

function Line(line) {
	/*
	 * Defines Line class that stores raw lines from the file. Line
	 * has prototype functions that separate the data from the string.
	 */
	this.value = line;
}
Line.prototype.has = function(subString) {
	/*
	 * Helper function for checking occurrences of strings in a line.
	 * Uses regexp and returns true or false if there is a match.
	 */
	var patt = new RegExp(subString);
	if (patt.test(this.value)){
		return true;
	}
	return false;
}
Line.prototype.isNewAttribute = function() {
	/*
	 * Returns true if the line has an attribute name in it.
	 * For example: DESCRIPTION:
	 * Needed to separate multiline values.
	 */
	if (this.has(/.+:/i)){
		return true;
	}
	return false;
};
Line.prototype.getValues = function(){
	/*
	 * Parses attribute:data pairs from the lines.
	 * If no attribute name is found, returns only
	 * the value.
	 */
	var attr = null;
	var data = null;
	var items = [];
	// Find something separated by ":"
	attr = /(.+):/i.exec(this.value);
	if (attr){
		// Get the value inside the regex parenthesis
		items.push(attr[1]);
	}
	data = /.+:.*?(.+)/.exec(this.value);
	if (data){
		// Get the value inside the regex parenthesis
		items.push(data[1]);
	}
	// If the line is part of the last attribute value,
	// get the whole thing.
	if ( ! this.isNewAttribute()) {
		data = /.+/m.exec(this.value);
		if (data){
			items.push(data[0].trim());
		}
	}
	return items;
};


function parseData(text) {
	/*
	 * For every line from the file, create a
	 * new Line instance and put the according
	 * values inside. Pass list of Line instances
	 * to the sortEvents function.
	 */
	var lines = text.split("\n");
	var last = "";
	var eventList = [];
	var dataList = [];
	var e = 0;
	var d = 0;
	for (var x = 0; x < lines.length; x++){
		var newLine = new Line(lines[x]);
		// If a new attribute starts, get attr:value pair
		if (newLine.isNewAttribute()){
			var values = newLine.getValues();
			
			if (typeof values[0] != 'undefined'){
				newLine.attr = values[0];				
			}
			
			if (typeof values[0] != 'undefined'){
				newLine.data = values[1];				
			}
		}
		// If the line is a part of the last value,
		// get the value and put it after the last.
		else {
			var lastVals = newLine.getValues()[0];
			// If line was empty, discard
			if (typeof lastVals != 'undefined'){
				last.data =  last.data + lastVals;				
			}
		}
		// If the line starts a new attribute,
		// flush the last line to dataList and
		// continue to the next line.
		if (newLine.isNewAttribute()){
			dataList[d] = last;
			d++;
			last = newLine;			
		}
		// If the current line is the first line
		// of the event, flush dataList to events and continue.
		if (newLine.has(/begin:vevent/i)){
			eventList[e] = dataList;
			e++;
			dataList = [];
			d = 0;
		}
	}
	
	//console.log(eventList);
	
	sortEvents(eventList);
}

function Event(event){
	/*
	 * Class that wraps an event. If user gives some event
	 * specific settings or data, add those attributes here.
	 * For example, if the user wants to exclude an Event, there
	 * should be: this.exclude = true;
	 */
	var data = [];
	// Constructs the data array from the given event
	for (var k = 0; k < event.length; k++){
		data[event[k].attr] = event[k].data;
	}

	this.data = data;
	this.dstart = null;
	this.dend = null;
	
	//Example:
	//this.exclude = false;
}

function Events(){
	/*
	 * Events class to store all Event instances. The instances
	 * can be accessed by calling Events.all. The common calendar
	 * settings should be added here if implemented
	 */
	
	this.all = [];
	
	//Examples:
	//this.dstart = someday;
	//this.dend = someday;
}

function sortEvents(events){
	/*
	 * Create an Events instance and put Event instances inside.
	 * Give Events class to newCalReady and start other processes.
	 */
	var eventsClass = new Events();
	for (var i = 0; i < events.length; i++){
		newEvent = new Event(events[i]);
		newEvent.data;
		eventsClass.all.push(newEvent);
	}
	newCalReady(eventsClass);
	
}

/*
 * When document is ready create the page.
 */
$(document).ready(function(){
	putInput();
});
