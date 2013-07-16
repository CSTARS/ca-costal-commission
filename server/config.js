var tokenConfig = require("/etc/mqe/tokens.js");
exports.debug = true;

exports.db = {
	// connection string for the database, includes database name
	url             : "mongodb://localhost:27017/ccc",
	
	// collection where the queryable items are stored
	mainCollection  : "orgs",
	
	// collection that is used as a cache.  YOU SHOULD NOT TOUCH THIS
	// MQE has rights to delete at any time
	cacheCollection : "orgs_cache",
	
	// collection that is used to store edits to a record.
	editCollection : 'org_edits',
	
	// Filters your site uses, these will be returned in the results
	// MQE will also use this list to make sure indexes are built on these items
	indexedFilters  : ["contactInfo.county", "counties_active_in","topics","eduResources", "audiences"],
	
	// currently MQE only allows one sort option, place the attribute you wish to sort on here
	sortBy          : "organization",
	
	// currently Mongo only allows the creation of text search on one attribute.  MQE will
	// combine all filters listed below into a single attribute that will be used for
	// the text search index
	textIndexes     : ["orgType", "geoFocus", "activities", "topics", "eduResources", "audiences", 
	                   "altLanguageMaterials", "training", "facilities", "transportation",  
	                   "dateEntered", "disabledAccess", "eduDescription", "feesDescription", 
	                   "organization", "mission",  "activityComments", "marineComments", 
	                   "describeLecture", "eduOther", "eduDescription", "groupSize", 
	                   "languages", "altLanguageResources", "trainingDescription",  
	                   "fees", "feesDescription",  "parkingAvailability", "parking", 
	                   "publicTransitAccess", "publicTransit", "disabledAccess", "disabledAccess", 
	                   "Notes"],
	                 
	// attributes that are stored but will never be returned to a default search/get request
	blacklist       : ["submitterName", "submitterEmail", "submitterPhone"],
	
	// local script to be fired when update is called via admin api call
	importScript    : "/Users/jrmerz/dev/ceres/ca-costal-commission/server/import.js",
	
	// should updates be allowed to fire
	allowUpdates    : false
		
}

//auth server information
exports.auth = {
		script            : "/Users/jrmerz/dev/ceres/ceres-auth-node/auth",
		token             : tokenConfig.token,
		centralAuthServer : "http://localhost:4000",
		appName           : "CCCDev",
		twitter           : tokenConfig.twitter,
		facebook          : tokenConfig.facebook,
		
		// these pages will require login and admin role
		adminPages        : ["admin.html"],
		
		// page to redirect to after login
		loginRedirectPage : "admin.html",
		
		// do accounts require approval?
		requireApproval   : false
}

exports.server = {
	// local config
	host : "localhost",
	
	// port outside world goes to.  most likely 80
	remoteport : 80,
	
	// local port on machine
	localport : 3000,
	
	// remote hosts that are allowed to access this sites mqe
	allowedDomains : ["testnode.com","localhost","192.168.1.113"],
	
	// server script
	script : "/Users/jrmerz/dev/ceres/ca-costal-commission/server/server.js"
}

exports.email = {
	host      : "mx4.ceres.ca.gov",
	port      : 25,
	from      : "do-not-reply@ceres.ca.gov",
	to        : ["jrmerz@gmail.com"]
}

