
if (!Array.prototype.last){
    Array.prototype.last = function(ind){
    	if (typeof ind == 'undefined'){
    		ind = 0;
    	}
        return this[this.length + ind - 1];
    };
};

function newCalReady(events){
	console.log(events);
	$(".content").empty();
	
	function fixData(){
		for (var i = 0; i < events.all.length; i++){
			var data = events.all[i].data;
			var text = data["SUMMARY"];
			if (typeof text != 'undefined'){
				var textarr = text.split("\\,");
				var newsumm = [];
				var coursename = textarr.last(-1).split("/").last();
				var coursename = coursename.split(/ - (.+)/)[1];
				newsumm.push(coursename);
				newsumm.push(textarr[0].split("/")[0]);
				data["SUMMARY"] = newsumm.join("\\,");
				if (textarr.length > 2){
					var loc = [];
					if (typeof textarr[1] != 'undefined'){
						loc.push(textarr[1].split("/")[0]);
						if (typeof textarr[2] != 'undefined'){
							loc.push(textarr[2].split("/")[0]);						
						}
					}
					data["LOCATION"] = loc.join("\\,");					
				}
			}
			var categ = data["CATEGORIES"];
			if (typeof categ != 'undefined'){
				data["CATEGORIES"] = categ.split("_")[0];				
			}
		}
	}
	
	function appendRow(key, value){
		if (typeof key != 'undefined' && typeof value != 'undefined'){
			$(".content").append(key+":" + value+"\n");			
		}
	}
	
	function giveTextFormat(){
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
		  var textToWrite = document.getElementById('textArea').value;
		  console.log(textToWrite);
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

	var button = document.getElementById('save');
	button.addEventListener('click', saveTextAsFile);

	function destroyClickedElement(event) {
	  // remove the link from the DOM
	  document.body.removeChild(event.target);
	}
	
	fixData();
	giveTextFormat();
}