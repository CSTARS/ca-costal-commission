var sys = require('sys');
var MongoClient = require('mongodb').MongoClient, db;
var parse = require('./parseCsvs');
var ObjectId = require('mongodb').ObjectID;

exports.importData = function(database, callback) {
	console.log("at import data");
	
	db = database;
    console.log("We are connected to Mongo, all systems go.");
    
    console.log("Parsing csv files");
    parse.getData(function(data) {
    	onDataLoad(data, callback);
    });
}

var onDataLoad = function(data, callback) {
	
	var collection = db.collection('orgs', function(err, collection) { 
		if( err ) return callback(err);
		
		
		var count = data.length;
		for( var i = 0; i < data.length; i++ ) {
			updateRecord(collection, data[i], function(){
				count--;
				if( count == 0 ) {
					console.log("Done.  Mongo is set to go :)");
					callback(null);
				}
			})
		}

	});
}


function updateRecord(collection, record, callback) {
	if( !record.organization ) {
		console.log("ignoring record w/o organization name");
		return callback();
	}
	
	console.log({organization: record.organization});
	collection.find({organization: record.organization}).toArray(function(err, items) {
		if( err ) {
			console.log("Error finding record");
			return callback();
		}
		
		if( items.length == 0 ) { // insert
			collection.insert(record, {w :1}, function(err, result) {
				if( err ) console.log(err);
				else console.log("Inserted: "+record.organization);
				callback();
			});

			
		} else { // update
			
			collection.update( {_id: ObjectId(items[0]._id+"")}, record, function(err, result){
				if( err ) res.send({error:true,message:err});
				else console.log("Updated: "+record.organization);
				callback();
			});
			
		}
	});
}

