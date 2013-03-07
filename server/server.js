/**
 * This will actually extend the MQE expressjs server
 */
var config = require("./config");
var auth = require("./auth");

// express app
exports.bootstrap = function(server) {
	var db = server.mqe.getDatabase();
	
	var collection;
	db.collection(config.db.mainCollection, function(err, coll) { 
		if( err ) return console.log(err);

		collection = coll;
	});
	
	// get the results of a query
	server.app.get('/rest/allOrgs', function(req, res){
		collection.find({},{Organization:1}).sort({Organization:1}).toArray(function(err, items) {
			if( err ) res.send(err);
			else res.send(items);
		});
	});
	
	
	server.app.use("/", server.express.static(__dirname+"/public"));
	
	auth.init(server);
	
};