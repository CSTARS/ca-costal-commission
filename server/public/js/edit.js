
CCC.edit = (function(){
	
	var initialized = false;
	var options = {};
	var host = "";
	
	function init(h) {
		host = h;
		if( initialized ) return _update();
		
		$.ajax({
			url     : host ? host+"/rest/formData" : "/rest/formData",
			success : function(o) {
				options = o;
				options.id = "#form-root";
				options.onCreate = function() {
					_initHandlers();
				}
				
				_update();
				initialized = true;
			}
		});
	}
	
	function _update() {
		$("#form-root").html("");
		$("#form-error-msg").html("");
		
		var parts = window.location.hash.replace(/#/,'').split("/");
		var tmpOptions = $.extend(true, {}, options);
		
		if( parts.length > 1 ) {
			$.ajax({
				url : host ? host+"/rest/get?_id="+parts[1] : "/rest/get?_id="+parts[1],
				success : function(data) {
					
					tmpOptions.data = data;
					Ceres.forms.generate(tmpOptions);
					setLastModified(data);
					
					// make sure one contact is open and can't be removed
					$("#form-root-contactInfo-0-remove").remove();
				}
			});
		} else {
			tmpOptions.data = null;
			Ceres.forms.generate(tmpOptions);
		
			// make sure one contact is open and can't be removed
			$("#subform-add-form-root-contactInfo").trigger('click');
			$("#form-root-contactInfo-0-remove").remove();
		}
	}
	
	function _initHandlers() {
		var parts = window.location.hash.replace(/#/,'').split("/");
		 $("#form-root-save").on('click', function(){
			 if( $(this).hasClass('disabled') ) return;
			 
			 var data = Ceres.forms.getData();
			 
			 if( parts.length > 1 ) {
				 data._id = parts[1];
			 }
			 
			 if( data.error ) {
				$("#form-error-msg").html("Missing required fields");
			 } else {
				$("#form-error-msg").html("");
				$(this).addClass('disabled').text('Saving...');
				 
				$.ajax({
					url     : host ? host+'/rest/editData' : '/rest/editData',
					type    : 'POST',
					data    : data,
					error : function() {
						$("#form-root-save").removeClass('disabled').text('Save');
						alert("failed to submit");
					},
					success : function(resp) {
						$("#form-root-save").removeClass('disabled').text('Save');
						if( resp.error ) return alert(resp.message);
						alert("Thank you for your submission!");
						
						if( parts.length > 1 ) {
							 window.location = "#result/"+ parts[1];
						 } else {
							 window.location = "#";
						 }
					}
				});
				
				
			 }
		 });
		 
		 $("#form-root-cancel").on('click', function(){
			 if( parts.length > 1 ) {
				 window.location = "#result/"+ parts[1];
			 } else {
				 window.location = "#";
			 }
		 });
	};

	//set the static last modified date
	function setLastModified( data ) {
		var lastModified = "";
		
		if( data ) {
			lastModified = data.lastModified;
			if( !lastModified ) lastModified = data.dateEntered;
		} 
		
		if( !lastModified || lastModified == "") {
			var d = new Date();
			lastModified = (d.getMonth()+1)+"/"+d.getDate()+"/"+d.getFullYear();
		}
			
		$("#last-modified-date").html("<b>Last Modified:</b> "+lastModified);
	}
	
	
	return {
		init : init
	}
	
})();