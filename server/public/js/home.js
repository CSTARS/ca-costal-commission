
CCC.home = (function(){
	
	function init() {
		
		$("#org-by-office-county").append(_createLists(CCC.data.counties, 'Counties'));
		
		$("#org-by-active-county").append(_createLists(CCC.data.counties, 'Counties'));
		
		$("#org-by-topic").append(_createLists(CCC.data.topics, 'topics'));
		
		$("#org-by-edu_type").append(_createLists(CCC.data.edu_types, 'edu_resources'));
		
		$("#org-by-target").append(_createLists(CCC.data.target, 'target_audiences'));
	}
	
	function _createLists(data, f) {
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

CCC.data = {};
CCC.data.counties = ["Alameda", "Alpine", "Amador", "Butte", "Calaveras", "Colusa", "Contra Costa",
                     "Del Norte", "El Dorado", "Fresno", "Glenn", "Humboldt", "Imperial", "Inyo",
                     "Kern", "Kings", "Lake", "Lassen", "Los Angeles", "Madera", "Marin", "Mariposa",
                     "Mendocino", "Merced", "Modoc", "Mono", "Monterey", "Napa", "Nevada", "Orange",
                     "Placer", "Plumas", "Riverside", "Sacramento", "San Benito", "San Bernardino",
                     "San Diego", "San Francisco", "San Joaquin", "San Luis Obispo", "San Mateo",
                     "Santa Barbara", "Santa Clara", "Santa Cruz", "Shasta", "Sierra", "Siskiyou",
                     "Solano", "Sonoma", "Stanislaus", "Sutter", "Tehama", "Trinity", "Tulare",
                     "Tuolumne", "Ventura", "Yolo", "Yuba"];

CCC.data.topics = ["Habitat Restoration", "Invasive Species", "Islands", "Kelp Forest", 
                   "Marine/Estuary Reserves & Sanctuaries", "Ocean Literacy", "Open Ocean/Oceanography", 
                   "Rocky Intertidal", "Sand Dune Habitats", "Water Quality/Storm Water Runoff", 
                   "Watersheds/Hydrology", "Wetlands", "Wildlife"];

CCC.data.edu_types = ["Activity/Learning Kit", "Brochures", "Curriculum", "Exhibits/Displays", 
                      "Field Trips", "Guidebooks", "Guided Walks", "Library/Lending Materials", "Maps", 
                      "Multimedia", "Nature Trails", "Newsletter", "Posters", 
                      "Program(s) at our Location", "Program(s) at Schools", "Publications", 
                      "Speaker and/or Lecture Series"];

CCC.data.target = ["Grades preK-3", "Grades 4-6", "Grades 7-9", "Grades 10-12", "Adults", "Teachers", 
                   "Informal Educators", "Policy Makers", "General Public"];

CCC.labels = {};
CCC.labels.filters = {
	"topics"        : "Topics",
	"activities"    : "Activities",
	"geo_focus"     : "Geographical Focus",
	"org_type"      : "Type of Organization",
	"edu_resources" : "Educational Resources",
	"Counties"      : "County(ies) Active in"
};

