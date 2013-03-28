
CCC.admin = (function(){
	
	var homeRendered = false;
	var compareArray = ["website", "mission", "orgType", "contact", "geoFocus",
	                    "counties","activities", "topics", "eduResources"];
	
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
						tableHtml += '<tr id="'+item._id+'"><td>'+item.organization+'</td>' +
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
		
		_getEdit(id, function(err, item){
			if( err ) return alert("failed to load");
			
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
		
	}
	
	function _getEdit(id, callback) {
		$.ajax({
			url     : '/rest/getEdit?_id='+id,
			success : function(resp) {
				if( resp.error ) return callback(resp);
				
				// get current
				_getCurrent(resp.currentId, function(err, item){
					if( err ) return alert("failed to load");
					
					var html = CCC.result.getResultHtml(item);
					$("#resultOld").html(html).find(".page-header").hide();
					$("#resultOld").find(".btn").hide();
					_compare();
				});
				
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
		
		var nVal, oVal, v, nP, oP, html;
		
		for( var i = 0; i < compareArray.length; i++ ) {
			v = compareArray[i];
			
			nP = newPanel.find("."+v);
			oP = oldPanel.find("."+v);
			
			var org = nP.html();
			nVal = nP.html(_replaceBr(nP.html())).text();
			oVal = nP.html(_replaceBr(oP.html())).text();
			
			var dmp = new diff_match_patch();
			console.log("DIFF: "+v);
			
			var d = dmp.diff_main(oVal, nVal);
			
			//dmp.diff_cleanupSemantic(d);
			
			html = dmp.diff_prettyHtml(d);
			console.log(html);
			
			oP.html(html.replace("\n", "<br />").replace(/&para;/g,""));
			nP.html(org);
		}
	}
	
	function _replaceBr(html) {
		return html.replace(/<br\s?\/>/g,"\n").replace(/<br\s?>/g,"\n");
	}

	
	
	return {
		showHome : showHome,
		showResult : showResult
	}
	
})();