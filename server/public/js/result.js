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

Handlebars.registerHelper('mission', function() {
	  return new Handlebars.SafeString(this.mission.replace(/\n/g,'<br />').replace(/\t/g,'&nbsp&nbsp;'));
});

Handlebars.registerHelper('eduDescription', function() {
	  return new Handlebars.SafeString(this.eduDescription.replace(/\n/g,'<br />').replace(/\t/g,'&nbsp&nbsp;'));
});

Handlebars.registerHelper('in_service', function() {
	return new Handlebars.SafeString(this.in_service);
});

Handlebars.registerHelper('volunteers.phone', function() {
	  return CCC.search.formatPhone(this.phone);
});


CCC.result = (function() {
	
	var resultTemplate = null;
	
	var loaded = false;
	var waiting = null;
	
	function init() {
		$('#result').load('/result.handlebars', function() {
			var source = $("#result-template").html();
			resultTemplate = Handlebars.compile(source);
			
			loaded = true;
			if( waiting != null ) updateResult(waiting);
		});
		
		$(window).bind('result-update-event', function(e, result){
			updateResult(result);
		});
	}
	
	function updateResult(result) {
		if( !loaded ) {
			waiting = result;
			return;
		}
		
		$("#result").html(getResultHtml(result));
		
		$("#result-back-btn").on('click', function(){
			$(window).trigger("back-to-search-event");
		});
	}
	
	function getResultHtml(result) {
		
		result.contact = CCC.search.formatContact(result, true);
		result.website = CCC.search.formatWebsite(result);
		
		var other_lang = "";
		if( result.langauges ) other_lang += result.langauges;
		if( result.langauges && result.altLanguageResources ) other_lang += ": ";
		if( result.altLanguageResources ) other_lang += result.altLanguageResources;
		if( other_lang.length > 0 ) result.other_lang = other_lang
		
		var in_service = "";
		if( result.training && result.training.length > 0 ) {
			for( var i = 0; i < result.training.length; i++ ) {
				in_service += result.training[i];
				if( i < result.training.length - 1 ) in_service += ", ";
			}
			in_service += "<br />";
		}
		if( result.trainingDescription ) {
			in_service += result.trainingDescription;
		}
		if( in_service.length > 0 ) result.in_service = in_service;
		
		if( typeof result.geoFocus == 'string' ) result.geoFocus = [result.geoFocus];
		if( typeof result.counties == 'string' ) result.counties = [result.counties];
		
		return resultTemplate(result);
		
	}

	
	return {
		init : init,
		updateResult : updateResult,
		getResultHtml : getResultHtml
	}
	
})();