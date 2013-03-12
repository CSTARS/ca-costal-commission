
exports.debug = true;

exports.db = {
	// connection string for the database, includes database name
	url             : "mongodb://localhost:27017/ccc",
	
	// collection where the queryable items are stored
	mainCollection  : "orgs",
	
	// collection that is used as a cache.  YOU SHOULD NOT TOUCH THIS
	// MQE has rights to delete at any time
	cacheCollection : "orgs_cache",
	
	// Filters yours site uses, these will be returned in the results
	// MQE will also use this list to make sure indexes are built on these items
	indexedFilters  : ["Counties","topics","edu_resources", "target_audiences"],
	
	// currently MQE only allows one sort option, place the attribute you wish to sort on here
	sortBy          : "Organization",
	
	// currently Mongo only allows the creation of text search on one attribute.  MQE will
	// combine all filters listed below into a single attribute that will be used for
	// the text search index
	textIndexes     : ["AudioTapes", "CDRom", "ContactInfo", "Counties", "DateEntered", "DisabledAccessDiscription", 
	                   "EdPrograms", "FeeDescription", "InServiceDescription", "Intern", "InternOpps", "Mission", 
	                   "OrgID", "Organization", "ParkingAvailabilityText", "PublicTransitAccessext", "ServiceFees", 
	                   "Slideshow", "Videos", "Volunteer", "VolunteerOpps", "activities", "alt_language_materials", 
	                   "auFree", "auLoan", "auOnsite", "auPurchase", "cdFree", "cdLoan", "cdOnsite", "cdPurchase", 
	                   "edu_resources", "facilities", "geo_focus", "mmFree", "mmLoan", "mmOnsite", "mmPurchase", 
	                   "org_type", "ssFree", "ssLoan", "ssOnsite", "ssPurchase", "target_audiences", "topics", 
	                   "training", "transportation"],
	
	// local script to be fired when update is called via admin api call
	importScript    : "/Users/jrmerz/dev/ceres/ccc/server/import.js"
		
}

exports.server = {
	host : "localhost",
	
	port : 3000,
	
	script : "/Users/jrmerz/dev/ceres/ca-costal-commission/server/server.js"
}
