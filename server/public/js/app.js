var CCC = {
	widgets : {}	
};

CCC.app = (function() {
	
	var DEFAULT_PAGE = "home";
	var validPages = [DEFAULT_PAGE, "search", "result", "all"];
	
	var cPage = "";
	
	$(document).ready(function() {
		
		// mqe.js handles the hash parsing and fires this event
		$(window).bind("page-update-event", function(e, hash){
			_updatePage(hash[0]);
			_updatePageContent(hash);
		});
		
		CERES.mqe.init(DEFAULT_PAGE);
		CCC.home.init();
		CCC.search.init();
		CCC.result.init();
		
	});
	
	function _updatePage(page) {
		if( page == cPage ) return;
		
		$('body').scrollTop(0);
		
		if( validPages.indexOf(page) == -1 ) page = DEFAULT_PAGE;
		
		$("#"+cPage).hide();
		$("#"+page).show();
		
		cPage = page;
	}
	
	function _updatePageContent(hash) {
		if ( cPage == "all" ) {
			CCC.all.init();
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