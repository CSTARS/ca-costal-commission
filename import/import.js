var sys = require('sys');
var MongoClient = require('mongodb').MongoClient, db;
var parse = require('./parseCsvs');

var onDataLoad = function(data) {
	
	var collection = db.collection('orgs', function(err, collection) { 
		if( err ) return console.log(err);
		
		//collection.remove();
		
		collection.insert(data, {w :1}, function(err, result) {
			if( err ) return console.log(err);
			
			console.log("Done.  Mongo is set to go :)");
			process.exit();
		});
		
	});
}

//Connect to the db
MongoClient.connect("mongodb://localhost:27017/ccc", function(err, database) {
  if(!err) {
	db = database;
    console.log("We are connected to Mongo, all systems go.");
    
    console.log("Parsing csv files");
    parse.getData(onDataLoad);
    
  // db.collection('orgs', function(err, collection) { 
//		if( err ) return console.log(err);
		
		
		/*collection.find({ activities : ["Education", "Conservation"], topics : ["Beaches"] }).toArray(function(err, items) {
			if( err ) return console.log(err);
			
			console.log("Education :"+items.length);
		});

		collection.find().toArray(function(err, items) {
			if( err ) return console.log(err);
			
			console.log("All :"+items.length);
		});*/

		
	   	// map reduce
/*	   	var m = function() {
	        emit( 'filters', this);
		}
		var r = function(k, values ) {
			var result = {topics: {}};
			for( var i = 0; i < values.length; i++ ) {
				if( !values[i].topics ) continue;
				for( var j = 0; j < values[i].topics.length; j++ ) {
					var key = values[i].topics[j];
		    		if( result.topics[key] ) result.topics[key]++;
		    		else result.topics[key] = 1;
		    	}
			}
			return result;
		}
		collection.mapReduce(m, r,
				{ 
				out : { inline : 1 },
	        	verbose: true        // include stats
				}
				, function(e, results, stats) {
						console.log(e);
		                console.log(results[0].value);
		                console.log(stats);
		                process.exit(1);            
		});
		
	}); */
   

   
   // search example
   /*	db.executeDbCommand( {text: "orgs",  search : "ocean" }, function(err, resp) {
		if( err ) return console.log(err);
		
		console.log("Text Search :");
		console.log(resp.documents[0].results.length)
	});*/
   	

    

  } else {
	  console.log(err);
  }
});

// happy day db.orgs.find( { $and : [ {"activities":"Research"},{"activities":"Advocacy"},{"topics":"Wetlands"},{"topics":"Watersheds/Hydrology"}] } ).explain();