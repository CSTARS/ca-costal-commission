/**
 * This will actually extend the MQE expressjs server
 * 
 * make sure mongo is fired up w/ text search enabled
 * mongod --setParameter textSearchEnabled=true
 * 
 */
var config = require(process.argv[2]);
var nodeExcel = require('excel-export');
var ObjectId = require('mongodb').ObjectID;
var nodemailer;

if( config.email ) {
	nodemailer = require("nodemailer");
	// create reusable transport method (opens pool of SMTP connections)
	var smtpTransport = nodemailer.createTransport("SMTP",{
	        host : config.email.host,
	        port : config.email.port
	});
}
 
var exportHeaders = [
	{caption:'Organization', type:'string'},
	{caption:'Contact Name', type:'string'},
	{caption:'Contact Email', type:'string'},
	{caption:'Contact Phone', type:'string'},
	{caption:'Contact Fax', type:'string'},
	{caption:'Street Address', type:'string'},
	{caption:'Street Address 2', type:'string'},
	{caption:'City', type:'string'},
	{caption:'State', type:'string'},
	{caption:'Zip', type:'string'},
	{caption:'County', type:'string'}
];

var countiesList = ["Alameda", "Alpine", "Amador", "Butte", "Calaveras", "Colusa", "Contra Costa", "Del Norte", 
                    "El Dorado", "Fresno", "Glenn", "Humboldt", "Imperial", "Inyo", "Kern", "Kings", "Lake", 
                    "Lassen", "Los Angeles", "Madera", "Marin", "Mariposa", "Mendocino", "Merced", "Modoc", 
                    "Mono", "Monterey", "Napa", "Nevada", "Orange", "Placer", "Plumas", "Riverside", "Sacramento", 
                    "San Benito", "San Bernardino", "San Diego", "San Francisco", "San Joaquin", "San Luis Obispo", 
                    "San Mateo", "Santa Barbara", "Santa Clara", "Santa Cruz", "Shasta", "Sierra", "Siskiyou", 
                    "Solano", "Sonoma", "Stanislaus", "Statewide", "Sutter", "Tehama", "Trinity", "Tulare", 
                    "Tuolumne", "Ventura", "Yolo", "Yuba"];

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
		
		// simple sanity check
		if( !data.submitterEmail ) return res.send({error: true,message: "Please provide your email address"});
		
		var d = new Date();
		if( data._id ) {
			data.currentId = data._id;
			delete data._id;
		} else {
			data.dateEntered = (d.getMonth()+1)+"/"+d.getDate()+"/"+d.getFullYear();
		}
		
		data.lastModified = (d.getMonth()+1)+"/"+d.getDate()+"/"+d.getFullYear();
		

		if( !data.counties ) data.counties = [];
		else if ( typeof data.counties == 'string' ) {
			data.counties = data.counties.split(",");
			for( var i = 0; i < data.counties.length; i++ ) data.counties[i] = data.counties[i].trim();
		}
		
		// merge all contactinfo.county 's into the org.counties field
		data.counties_active_in = [];
		for( var i = 0; i < data.counties.length; i++ ) {
			if( data.counties[i].toLowerCase() == "all" ) {
				data.counties_active_in = countiesList.slice(0);
				break;
			} else if( countiesList.indexOf(cap(data.counties[i])) > -1 ) {
				data.counties_active_in.push(cap(data.counties[i]));
			}
		}
		
		if( data.contactInfo ) {
			for( var i = 0; i < data.contactInfo.length; i++ ) {
				if( data.contactInfo[i].county &&
					data.counties.indexOf( cap(data.contactInfo[i].county) ) == -1 && 
					countiesList.indexOf(cap(data.contactInfo[i].county)) > -1 ) {
					data.counties_active_in.push( data.contactInfo[i].county );
				}
			}
		}
		
		
		
		editCollection.insert(data, {w :1}, function(err, result) {
			if( err ) return res.send({error:true,message:"failed to insert"});
			
			// notify admins
			notifyUpdate(data);
			
			res.send({success:true});
		});
	});
	
	// admin only
	// get all edits
	server.app.get('/rest/admin/allEdits', function(req, res){
		editCollection.find({},{organization:1,submitterName:1,dateEntered:1,lastModified:1,currentId:1}).sort({organization:1,submitterName:1}).toArray(function(err, items) {
			if( err ) res.send({error:true,message:err});
			else res.send({items: items});
		});
	});
	
	server.app.get('/rest/admin/getEdit', function(req, res){
		
		var id = req.query._id;
		if( !id ) return res.send({error:true,message:"no id provided"});
		
		editCollection.find({_id: ObjectId(id)}).toArray(function(err, result){
			if( err ) res.send({error:true,message:err});
			else if( result.length > 0 ) res.send(result[0]);
			else res.send({__removed:true});
		});
	});
	
	server.app.get('/rest/admin/delete', function(req, res){
	    var id = req.query._id;
	    if( !id ) return res.send({error:true,message:"no id provided"});
	    
	    // remove any pending edits
	    editCollection.remove({currentId: id}, function(err, result){
	    
             // remove record
             collection.remove({_id: ObjectId(id)}, function(err, result){
                if( err ) return res.send({error:true,message:err});
                
                // clear cache
                cacheCollection.remove(function(err, result){
                    if( err ) return res.send({error:true,message:err});
                    res.send({success:true});
                });
                
                res.send({success:true});
            });
	    });
	});
	
	server.app.get('/rest/admin/approveEdit', function(req, res){
		
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
	
	server.app.get('/rest/admin/rejectEdit', function(req, res){
		var id = req.query._id;
		if( !id ) return res.send({error:true,message:"no id provided"});
		
		editCollection.remove({_id: ObjectId(id)}, function(err, result){
			if( err ) res.send({error:true,message:err});
			res.send(result[0]);
		});
	});
	
	server.app.get('/rest/admin/export', function(req, res){
		
		collection.find({},{}).sort({organization:1}).toArray(function(err, items) {
			if( err ) return res.send({error:true,message:err});
			
			var rows = [];
			var row, it;
			for( var i = 0; i < items.length; i++ ) {
				it = items[i];
				if( it.organization == null ) continue;
				
				row = [];
				row.push(cleanXml(it.organization));
				if( it.contactInfo && it.contactInfo.length > 0 ) {
					row.push(it.contactInfo[0].name ? cleanXml(it.contactInfo[0].name) : "");
					row.push(it.contactInfo[0].email ? cleanXml(it.contactInfo[0].email) : "");
					row.push(it.contactInfo[0].phone ? cleanXml(it.contactInfo[0].phone) : "");
					row.push(it.contactInfo[0].fax ? cleanXml(it.contactInfo[0].fax) : "");
					row.push(it.contactInfo[0].addressStreet ? cleanXml(it.contactInfo[0].addressStreet) : "");
					row.push(it.contactInfo[0].addressStreet2 ? cleanXml(it.contactInfo[0].addressStreet2) : "");
					row.push(it.contactInfo[0].addressCity ? cleanXml(it.contactInfo[0].addressCity) : "");
					row.push(it.contactInfo[0].addressState ? cleanXml(it.contactInfo[0].addressState) : "CA");
					row.push(it.contactInfo[0].addressZip ? cleanXml(it.contactInfo[0].addressZip) : "CA");
					row.push(it.contactInfo[0].county ? cleanXml(it.contactInfo[0].county) : "");
				} else {
					row.push("");
					row.push("");
					row.push("");
					row.push("");
					row.push("");
					row.push("");
					row.push("");
					row.push("");
					row.push("");
					row.push("");
				}
				
				rows.push(row);
			}
			
			var conf = {
				cols : exportHeaders,
				rows : rows
			};
			
			var result = nodeExcel.execute(conf);
		    res.setHeader('Content-Type', 'application/vnd.openxmlformats');
		    res.setHeader("Content-Disposition", "attachment; filename=" + "Creeks_to_Coast_Export.xlsx");
		    res.end(result, 'binary');
			
		});
	});
	
	server.app.use("/", server.express.static(__dirname+"/public"));
	
	
};

function notifyUpdate(item) {
	if( !config.email.to || !config.email.from ) return;
	var to = "";
	for( var i = 0; i < config.email.to.length; i++ ) {
		to += config.email.to[i]+",";
	}
	to = to.replace(/,$/,'');
	
	// setup e-mail data with unicode symbols
	var mailOptions = {
	    from: config.email.from,
	    to: to, // list of receivers
	    subject: "Creeks to Coast Directory Update",
	    html: item.organization+" has submitted an update to directory.  Click "+
	    	"<a href='http://"+config.server.host+"/admin.html#"+item._id+"'>here</a> to approve or deny to submission."
	}

	// send mail with defined transport object
	smtpTransport.sendMail(mailOptions, function(error, response){
	    if(error){
	        console.log(error);
	    }else{
	        console.log("Message sent: " + response.message);
	    }
	});
}


function cleanXml(txt) {
	return txt.replace(/&/g, '&amp;')
    		  .replace(/</g, '&lt;')
    		  .replace(/>/g, '&gt;')
    		  .replace(/"/g, '&quot;')
    		  .replace(/'/g, '&apos;');
}

function cap(str) {
    var pieces = str.toLowerCase().split(" ");
    for ( var i = 0; i < pieces.length; i++ )
    {
        var j = pieces[i].charAt(0).toUpperCase();
        pieces[i] = j + pieces[i].substr(1);
    }
    return pieces.join(" ");
}
