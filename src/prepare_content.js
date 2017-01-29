/*
 *  ---- Beatutiful Cal ----
 *  
 *  The purpose of this file is to handle the information from the
 *  given Events instance. For each Event instance inside the Events,
 *  the data shall be ordered and parsed so that the output is clean
 *  and tidy. 
 *  
 *  The handled data is presented in the .content div on the index page.
 *  A download button is added to make exporting of the new calendar file
 *  easier.
 */


function newCalReady(events){
	/*
	 * Called by get_uploaded_content.js. The parameter
	 * is an Events instance that contains all event information
	 * of the original .ics file. This function is called only when
	 * a file is handled succesfully.
	 */
	
	//console.log(events);
	
	// Clean the table before applying new information.
	$(".content").empty();
	
	function parseSummaryField(textarr, data){
		/*
		 * Takes in a list of strings and an instance of
		 * Event. Parses the items inside the list and puts
		 * them in the right places inside the Event.
		 * 
		 * textarr should be the content of the summary field.
		 */
		//console.log(textarr);
		
		// Create new string for the SUMMARY field.
		var newsumm = [];
		
		// Course name should be inside the second last item of the list
		// The actual name is the last string after "/" character.
		var coursename = textarr.last(-1).split("/").last();
		// We want only the name, not the course code:
		var coursename = coursename.split(/ - (.+)/)[1];
		newsumm.push(coursename);
		
		// First member of the array is something like:
		// "H06 Harjoitukset/Excercises/Övningar", let's
		// take only the first part before "/"
		newsumm.push(textarr[0].split("/")[0]);
		
		// Append the new summary text to the field
		data["SUMMARY"] = newsumm.join("\\,");
		
		// If there is more than the two previous lines,
		// we can get the location.
		if (textarr.length > 2){
			var loc = [];
			
			// Let's assume the second line is the location (room).
			if (typeof textarr[1] != 'undefined'){
				loc.push(textarr[1].split("/")[0]);
				
				// The third line is a building but if the building is
				// omitted, the first part of the second last line will do.
				// In fact, the second last line is something like:
				// " Sähkömiehentie 3/ CS-A1121 - Ohjelmoinnin peruskurssi Y2"
				if (typeof textarr[2] != 'undefined'){
					
					// Select the first thing before "/" or the whole thing.
					loc.push(textarr[2].split("/")[0]);						
				}
			}
			
			// Create LOCATION field and give it the new string
			data["LOCATION"] = loc.join("\\,");
		}
	}
	
	function fixData(){
		/*
		 * Currenly all the original data of the calendar events
		 * are a clusterfuck in the SUMMARY field. Thus the SUMMARY
		 * field must be parsed and the data must be put in place.
		 */
		
		// Go through all the events and find the SUMMARY field
		for (var i = 0; i < events.all.length; i++){
			var data = events.all[i].data;
			var text = data["SUMMARY"];
			if (typeof text != 'undefined'){
				
				// The values are separated with "\," characters.
				// Construct an array of those and remove the chars.
				var textarr = text.split("\\,");
				
				// Parse that old sucker
				parseSummaryField(textarr, data);
			}
			var categ = data["CATEGORIES"];
			
			// Modify the category to only have the course code
			// Also, for future purposes, this is the place to take
			// down the course code.
			if (typeof categ != 'undefined'){
				// Orig: ex. "CS-12231_immamonkey"
				data["CATEGORIES"] = categ.split("_")[0];				
			}
		}
	}
	
	function appendRow(key, value){
		/*
		 * Helper function for putting the data to the text field
		 */
		if (typeof key != 'undefined' && typeof value != 'undefined'){
			$(".content").append(key+":" + value+"\n");			
		}
	}
	
	function giveTextFormat(){
		/*
		 * Function for flushing the data to a single string.
		 * The events should always start with "BEGIN:" and 
		 * end with "END". In between, flush the key:value pairs
		 * in random order and and the whole thing with "END:VCALENDAR".
		 * 
		 */
		for (var i = 0; i < events.all.length; i++){
			var data = events.all[i].data;
			appendRow("BEGIN", data["BEGIN"]);
			for (key in data){
				if (typeof data[key] == 'string' &&
						key != "BEGIN" && key != "END"){
					appendRow(key, data[key]);
				}
			}
			appendRow("END", data["END"]);
			
		}
		$(".content").append("END:VCALENDAR\n");
	}
	
	function saveTextAsFile() {
		
		/*
		 * Extract a file blob from the text field and serve it to
		 * the web page.
		 */
		
		var textToWrite = document.getElementById('textArea').value;
		//console.log(textToWrite);
		
		var textFileAsBlob = new Blob([ textToWrite ], { type: 'text/plain' });
		var fileNameToSaveAs = "newcal.ics";
		
		var downloadLink = document.createElement("a");
		downloadLink.download = fileNameToSaveAs;
		downloadLink.innerHTML = "Download File";
		if (window.URL != null) {
		  // Chrome allows the link to be clicked without actually adding it to the DOM.
			downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
		} else {
		  // Firefox requires the link to be added to the DOM before it can be clicked.
			downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
			downloadLink.onclick = destroyClickedElement;
			downloadLink.style.display = "none";
			document.body.appendChild(downloadLink);
		}

		downloadLink.click();
		}
	
	// Create a button
	var button = document.getElementById('save');
	button.addEventListener('click', saveTextAsFile);

	function destroyClickedElement(event) {
		// remove the link from the DOM
		document.body.removeChild(event.target);
	}
	
	function pinEventData(){
	
			// Save information to the Event for easier handling
			
			events.doToAllEvents(function(event){
				event.dstart = toISODate(getAttributeData(event, "DTSTART"));
				event.dend = toISODate(getAttributeData(event, "DTEND"));
				event.courseCode = getAttributeData(event, "CATEGORIES");
				event.courseName = getAttributeData(event, "SUMMARY").split("\\,")[0];
				event.type = getAttributeData(event, "SUMMARY").split("\\,").last();
			});
	}


		
	// First, make the data great again
	fixData();
	pinEventData();
	
	// Then, flush it away.
	giveTextFormat();
	
	return events;
}
