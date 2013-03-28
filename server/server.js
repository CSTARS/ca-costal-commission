/**
 * This will actually extend the MQE expressjs server
 */
var config = require("./config");
var auth = require("./auth");
var ObjectId = require('mongodb').ObjectID;

// express app
exports.bootstrap = function(server) {
	var db = server.mqe.getDatabase();
	
	var collection;
	var editCollection
	db.collection(config.db.mainCollection, function(err, coll) { 
		if( err ) return console.log(err);

		collection = coll;
	});
	
	db.collection(config.db.editCollection, function(err, coll) { 
		if( err ) return console.log(err);

		editCollection = coll;
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
		
		data.currentId = data._id;
		delete data._id;
		
		var d = new Date();
		data.dateEntered = (d.getMonth()+1)+"/"+d.getDate()+"/"+d.getFullYear();
		
		editCollection.insert(data, {w :1}, function(err, result) {
			if( err ) return res.send({error:true,message:"failed to insert"});
			res.send({success:true});
		});
	});
	
	// admin only
	// get all edits
	server.app.get('/rest/allEdits', function(req, res){
		editCollection.find({},{organization:1,submitterName:1,dateEntered:1}).sort({organization:1,submitterName:1}).toArray(function(err, items) {
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
	
	server.app.use("/", server.express.static(__dirname+"/public"));
	
	auth.init(server);
	
};