
function getAttributeData(event, attr){
	var data = event.data[attr];
	if (typeof data != 'undefined'){
		return data;
	}
	return "n/a";
}

if (!Array.prototype.last){
	/*
	 * Handy method to return the last item of 
	 * an array.
	 */
    Array.prototype.last = function(ind){
    	if (typeof ind == 'undefined'){
    		ind = 0;
    	}
        return this[this.length + ind - 1];
    };
};

function toISODate(date){
	/*
	 * Converts ical formatted date time data
	 * to ISO format for date comparison.
	 */
	
	if (typeof date != 'undefined' && date.length == 16){
		var dlist = [];
		
		var day = date.split("T")[0];
		day = day.slice(0,4)+"-"+day.slice(4,6)+"-"+day.slice(6,8);
		dlist.push(day+"T");
		
		var time = date.split("T")[1];
		time = time.slice(0,2)+":"+time.slice(2,4)+":"+time.slice(4,6);
		dlist.push(time+"Z");
		
		var isodate = new Date(dlist.join(""));
		return isodate;		
	}
	return "n/a";
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
	this.courseCode = '';
	this.courseName = '';
	this.type = 0;
	
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
	
	// Tags for selecting group of events
	this.tags = [];
	
	//Examples:
	//this.dstart = someday;
	//this.dend = someday;
}

Events.prototype.doToAllEvents = function(func){
	// Convenience function for looping
	for (i in this.all){
		var event = this.all[i];
		if (typeof event.data != 'undefined'){
			func(event);				
		}
	}
}

Events.prototype.eventsByCourse = function(course){
	/*
	 * Get events that have the course code given as a parameter.
	 */
	var eventList = [];
	this.doToAllEvents(function(event){
		if (event.courseCode == course){
			eventList.push(event);
		}
	});
	return eventList;
}

Events.prototype.eventsByType = function(type){
	/*
	 * Get events that match part of the type given as a parameter.
	 */
	var eventList = [];
	this.doToAllEvents(function(event){
		var etype = event.type.toLowerCase();
		type = type.toLowerCase();
		if (etype.indexOf(type) != -1){
			eventList.push(event);
		}
	});
	return eventList;	
}

Events.prototype.getAllTypes = function(){
	/*
	 * Return all types inside the instance.
	 */
	var typeList = [];
	this.doToAllEvents(function(event){
		var type = event.type;
		if (typeList.indexOf(type) == -1){
			if (cname != 'n/a' && typeof cname != 'undefined'){
				courseList.push(type);
			}
		}
	});
	return typeList;
	
}

Events.prototype.eventsByTypeNot = function(type){
	/*
	 * Get events that match part of the type given as a parameter.
	 */
	var eventList = [];
	this.doToAllEvents(function(event){
		var etype = event.type.toLowerCase();
		type = type.toLowerCase();
		if (etype.indexOf(type) == -1){
			eventList.push(event);
		}
	});
	return eventList;	
}

Events.prototype.getAllCourseCodes = function(){
	/*
	 * Get list of courses inside the class.
	 */
	var courseList = [];
	this.doToAllEvents(function(event){
		var cname = event.courseCode;
		if (courseList.indexOf(cname) == -1){
			if (cname != 'n/a' && typeof cname != 'undefined'){
				courseList.push(cname);
			}
		}
	});
	return courseList;
}

Events.prototype.getAllCourseNames = function(){
	/*
	 * Get list of course names inside the instance.
	 */
	var courseList = [];
	this.doToAllEvents(function(event){
		var cname = event.courseName;
		if (courseList.indexOf(cname) == -1){
			if (cname != 'n/a' && typeof cname != 'undefined'){
				courseList.push(cname);
			}
		}
	});
	return courseList;
}



Events.prototype.listOtherThan = function(x){
	/*
	 * Get all events not including any of the courseCodes
	 * given in a list.
	 */
	function notThis(event){
		return x.indexOf(event.courseCode) == -1;
	}
	
	return this.all.filter(notThis);
}

