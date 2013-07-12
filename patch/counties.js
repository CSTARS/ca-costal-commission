var test = false;

/**
 *
 **/
var csv = require('csv');
var fs = require('fs');
var MongoClient = require('mongodb').MongoClient, db, collection;
var ObjectId = require('mongodb').ObjectID;
var fileData = {};
var fileLocation = "/../data/20130220/";
var finalData = [];

MongoClient.connect("mongodb://localhost:27017/ccc", function(err, database) {
	db = database;
	  
	db.collection("orgs", function(err, coll) { 
		collection = coll;
		parseFiles();
	});
});

function parseFiles() {
	var files = ["TblCounties","TblMain", "officeLocations"];

	var parseCount = 0;
	for( var i = 0; i < files.length; i++ ) {
		parseFile(files[i], function(){
			parseCount++;
			if( parseCount == files.length ) ready();
		});
	}
	
}

function ready() {
	mapRecord(0);
}

function mapRecord(index) {
	var record = {
		orgId : fileData.TblMain[index].OrgID,
		org   : fileData.TblMain[index].Organization,
		counties : [],
		contactCounty : "",
		mongoId  : ""
	}

	for( var i = 0; i < fileData.TblCounties.length; i++ ) {
		if( fileData.TblCounties[i].OrgID == record.orgId &&
		    record.counties.indexOf( fileData.TblCounties[i].County ) == -1 ) {
		    	record.counties.push( fileData.TblCounties[i].County );
		}
	}

	for( var i = 0; i < fileData.officeLocations.length; i++ ) {
		if( fileData.officeLocations[i].Organization == record.org ) {
		    record.contactCounty = fileData.officeLocations[i].County1;
		    if( record.counties.indexOf( fileData.officeLocations[i].County1 ) == -1 ) {
		    	record.counties.push( fileData.officeLocations[i].County1 );
		    }
		}
	}

	collection.find({ organization: record.org}).toArray(function(err, result){
		if( err ) console.log(err);

		if( result.length != 1 ) {
			console.log("Could not match: ");
			console.log(record);
		} else {
			record.mongoId = result[0]._id;
			if( test ) {
				console.log(record);
			} else {
				var item = result[0];
				item.counties = record.counties;
				if( item.contactInfo && item.contactInfo.length > 0 ) {
					item.contactInfo[0].county = record.contactCounty;
				}
				collection.update({_id:ObjectId(item._id+"")},item, function(err, result){
					if( err ) {
						console.log(err);
						console.log(record);
					}
				});
			}
		}
		

		index++;
		if( index == fileData.TblMain.length ) {
			done();
		} else {
			mapRecord(index);
		}
	});
}

function done() {
	console.log("finished");
}


function parseFile(file, callback) {
	var record, header;
	fileData[file] = [];
	
	console.log(__dirname+fileLocation+file+'.csv');
	
	csv()
	.from( fs.createReadStream(__dirname+fileLocation+file+'.csv', {encoding: 'utf8'}))
	.on('record', function(row, index) {
		if( index == 0 ) {
			header = row;
		} else {
			record = {};
			for( var i = 0; i < header.length; i++ ) {
				if( row[i] && row[i] != 'null' ) {
					record[header[i]] = row[i];
				}
			}

			fileData[file].push(record);	
		}
	})
	.on('error', function(error){
	  console.log("Error parsing: "+file);
	  console.log(error);
	})
	.on('end', function(){
		callback();
	});
}
