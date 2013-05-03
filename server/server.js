/**
 * This will actually extend the MQE expressjs server
 * 
 * make sure mongo is fired up w/ text search enabled
 * mongod --setParameter textSearchEnabled=true
 * 
 */
var config = require(process.argv[2]);

var ObjectId = require('mongodb').ObjectID;

// include auth model
var auth;
if( config.auth ) {
	auth = require(config.auth.script);
}
 

// express app
exports.bootstrap = function(server) {
	var db = server.mqe.getDatabase();
	
	var collection;
	var editCollection;
	var cacheCollection;
	
	db.collection(config.db.mainCollection, function(err, coll) { 
		if( err ) return console.log(err);

		collection = coll;
	});
	
	db.collection(config.db.editCollection, function(err, coll) { 
		if( err ) return console.log(err);

		editCollection = coll;
	});
	
	db.collection(config.db.cacheCollection, function(err, coll) { 
		if( err ) return console.log(err);

		cacheCollection = coll;
	});
	
	
	
	// get the results of a query
	server.app.get('/rest/allOrgs', function(req, res){
		collection.find({},{organization:1}).sort({organization:1}).toArray(function(err, items) {
			if( err ) res.send(err);
			else res.send(items);
		});
	});
	
	// get form data
	server.app.get('/rest/formData', function(req, res) {
		res.send({
			schema  : config.schema,
			options : config.editForm
		});
	});
	
	// save edit data
	server.app.post('/rest/editData', function(req, res) {
		
		var data = req.body;
		if( !data ) return res.send({error:true,message:"no data"});
		
		var d = new Date();
		if( data._id ) {
			data.currentId = data._id;
			delete data._id;
		} else {
			data.dateEntered = (d.getMonth()+1)+"/"+d.getDate()+"/"+d.getFullYear();
		}
		
		data.lastModified = (d.getMonth()+1)+"/"+d.getDate()+"/"+d.getFullYear();
		
		editCollection.insert(data, {w :1}, function(err, result) {
			if( err ) return res.send({error:true,message:"failed to insert"});
			res.send({success:true});
		});
	});
	
	// admin only
	// get all edits
	server.app.get('/rest/allEdits', function(req, res){
		editCollection.find({},{organization:1,submitterName:1,dateEntered:1,lastModified:1,currentId:1}).sort({organization:1,submitterName:1}).toArray(function(err, items) {
			if( err ) res.send({error:true,message:err});
			else res.send({items: items});
		});
	});
	
	server.app.get('/rest/getEdit', function(req, res){
		
		var id = req.query._id;
		if( !id ) return res.send({error:true,message:"no id provided"});
		
		editCollection.find({_id: ObjectId(id)}).toArray(function(err, result){
			if( err ) res.send({error:true,message:err});
			res.send(result[0]);
		});
	});
	
	server.app.get('/rest/approveEdit', function(req, res){
		
		var id = req.query._id;
		if( !id ) return res.send({error:true,message:"no id provided"});
		
		editCollection.find({_id: ObjectId(id)}).toArray(function(err, result){
			if( err ) res.send({error:true,message:err});
			if( result.length < 0 ) res.send({error:true,message:"no edits with this id"});
			
			var newRecord = result[0];
			var recordId = newRecord.currentId;
			
			// clean up
			delete newRecord._id;
			delete newRecord.currentId;
			
			// clear cache
			cacheCollection.remove(function(err, result){
				if( err ) return res.send({error:true,message:err});
				res.send({success:true});
			});
			
			// is edit
			if( recordId ) { 
				collection.update({_id: ObjectId(recordId)}, newRecord, function(err, result){
					if( err ) return res.send({error:true,message:err});
					
					// remove old record
					editCollection.remove({_id: ObjectId(id)}, function(err, result){
						if( err ) return res.send({error:true,message:err});
						res.send({success:true});
					});
				});
			} else {

				collection.insert(newRecord, {w:1}, function(err, result){
					if( err ) return res.send({error:true,message:err});
					
					// remove old record
					editCollection.remove({_id: ObjectId(id)}, function(err, result){
						if( err ) return res.send({error:true,message:err});
						res.send({success:true});
					});
				});
			}
		});
		

	});
	
	server.app.get('/rest/rejectEdit', function(req, res){
		var id = req.query._id;
		if( !id ) return res.send({error:true,message:"no id provided"});
		
		editCollection.remove({_id: ObjectId(id)}, function(err, result){
			if( err ) res.send({error:true,message:err});
			res.send(result[0]);
		});
	});
	
	server.app.use("/", server.express.static(__dirname+"/public"));
	
	// set the auth endpoints
	if( config.auth ) auth.init(server.app, server.passport, config);
	
};