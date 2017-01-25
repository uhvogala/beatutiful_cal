
function toISODate(date){
	if (typeof date != 'undefined'){
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
	return null;
}


function orderData(events){
	
	function doToAllEvents(func){
		for (i in events.all){
			var event = events.all[i];
			if (typeof event.data != 'undefined'){
				func(event);				
			}
		}
	}
	
	// -------------- Data Ordering Code Here -----------------
	
	var extractTime = function(){
		doToAllEvents(function(event){
			//console.log(event.data["DTSTART"]);
			event.dstart = toISODate(event.data["DTSTART"]);
			event.dend = toISODate(event.data["DTEND"]);
			//console.log(event.dstart);
			//console.log(event.dend);
			
		});
	}();
	
	
	// --------------------------------------------------------
	
	
	
	return events
}