exports.schema = {
 	   orgType  : ["Government", "Non-profit", "School/University", "Citizen Group", "__Other__" ],
	   geoFocus   : ["Local", "Regional", "State", "National", "International"],
	   topics     : ["Aquaculture", "Bay & Estuary Habitats", "Beaches", "Boating", "Climate Change", 
	                 "Coastal Access", "Coastal Processes", "Cultural History", "Endangered Species", 
	                 "Energy", "Environmental Justice", "Fisheries", "Habitat Restoration", 
	                 "Invasive Species", "Islands", "Kelp Forest", "Marine Debris", 
	                 "Marine/Estuary Reserves & Sanctuaries", "Ocean Literacy", "Open Ocean", 
	                 "Rocky Intertidal", "Sand Dune Habitats", "Water Quality/Storm Water Runoff", 
	                 "Watersheds/Hydrology", "Wetlands", "Wildlife","__Other__"],
	   activities : ["Advocacy", "Conservation", "Education", "Enforcement", "Policy", "Recreation", 
	                 "Recycling", "Regulation", "Research", "Resource Management", "Restoration", 
	                 "Shoreline Cleanups", "Tourism", "Water Monitoring", "Water Pollution Prevention",
	                 "__Other__"],
	   eduResources : ["Activity/Learning Kit", "Brochures", "Curriculum", "Exhibits/Displays", 
	                   "Field Trips", "Guidebooks", "Guided Walks", "Library/Lending Materials", 
	                   "Maps", "Multimedia", "Nature Trails", "Newsletter", "Posters", 
	                   "Program(s) at our Location", "Program(s) at Schools", "Publications", 
	                   "Speaker and/or Lecture Series","__Other__"],
	   audiences    : ["Grades preK-3","Grades 4-6","Grades 7-9","Grades 10-12","Adults","Teachers",
	                   "Informal Educators","Policy Makers","General Public","__Other__"],
	   groupSize    : ["Up to 30", "Up to 60", "Up to 100","No limit"],
	   altLanguageMaterials : ["Written material", "Oral presentations", "Multimedia resources"],
	   training     : ["Teachers","Volunteers","Naturalist","General Public","Policy Makers"],
	   facilities   : ["Restrooms","Picnic Area","Bookstore/Gift Shop"]
}

