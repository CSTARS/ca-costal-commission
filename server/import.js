var sys = require('sys');
var MongoClient = require('mongodb').MongoClient, db;
var parse = require('./parseCsvs');


exports.importData = function(callback) {
	console.log("at import data");
	
	MongoClient.connect("mongodb://localhost:27017/ccc", function(err, database) {
		  if(!err) {
			db = database;
		    console.log("We are connected to Mongo, all systems go.");
		    
		    console.log("Parsing csv files");
		    parse.getData(function(data) {
		    	onDataLoad(data, callback);
		    });
		    
		  } else {
			  callback(err);
		  }
	});
}

var onDataLoad = function(data, callback) {
	
	var collection = db.collection('orgs', function(err, collection) { 
		if( err ) return callback(err);
		
		collection.remove(function(err){
			if( err ) {
				return callback(err);
			}
			
			collection.insert(data, {w :1}, function(err, result) {
				if( err ) return callback(err);
				callback(null);
				console.log("Done.  Mongo is set to go :)");
			});
		});
		
		
		
	});
}

