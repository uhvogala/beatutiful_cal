

function putInput() {
    var x = document.createElement("INPUT");
    x.setAttribute("type", "file");
    x.setAttribute("accept", ".ics");
    x.setAttribute("onchange", "checkData()");
    x.setAttribute("id", "icalFile");
    $(".upload").prepend(x);
}

function checkData() {
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
	if (typeof file != 'undefined') {
		var reader = new FileReader();
		reader.onload = (function(theFile){
			return function(e) {
		          parseData(e.target.result);
		        };
		})(file);
		reader.readAsText(file);
	}
}

function Line(line) {
	this.value = line;
}
Line.prototype.has = function(subString) {
	var patt = new RegExp(subString);
	if (patt.test(this.value)){
		return true;
	}
	return false;
}
Line.prototype.isNewAttribute = function() {
	if (this.has(/.+:/i)){
		return true;
	}
	return false;
};
Line.prototype.getValues = function(){
	var attr = null;
	var data = null;
	var items = [];
	
	attr = /(.+):/i.exec(this.value);
	if (attr){
		items.push(attr[1]);
	}
	data = /.+:.*?(.+)/.exec(this.value);
	if (data){
		items.push(data[1]);
	}
	if ( ! this.isNewAttribute()) {
		data = /.+/m.exec(this.value);
		if (data){
			items.push(data[0].trim());
		}
	}
	return items;
};


function parseData(text) {
	var lines = text.split("\n");
	var last = "";
	var eventList = [];
	var dataList = [];
	var e = 0;
	var d = 0;
	for (var x = 0; x < lines.length; x++){
		var newLine = new Line(lines[x]);
		if (newLine.isNewAttribute()){
			var values = newLine.getValues();
			newLine.attr = values[0];
			newLine.data = values[1];
		}
		else {
			last.data =  last.data + newLine.getValues()[0];
		}
		if (newLine.isNewAttribute()){
			dataList[d] = last;
			d++;
			last = newLine;			
		}
		if (newLine.has(/begin:/i)){
			eventList[e] = dataList;
			e++;
			dataList = [];
			d = 0;
		}
	}
	sortEvents(eventList);
}

function Event(event){
	var data = [];
	for (var k = 0; k < event.length; k++){
		data[event[k].attr] = event[k].data;
	}
	this.data = data;
}

function Events(){
	this.all = [];
}

function sortEvents(events){
	var eventsClass = new Events();
	for (var i = 0; i < events.length; i++){
		newEvent = new Event(events[i]);
		newEvent.data;
		eventsClass.all.push(newEvent);
	}
	newCalReady(eventsClass);
	
}

$(document).ready(function(){
	putInput();
});
