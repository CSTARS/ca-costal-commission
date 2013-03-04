var express = require('express');
var app = express();
var queryEngine = require('./mqe');

// get the results of a query
app.get('/rest/query', function(req, res){
	var query = queryParser(req);
	
	queryEngine.getResults(query, function(err, results){
		if( err ) return res.send(err);
		res.send(results);
	});
});

function queryParser(req) {
	// set default parameters
	var query = {
		text           : "",
		filters        : [],
		start          : 0,
		end     	   : 10,
		includeFilters : false
	}
	
	for( var i in query ) {
		if( req.query[i] ) query[i] = req.query[i];
	}
	
	if( query.start < 0 ) query.start = 0;
	if( query.end < query.start ) query.end = query.start;
	
	// parse out json from filter
	try {
		query.filters = JSON.parse(query.filters);
	} catch (e) {
		// TODO: how do we want to handle this
		query.filters = [];
		console.log(e);
	}

	if( !(query.filters instanceof Array) ) {
		query.filters = [ query.filters ];
	}
	
	return query;
}

app.listen(3000);