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

var newcal = null;

function checkData(run) {
	/*
	 * Checks that the uploaded file is a right format then loads it. Puts
	 * messages in the messages div.
	 */
	$(".messages").empty();
	$(".messages").append("Please select a file");		
	var x = document.getElementById("icalFile");
	var txt = "";
	if ('files' in x) {
		for (var i = 0; i < x.files.length; i++){
			var file = x.files[i];
			$(".messages").empty();
			if (file.type == "text/calendar"){
				$(".messages").append("Upload successful: "+file.name);	
				if (run == true){				
					loadData(file);
				}
			}
			else {
				$(".messages").append("Wrong file type");
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
		          newcal = parseData(e.target.result);
		          makeVisible(newcal);
		        };
		})(file);
		reader.readAsText(file);
	}
}


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
	
	return sortEvents(eventList);
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
	
	return newCalReady(eventsClass);
}

/*
 * When document is ready create the page.
 */
$(document).ready(function(){
	initUI();
});
