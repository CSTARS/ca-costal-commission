/**
 * The Mongo Query Engine (MQE)
 */

var DEBUG  = true;

var MongoClient = require('mongodb').MongoClient, db, collection, cache;
var ObjectId = require('mongodb').ObjectID;
var config = require('./config');


MongoClient.connect(config.db.url, function(err, database) {
	if( err ) return console.log(err);
	db = database;
	if( DEBUG ) console.log("Connected to db: "+config.db.url);
	  
	db.collection(config.db.mainCollection, function(err, coll) { 
		if( err ) return console.log(err);
		if( DEBUG ) console.log("Connected to collection: "+config.db.mainCollection);
		collection = coll;
	});
	db.collection(config.db.cacheCollection, function(err, cash) { 
		if( err ) return console.log(err);
		if( DEBUG ) console.log("Connected to cache collection: "+config.db.cacheCollection);
		cache = cash;
	});
});


exports.getResults = function(query, callback) {
	if( !db || !collection ) callback({message:"no database connection"});
	if( DEBUG ) console.log("===NEW REQUEST===");
	
	checkCache(query, function(err, result) {
		// if cache err, let console know, but continue on
		if( err ) console.log(err);
		
		// if cache hit, return
		if( result ) {
			callback(null, result);
			return;
		}
		
		if( query.text.length > 0 ) {
			textQuery(query, callback);
		} else {
			filterQuery(query, callback);
		}
	});

}

// check the cached collection for the query, if exsits return
// otherwise send null
function checkCache(query, callback) {
	if( DEBUG ) console.log("Checking cache");

	cache.find({ 'query.text': query.text, 'query.filters': query.filters }).toArray(function(err, items) {
		if( err ) return callback(err);
		
		// get cached items
		if( items.length > 0 ) {
			if( DEBUG ) console.log("Cache Hit");
			var cacheResult = items[0];
			
			// get id's for the range we care about
			var cacheItems = setLimits(query, cacheResult.items);
			cacheResult.start = query.start;
			cacheResult.end = query.end;
			
			if( cacheItems.length > 0 ) {
				
				var options = { $or : [] };
				for( var i = 0; i < cacheItems.length; i++ ) {
					options.$or.push({_id: cacheItems[i] });
				}
				
				
				collection.find(options).toArray(function(err, items) {
					if( err ) return callback(err);
				
					cacheResult.items = items;
					callback(null, cacheResult);
				});
				return;
			}
			
			// it's empty ... hummmm
			sendEmptyResultSet(query, callback);
			return;
		}
		if( DEBUG ) console.log("Cache miss");
		
		// cache miss
		callback(null, null);
	});
}

// performs a text and filter (optional) query
function textQuery(query, callback) {
	if( DEBUG ) console.log("Running text query: ");
	
	var command = {
		text: config.db.mainCollection,  
		search : query.text,
		limit  : 100000
	};
	
	if( query.filters.length > 0 ) command.filter = { $and : query.filters }
	
	if( DEBUG ) console.log(command);
	
	db.executeDbCommand(command, function(err, resp) {
		if( err ) return callback(err);
		
		// make sure we got something back from the mongo
		if( resp.documents.length == 0 || !resp.documents[0].results || resp.documents[0].results.length == 0 ) {
			return sendEmptyResultSet(query, callback);
		}
		
		var items = [];
		for( var i = 0; i < resp.documents[0].results.length; i++ ) {
			items.push(resp.documents[0].results[i].obj);
		}
		
		handleItemsQuery(query, items, callback);
	});
}

// performs just a filter query
function filterQuery(query, callback) {	
	if( DEBUG ) console.log("Running filters only query: ");
	
	var options = {}
	if( query.filters.length > 0 ) options["$and"] = query.filters;
	
	if( DEBUG ) console.log(options);

	collection.find(options).toArray(function(err, items) {
		if( err ) return callback(err);
		
		handleItemsQuery(query, items, callback);
	});
}

function handleItemsQuery(query, items, callback) {
	if( DEBUG ) console.log("Handling response");
	
	var response = {
		total   : 0,
		start   : query.start,
		end     : query.end,
		items   : [],
		filters : {}
	}
	
	// make sure we got something back from the mongo
	if( items.length == 0 ) {
		return sendEmptyResultSet(query, callback);
	}
	
	// sort items
	items.sort(function(a,b) {
		if( a[config.db.sortBy] < b[config.db.sortBy] ) return -1;
		if( a[config.db.sortBy] > b[config.db.sortBy] ) return 1;
		return 0;
	});
	
	
	response.total = items.length;
	

	response.filters = getFilters(items);
	response.query = query;
	response.items = items;
	setCache(response);
	
	response.items = setLimits(query, items);
	
	// I know this seems backwards, but we always want to cache the filters
	// so we run that and then remove if filters were not requested
	if( !query.includeFilters ) {
		delete response.filters;
	}
	
	callback(null, response);
}

function setCache(response) {
	if( DEBUG ) console.log("Setting cache");
	
	var cacheItem = {
		query : {
			filters : response.query.filters,
			text    : response.query.text
		},
		items   : [],
		filters : response.filters,
		total   : response.total
	};
	
	for( var i = 0; i < response.items.length; i++ ) {
		cacheItem.items.push(response.items[i]._id);
	}
	
	cache.insert(cacheItem, {w:1}, function(err, result){
		if( err ) return console.log(err);
	});
}

// find all filters for query
function getFilters(items) {
	if( DEBUG ) console.log("Aggergating results for filter counts");
	
	var filters = {}, item, value;
	
	// get the attributes we care about from the config file
	for( var i = 0; i < config.db.indexedFilters.length; i++ ) {
		filters[config.db.indexedFilters[i]] = {};
	}
	
	// loop over all result items
	for( var i = 0; i < items.length; i++ ) {
		item = items[i];
		
		// for each result item, check for filters we care about
		for( var filter in filters ) {
			
			// does this item have the filter and is it an array
			if( item[filter] && (item[filter] instanceof Array)  ) {
				
				// loop through the filters array and increment the filters count
				for( var j = 0; j < item[filter].length; j++ ) {
					value = item[filter][j];
					if( filters[filter][value] ) filters[filter][value]++;
					else filters[filter][value] = 1;
				}
				
			}
			
		}
		
	}
	
	// now turn into array and sort by count
	var array;
	for( var filter in filters ) {
		array = [];
		
		// create
		for( var key in filters[filter] ) {
			array.push({filter: key, count: filters[filter][key]});
		}
		
		// sort
		array.sort(function(a,b) {
			return b.count - a.count;
		});
		
		filters[filter] = array;
	}
	
	return filters;
}

// limit the result set to the start / end attr in the query
function setLimits(query, items) {
	if( DEBUG ) console.log("Setting query limits (start/stop)");
	
	if( query.start > items.length ) return [];
	
	var results = [];
	for( var i = query.start; i < query.end; i++ ) {
		results.push(items[i]);
		
		// we reached the end
		if( i-1 == items.length ) break;
	}
	
	return results;
}

// send back and empty result set
function sendEmptyResultSet(query, callback) {
	if( DEBUG ) console.log("Sending default empty result set");
	callback(
		null,
		{
			total   : 0,
			start   : query.start,
			end     : query.end,
			items   : [],
			filters : {}
		}
	);
}