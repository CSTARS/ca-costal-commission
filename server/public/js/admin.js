
CCC.admin = (function(){
	
	var homeRendered = false;
	var cId = "";
	
	// top tier objects to compare
	var compareArray = ["website", "mission", "orgType", "contact", "geoFocus",
	                    "counties","activities", "topics", "eduResources", "describeLecture",
	                    "eduDescription", "audiences", "languages", "in_service", "groupSize"];
	
	// nested elements to compare
	var compareNestedArray = {
			volunteers : ["description", "timeOfYear", "qualifications", "commitment", "documentation", "contact"],
			internships : ["description", "timeOfYear", "qualifications", "applicationProcedure", "numberAvailable",
			               "housingProvided", "paid", "stipend", "academicCredit", "contact"]
	};
	
	function init() {
		$("#approve-btn").on('click', function(){
			if( $(this).hasClass("disabled") ) return;
			
			if( confirm("Are you sure you want to update the record?  It will replace your current record.") ) {
				$(this).addClass("disabled").html("Approving...");
				$.ajax({
					url : "/rest/approveEdit?_id="+cId,
					success : function(resp){
						if( resp.error ) return alert("failed to approve record.");
						$("#approve-btn").removeClass("disabled").html("Approve");
						window.location = "/admin.html";
					},
					error : function() {
						alert("failed to approve record.");
						$("#approve-btn").removeClass("disabled").html("Reject");
					}
				});
			}
		});
		
		$("#reject-btn").on('click', function(){
			if( $(this).hasClass("disabled") ) return;
			
			if( confirm("Are you sure you want to REJECT the record?  It will be deleted.") ) {
				$(this).addClass("disabled").html("Rejecting...");
				$.ajax({
					url : "/rest/rejectEdit?_id="+cId,
					success : function(resp){
						if( resp.error ) return alert("failed to reject record.");
						$("#reject-btn").removeClass("disabled").html("Reject");
						window.location = "/admin.html";
					},
					error : function() {
						alert("failed to reject record.");
						$("#reject-btn").removeClass("disabled").html("Reject");
					}
				});
			}
		});
	}
	
	function showHome() {
		$("#home").show();
		$("#edit").hide();
		
		if( !homeRendered ) {
			$.ajax({
				url     : "/rest/allEdits",
				success : function(resp) {
					if( resp.error ) return alert("failed to load");
					
					// create table
					var tableHtml = '<table class="table table-hover">' +
					 				'<thead><tr><th>Organization</th><th>Submitter</th>' +
					 				'<th>Date Entered</th></tr></thead>';
					 				
					for( var i = 0; i < resp.items.length; i++ ) {
						var item = resp.items[i];
						
						var type = "<span class='text-info'>New</span>";
						if( item.currentId ) type = "<span class='text-warning'>Update</span>";
						
						tableHtml += '<tr id="'+item._id+'"><td>'+item.organization+" - "+type+'</td>' +
									  '<td>'+item.submitterName+'</td>' +
									  '<td>'+item.dateEntered+'</td></tr>';
					}
					$("#submissions").html(tableHtml+'</table>');
					
					$("#submissions tr").on('click', function(){
						window.location = "/admin.html#"+$(this).attr("id");
					});
					homeRendered = true;
				},
				error   : function(resp) {
					alert("failed to load");
				}
			});
		}
	}
	
	function showResult(id) {
		$("#home").hide();
		$("#edit").show();
		
		cId = id;
		
		_getEdit(id, function(err, item){
			if( err ) return alert("failed to load");
			
			CCC.result.onLoad(function(){
				var html = CCC.result.getResultHtml(item);
				$("#resultNew").html(html).find(".page-header").hide();
				$("#resultNew").find(".btn").hide();
				
				$("#edit-org-name").html(item.organization);
				
				var name = item.submitterName ? item.submitterName : "";
				$("#edit-submitter-name").html("Submitters Name: <span style='color:#888'>"+name+"</span>");
				
				var phone = item.submitterPhone ? item.submitterPhone : "";
				$("#edit-submitter-phone").html("Submitters Phone: <span style='color:#888'>"+phone+"</span>");
				
				var email = item.submitterEmail ? item.submitterEmail : "";
				$("#edit-submitter-email").html("Submitters Email: <span style='color:#888'>"+email+"</span>");
			});
		});
		
	}
	
	function _getEdit(id, callback) {
		$.ajax({
			url     : '/rest/getEdit?_id='+id,
			success : function(resp) {
				if( resp.error ) return callback(resp);
				
				// get current
				if( resp.currentId ) {
					_getCurrent(resp.currentId, function(err, item){
						if( err ) return alert("failed to load");
						
						var html = CCC.result.getResultHtml(item);
						$("#resultOld").html(html).find(".page-header").hide();
						$("#resultOld").find(".btn").hide();
						_compare();
					});
					
				} else {
					
					$("#resultOld").html("This is a new submission");
					
				}
				callback(null, resp);
			},
			error   : function() {
				callback({error:true,message:"failed to load"})
			}
		});
	}
	
	function _getCurrent(id, callback) {
		$.ajax({
			url     : '/rest/get?_id='+id,
			success : function(resp) {
				if( resp.error ) return callback(resp);
				callback(null, resp);
			},
			error   : function() {
				callback({error:true,message:"failed to load"})
			}
		});
	}
	
	function _compare() {
		var newPanel = $("#resultNew");
		var oldPanel = $("#resultOld");
		

		
		// top level elements
		for( var i = 0; i < compareArray.length; i++ ) {
			_diff(newPanel, oldPanel, "."+compareArray[i]);
		}
		
		// nested elements
		for( var ele in compareNestedArray ) {
			var arr = compareNestedArray[ele];
			
			// find the number of elements in the new and the old
			var c = newPanel.find("."+ele).length;
			var c2 = oldPanel.find("."+ele).length;
			if( c2 > c ) c = c2;
			
			
			for( var i = 0; i < c; i++ ) {
				for( var j = 0; j < arr.length; j++ ) {
					_diff(newPanel, oldPanel, "."+ele+"-"+i+"-"+arr[j]);
				}
			}
		}	
	}
	
	function _diff(newPanel, oldPanel, cssId) {
		var nVal, oVal, v, nP, oP, html;
		
		nP = newPanel.find(cssId);
		oP = oldPanel.find(cssId);

		var org = nP.html() ? nP.html() : "";
		nVal = nP.html(_replaceBr(nP.html())).text();
		oVal = oP.html(_replaceBr(oP.html())).text();
		
		var dmp = new diff_match_patch();		
		var d = dmp.diff_main(oVal, nVal);
		
		html = dmp.diff_prettyHtml(d);
	
		oP.html(html.replace(/&para;/g,""));
		
		
		if( oP.length == 0 ) {
			nP.html("<ins>"+org.replace(/\n/g, "<br />")+"</ins>");
		} else {
			nP.html(org.replace(/\n/g, "<br />"));
		}
	}
	
	function _replaceBr(html) {
		if( !html ) return "";
		return html.replace(/<br\s*\/>/g,"\n").replace(/<br\s*>/g,"\n");
	}

	
	
	return {
		init : init,
		showHome : showHome,
		showResult : showResult
	}
	
})();