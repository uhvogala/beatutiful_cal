var courses = [];

function makeVisible(cal){
	
	function mergeCourses(cal){
		/*
		 * Create new Events instances for every course
		 * and sort events by courseCode. Put Events instances
		 * inside the courses array.
		 */
		var courseCodes = cal.getAllCourseCodes();
		
		for (var c in courseCodes){
			var ebc = cal.eventsByCourse(courseCodes[c]);
			if (ebc.length > 0){
				var newcal = new Events();
				newcal.all.push.apply(newcal.all, ebc);
				newcal.tags.push(courseCodes[c]);
				newcal.tags.push(newcal.getAllCourseNames()[0]);
				courses.push(newcal);
			}
		}
	}
	
	mergeCourses(cal);
	
	function makeCourseBoxes(){
		
		console.log(courses);
		for (var c = 0; c < courses.length; c++){
			console.log(c);
			formBox(courses[c].tags[0],
					courses[c].tags[1],
					courses[c].eventsByTypeNot("luento").length,
					courses[c].eventsByType("luento").length);
		}
	}
	
	function formBox(code, name, exnum, lecnum){
		var coursebox = document.createElement("DIV");
		coursebox.className = "coursebox";
		var cname = document.createElement("P");
		cname.className = "cname";
		var ccode = document.createElement("P");
		ccode.className = "ccode";
		
		cname.innerText = name;
		ccode.innerText = code;
		var types = ["Lectures", "Other"];
		var nums = [lecnum, exnum];
		
		$(coursebox).append(cname);
		$(coursebox).append(ccode);
		for (var i = 0; i < 2; i++){
			var ebox = document.createElement("DIV");
			ebox.className = "ebox";
			var numof = document.createElement("DIV");
			numof.className = "numof";
			numof.innerText = nums[i];
			var type = document.createElement("P");
			type.className = "events";
			type.innerText = types[i];
			$(ebox).append(numof);
			$(ebox).append(type);
			$(coursebox).append(ebox);
		}
		$(".f-area").append(coursebox);
		
	}
	
	makeCourseBoxes();
	
}