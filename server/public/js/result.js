Handlebars.registerHelper('result-list', function(items, options) {
  var out = "<div>";
  for(var i=0, l=items.length; i<l; i++) {
    out = out + items[i];
    if( i < items.length - 1 ) out += ", ";
  }
  return out+"</div>";
});

Handlebars.registerHelper('website', function() {
	  return new Handlebars.SafeString(this.website);
});

Handlebars.registerHelper('Mission', function() {
	  return new Handlebars.SafeString(this.Mission.replace(/\n/g,'<br />').replace(/\t/g,'&nbsp&nbsp;'));
});

Handlebars.registerHelper('EdPrograms', function() {
	  return new Handlebars.SafeString(this.EdPrograms.replace(/\n/g,'<br />').replace(/\t/g,'&nbsp&nbsp;'));
});

Handlebars.registerHelper('in_service', function() {
	return new Handlebars.SafeString(this.in_service);
});

Handlebars.registerHelper('Volunteer.VPWorkPhone', function() {
	  return CCC.search.formatPhone(this.VPWorkPhone);
});


CCC.result = (function() {
	
	var resultTemplate = null;
	
	function init() {
		var source = $("#result-template").html();
		resultTemplate = Handlebars.compile(source);
		
		$(window).bind('result-update-event', function(e, result){
			_updateResult(result);
		});
	}
	
	function _updateResult(result) {
		result.contact = CCC.search.formatContact(result, true);
		result.website = CCC.search.formatWebsite(result);
		
		var other_lang = "";
		if( result.TypeOfLanguage ) other_lang += result.TypeOfLanguage;
		if( result.TypeOfLanguage && result.ResourceDescription ) other_lang += ": ";
		if( result.ResourceDescription ) other_lang += result.ResourceDescription;
		if( other_lang.length > 0 ) result.other_lang = other_lang
		
		var in_service = "";
		if( result.training && result.training.length > 0 ) {
			for( var i = 0; i < result.training.length; i++ ) {
				in_service += result.training[i];
				if( i < result.training.length - 1 ) in_service += ", ";
			}
			in_service += "<br />";
		}
		if( result.InServiceDescription ) {
			in_service += result.InServiceDescription;
		}
		if( in_service.length > 0 ) result.in_service = in_service;
		
		
		$("#result").html(resultTemplate(result));
		
		$("#result-back-btn").on('click', function(){
			$(window).trigger("back-to-search-event");
		});
	}

	
	return {
		init : init
	}
	
})();