// dform options
exports.editForm = {
   html : [
        {
            type : "h3",
            html : "Creeks to Coast Directory"
        },
        {
            type : "div",
            html : "Thank you for being a part of the Creeks to Coast Directory. The purpose of this " +
            		"page is to update and correct existing entries in the directory. This is primarily " +
            		"for use by representatives of the organization, however if you are a member of the " +
            		"public and find an error, please submit your edit for review.<br /><br />" +
            		"Organizations are listed for information purposes only and their listing does " +
            		"not indicate Coastal Commission support of the policies or programs of the organizations."
        },
        {
        	type : "div",
        	html : "<div style='color:red;margin-bottom:25px'>* required</div>"
        },
        {
        	type : "div",
        	html : "<div style='margin:25px 0' id='last-modified-date'></div>"
        },
        {
            caption  : "This organization is not for profit.",
            help     : "You must be in agreement with this statement to be added to this directory.",
            type     : "checkbox",
            required : true,
            id       : "isOrgForProfit"
        },
        {
            caption  : "This organization addresses marine, coastal, watershed, and/or water issues within California.",
            help     : "You must be in agreement with this statement to be added to this directory.",
            type     : "checkbox",
            required : true,
            id       : "isInCa"
        },
        {
            caption  : "The mission and activities of this organization are not in conflict with the mission of the " +
            		   "California Coastal Commission. See <a href='http://www.coastal.ca.gov/whoweare.html' target='_blank'>http://www.coastal.ca.gov/whoweare.html</a>.",
            help     : "You must be in agreement with this statement to be added to this directory.",
            type     : "checkbox",
            required : true,
            id       : "noConflict"
        },
        {
            caption  : "Name of person submitting this form:",
            type     : "text",
            required : true,
            id       : "submitterName"
        },
        {
            caption  : "Submitter's phone number:",
            type     : "tel",
            id       : "submitterPhone"
        },
        {
            caption : "Submitter's email:",
            type    : "email",
            id      : "submitterEmail",
            required : true
        },
        {
            caption : "Organization name:",
            type    : "text",
            id      : "organization",
            required : true
        },
        {
        	type    : "subform",
        	id      : "contactInfo",
        	caption : "Organization Contact Information",
        	form    : [
				{
				    caption : "Organization Address:",
				    type    : "address",
				    id      : "address"
				},
				{
		            caption : "Organization website:",
		            type    : "url",
		            id      : "website"
		        },
		        {
				    caption  : "Contact Name",
				    type     : "text",
				    id       : "name"
				},
				{
				    caption  : "Phone Number:",
				    type     : "tel",
				    id       : "phone"
				},
				{
				    caption  : "Alternative Phone Number:",
				    type     : "tel",
				    id       : "altPhone"
				},
				{
				    caption  : "Fax Number:",
				    type     : "tel",
				    id       : "fax"
				},
				{
				    caption : "Email:",
				    type    : "email",
				    id      : "email"
				},
				{
                    caption  : "Office is located in the following California county:",
                    help     : "View a map of California counties at <a href='http://quickfacts.census.gov/qfd/maps/california_map.html' target='_blank'>http://quickfacts.census.gov/qfd/maps/california_map.html</a>",
                    type     : "text",
                    id       : "county",
                    required : true
                }
        	]
        },
        {
            caption : "Organization's mission statement or purpose:",
            type    : "textarea",
            id      : "mission"
        },
        {
        	caption  : "Type of organization:",
        	required : true,
            type     : "checkboxes",
            options  : "schema",
            id       : "orgType"
        },
        {
        	caption  : "Geographical focus of organization:",
        	required : true,
            type     : "checkboxes",
            options  : "schema",
            id       : "geoFocus",
            name     : "geoFocus"
        },
        {
            caption  : "County(ies) in which organization is active:",
            help     : "View a map of California counties at <a href='http://quickfacts.census.gov/qfd/maps/california_map.html' target='_blank'>http://quickfacts.census.gov/qfd/maps/california_map.html</a>",
            required : true,
            type     : "textarea",
            id       : "counties"
        },
        {
        	caption  : "Topic(s) addressed by organization:",
        	required : true,
            type     : "checkboxes",
            options  : "schema",
            id       : "topics"
        },
        {
        	caption  : "Activities of the organization:",
        	required : true,
            type     : "checkboxes",
            options  : "schema",
            id       : "activities"
        },
        {
        	caption  : "Educational resources provided by organization:",
            type     : "checkboxes",
            options  : "schema",
            id       : "eduResources"
        },
        {
            caption : "List title(s) and brief narrative descriptions of education programs and materials you offer (or refer to the appropriate page on your website):",
            type    : "textarea",
            id      : "eduDescription"
        },
        {
            caption : "Speaker/Lecture series description:",
            type    : "textarea",
            id      : "describeLecture"
        },
        {
        	caption  : "Target audience:",
            type     : "checkboxes",
            options  : "schema",
            id       : "audiences"
        },
        {
        	caption  : "Group size that can be accommodated:",
            type     : "radiobuttons",
            options  : "schema",
            id       : "groupSize",
            name     : "groupSize"
        },
        {
        	caption  : "Programs or materials for speakers of languages other than English:",
            type     : "checkboxes",
            options  : "schema",
            id       : "altLanguageMaterials"
        },
        {
            caption : "Language(s) available:",
            type    : "text",
            id      : "languages"
        },
        {
        	caption : "Description of non-English resource(s):",
            type    : "textarea",
            id      : "altLanguageResources"
        },
        {
        	caption  : "Organization provides training (education and/or in-services) for:",
            type     : "checkboxes",
            options  : "schema",
            id       : "training"
        },
        {
        	caption : "Description of training program:",
            type    : "textarea",
            id      : "trainingDescription"
        },
        {
        	caption  : "Are there charges/entrance fees associated with any services listed?",
            type     : "radiobuttons",
            options  : {
            	yes : "yes",
            	no  : "no"
            },
        	name     : "fees",
        	id       : "fees"
        },
        {
        	caption : "How much and for whom?",
            type    : "textarea",
            id      : "feesDescription"
        },
        {
        	caption  : "If organization has a facility open to the public, does it have:",
            type     : "checkboxes",
            options  : "schema",
            id       : "facilities"
        },
        {
        	caption : "If organization has a facility open to the public, please describe parking availability:",
            type    : "text",
            id      : "parking"
        },
        {
        	caption : "If organization has a facility open to the public, please describe public transit access:",
            type    : "text",
            id      : "publicTransit"
        },
        {
        	caption : "If organization has a facility open to the public, please describe wheelchair access:",
            type    : "text",
            id      : "disabledAccess"
        },
        {
        	type    : "subform",
        	id      : "volunteers",
        	caption : "Volunteer Opportunites",
        	form    : [
				{
                	caption : "Please provide a detailed description for the volunteer opportunities/programs " +
                	          "including the following details in the spaces below. Or, if you prefer to have the public " +
                	          "check your website for opportunities, indicate web address here.",
                    help    : "Website:",
                	type    : "url",
                	id      : "website"
                },
                {
                	type : "div",
                	"class" : "dform-divider"
                },
        		{
                	caption : "Volunteer Title:",
                    type    : "text",
                    id      : "title"
                },
                {
                	caption : "Description of volunteer activity:",
                    type    : "textarea",
                    id      : "description"
                },
                {
                	caption : "When volunteers are needed during the year:",
                    type    : "text",
                    id      : "timeOfYear"
                },
                {
                	caption : "Volunteer qualifications:",
                    type    : "textarea",
                    id      : "qualifications"
                },
                {
                	caption : "Commitment required (hours and days during the year):",
                    type    : "text",
                    id      : "commitment"
                },
                {
                	caption : "Application and training procedure:",
                    type    : "textarea",
                    id      : "applicationProcedure"
                },
                {
                	caption : "Contact Name:",
                    type    : "text",
                    id      : "contactName"
                },
                {
                	caption : "Contact Phone #:",
                    type    : "tel",
                    id      : "contactPhone"
                },
                {
                	caption : "Contact Email:",
                    type    : "email",
                    id      : "contactEmail"
                },
                {
                	caption  : "Community service documentation provided:",
                    type     : "radiobuttons",
                    options  : {
                    	yes : "Yes",
                    	no  : "No"
                    },
                	name     : "documentation",
                	id       : "documentation"
                }
        	]
        },
        {
        	type    : "subform",
        	id      : "internships",
        	caption : "Internship Opportunities",
        	form    : [
				{
					caption : "If so, please provide a detailed description of your internship " +
					          "opportunity/program, including the following details in the form below. " +
					          "Or, if you prefer to have the public check your website for opportunities, " +
					          "indicate web address here.",
					help    : "Website: ",
				    type    : "url",
				    id      : "website"
				},
				{
                	type : "div",
                	"class" : "dform-divider"
                },
				{
                	caption : "Internship Title:",
                    type    : "text",
                    id      : "title"
                },
                {
                	caption : "Number of internships available:",
                    type    : "text",
                    id      : "numberAvailable"
                },
                {
                	caption : "Description of internship activity:",
                    type    : "textarea",
                    id      : "description"
                },
                {
                	caption : "When interns are needed during the year:",
                    type    : "text",
                    id      : "timeOfYear"
                },
                {
                	caption : "Intern qualifications:",
                    type    : "textarea",
                    id      : "qualifications"
                },
                {
                	caption : "Application procedure:",
                    type    : "textarea",
                    id      : "applicationProcedure"
                },
                {
                	caption  : "Is housing provided?",
                    type     : "radiobuttons",
                    options  : {
                    	yes : "Yes",
                    	no  : "No",
                    	tbd : "To be determined"
                    },
                	name     : "housingProvided",
                	id       : "housingProvided"
                },
                {
                	caption  : "Is this a paid internship?",
                    type     : "radiobuttons",
                    options  : {
                    	yes : "Yes",
                    	no  : "No",
                    	tbd : "To be determined"
                    },
                	name     : "paid",
                	id       : "paid"
                },
                {
                	caption  : "Is a stipend available?",
                    type     : "radiobuttons",
                    options  : {
                    	yes : "Yes",
                    	no  : "No",
                    	tbd : "To be determined"
                    },
                	name     : "stipend",
                	id       : "stipend"
                },
                {
                	caption  : "Is academic credit available?",
                    type     : "radiobuttons",
                    options  : {
                    	yes : "Yes",
                    	no  : "No",
                    	tbd: "To be determined"
                    },
                	name     : "academicCredit",
                	id       : "academicCredit"
                },
                {
                	caption : "Contact Name",
                    type    : "text",
                    id      : "contactName"
                },
                {
                	caption : "Contact Phone #",
                    type    : "tel",
                    id      : "contactPhone"
                },
                {
                	caption : "Contact Email",
                    type    : "email",
                    id      : "contactEmail"
                },
        	]
        },
        {
            "type" : "btn",
            "class" : "btn-primary",
            "value" : "Submit",
            "id"    : "save"
        },
        {
            "type" : "btn",
            "class" : "",
            "value" : "Cancel",
            "id"    : "cancel"
        }
    ]
};
