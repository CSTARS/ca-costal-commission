CCC.widgets = {};

CCC.app = (function() {
	
	var DEFAULT_PAGE = "home";
	var validPages = [DEFAULT_PAGE, "search", "result", "all", "edit"];
	
	var cPage = "";
	
	$(window).ready(function(){
		// mqe.js handles the hash parsing and fires this event
		$(window).bind("page-update-event", function(e, hash){
			_updatePage(hash[0]);
			_updatePageContent(hash);
		});
	});
	
	function _updatePage(page) {
		// track all hash updates
		ga('send', 'pageview', window.location.pathname+window.location.hash);
		
		if( page == cPage ) return;
		
		$('html, body').scrollTop(0);
		
		if( validPages.indexOf(page) == -1 ) page = DEFAULT_PAGE;
		
		$("#"+cPage).hide();
		$("#"+page).show();
		
		cPage = page;
	}
	
	function _updatePageContent(hash) {
		if ( cPage == "all" ) {
			CCC.all.init(CCC.host);
		} else if ( cPage == "edit" ) {
			CCC.edit.init(CCC.host);
		}
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

CCC.data.topics = ["Aquaculture", "Bay & Estuary Habitats", "Beaches", "Boating", "Climate Change", 
	                 "Coastal Access", "Coastal Processes", "Cultural History", "Endangered Species", 
	                 "Energy", "Environmental Justice", "Fisheries", "Habitat Restoration", 
	                 "Invasive Species", "Islands", "Kelp Forest", "Marine Debris", 
	                 "Marine/Estuary Reserves & Sanctuaries", "Ocean Literacy", "Open Ocean", 
	                 "Rocky Intertidal", "Sand Dune Habitats", "Water Quality/Storm Water Runoff", 
	                 "Watersheds/Hydrology", "Wetlands", "Wildlife"];

CCC.data.eduResources = ["Activity/Learning Kit", "Brochures", "Curriculum", "Exhibits/Displays", 
	                   "Field Trips", "Guidebooks", "Guided Walks", "Library/Lending Materials", 
	                   "Maps", "Multimedia", "Nature Trails", "Newsletter", "Posters", 
	                   "Program(s) at our Location", "Program(s) at Schools", "Publications", 
	                   "Speaker and/or Lecture Series"];

CCC.data.audiences = ["Grades preK-3","Grades 4-6","Grades 7-9","Grades 10-12","Adults","Teachers",
	                   "Informal Educators","Policy Makers","General Public"];

CCC.labels = {};
CCC.labels.filters = {
	"topics"                : "Topics",
	"eduResources"          : "Educational Resources",
	"counties"              : "County - Active In",
	"audiences"             : "Target Audience",
	"contactInfo.county"    : "County - Office Located"
};