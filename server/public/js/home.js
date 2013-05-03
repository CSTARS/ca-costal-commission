
CCC.home = (function(){
	
	function init() {
		
		$("#org-by-office-county").append(_createLists(CCC.data.counties, 'contactInfo.county'));
		
		$("#org-by-active-county").append(_createLists(CCC.data.counties, 'counties'));
		
		$("#org-by-topic").append(_createLists(CCC.data.topics, 'topics'));
		
		$("#org-by-edu_type").append(_createLists(CCC.data.eduResources, 'eduResources'));
		
		$("#org-by-target").append(_createLists(CCC.data.audiences, 'audiences'));
	}
	
	function _createLists(data, f) {
		data.sort();
		var lists = [$("<ul />"), $("<ul />"), $("<ul />")];
		
		var mod = data.length % 3;
		
		var numPerList = Math.floor(data.length / 3)+1;
		var c = 0, j = 0;
		for( var i = 0; i < data.length; i++ ) {
			
			var filter = [{}];
			filter[0][f] = data[i];
			
			lists[c].append("<li><a href='/#search//"+encodeURIComponent(JSON.stringify(filter))+"/0/6'>"+data[i]+"</a></li>");
			
			j++
			if( j == numPerList || (c >= mod && (j == numPerList-1)) ) {
				c++;
				if( c == 4 ) c = 3;
				j = 0;
			}
		}
		
		var root = $("<div class='row-fluid'></div>");
		root.append($("<div class='span4'></div>").append(lists[0]));
		root.append($("<div class='span4'></div>").append(lists[1]));
		root.append($("<div class='span4'></div>").append(lists[2]));
		//root.append($("<div class='span3'></div>").append(lists[3]));
		
		return root;
	}
	
	return {
		init : init
	}
	
})();



