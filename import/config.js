
exports.db = {
	url             : "mongodb://localhost:27017/ccc",
	mainCollection  : "orgs",
	cacheCollection : "orgs_cache",
	indexedFilters  : ["topics", "activities","geo_focus","org_type","edu_resources"],
	sortBy          : "Organization"
}
