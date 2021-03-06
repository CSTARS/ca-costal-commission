Handlebars.registerHelper('contact', function() {
  return new Handlebars.SafeString(this.contact);
});

CCC.search = (function() {
	
	// handle bar template layouts
	var RESULT_TEMPLATE = [
	    "<div class='search-result-row'>",
	    	"<h4><a href='#result/{{_id}}'>{{title}}</a></h4>",
	    	"<div class='row-fluid'>",
	    		"<div class='span7' style='padding-bottom:10px'>{{snippet}}<br /><a href='#result/{{_id}}'>[See complete details for this organization.]</a></div>",
	    		"<div class='span5'>{{contact}}</div>",
	    "</div>"
	].join('');
	var TITLE_TEMPLATE = "Search Results: <span style='color:#888'>{{start}} to {{end}} of {{total}}</span>";
	
	// template functions
	var rowTemplate;
	var titleTemplate;
	
	// static filters
	// these are boolean checkboxes that always show
	var staticFilters = {
			volunteers : {
				filter : { volunteers : { $exists: true, $not : { $size : 0 }  }},
				label: "Volunteer Opportunities"
			},
			internships : {
				filter :  { internships : { $exists: true, $not : { $size : 0 }  }},
				label : "Internship Opportunities"
			},
			altLanguageMaterials : {
				filter : {altLanguageMaterials : { $exists: true, $not : { $size : 0 } }},
				label : "Non-English resources"
			}
	};
	
	var openFilters = [];
	
	function init() {
		
		rowTemplate = Handlebars.compile(RESULT_TEMPLATE);
		titleTemplate = Handlebars.compile(TITLE_TEMPLATE);
		
		$(window).bind("search-update-event", function(e, results){
			_updateResultsTitle(results);
			_updateResults(results);
			_updateFilters(results); // this should always be before adding active filters
			_updateActiveFilters(results);
			_updatePaging(results);
			$('html, body').scrollTop(0);
		});
		
		// set search handlers
		$("#search-btn").on('click', function(){
			_search();
		});
		$("#search-text").on('keypress', function(e){
			if( e.which == 13 ) _search();
		});
	}
	
	function _search() {
		var query = CERES.mqe.getCurrentQuery();
		query.page = 0;
		query.text = $("#search-text").val();
		window.location = CERES.mqe.queryToUrlString(query);
	}
	
	
	function _updateActiveFilters() {
		var panel = $("#active-filters").html("");
		var query = CERES.mqe.getCurrentQuery();
		
		// make sure text box is always correct
		$("#search-text").val(query.text);
		
		if( query.filters.length == 0 ) return;
		
		panel.append("<h6 style='margin-top:0px'>You are currently searching for:</h6>");
		
		
		for( var i = 0; i < query.filters.length; i++ ) {
			// get query copy and splice array
			var tmpQuery = CERES.mqe.getCurrentQuery();
			tmpQuery.page = 0;
			
			var foo = tmpQuery.filters.splice(i,1);
			
			var f = "";
			for( var j in query.filters[i] ) {
				// see if it's a static filter
				if( typeof query.filters[i][j] == 'object' ) {
					if( staticFilters[j] ) {
						// grab label from static filter
						f = staticFilters[j].label;
						// also, make sure to check it's check box
						$("#static-filter-"+j).prop('checked', true);
					}
				} else {
					f = query.filters[i][j]; 
				}
				
			}
			
			panel.append($("<a href='"+CERES.mqe.queryToUrlString(tmpQuery)+"' style='margin:0 5px 5px 0' class='btn btn-primary btn-small'><i class='icon-remove icon-white'></i> "+f+"</a>"))
			
		}
		
	}
	
	function _updateFilters(results) {
		var panel = $("#filter-nav").html("");
		
		// add the title
		panel.append($('<li class="nav-header">Narrow Your Search</li>'));
		panel.append($('<li class="divider"></li>'));
		
		// first, get sorted filter list ... by nice name
		var list = [];
		for( var key in results.filters ) {
			list.push({key:key, label: CCC.labels.filters[key] ? CCC.labels.filters[key] : key});
		}
		list.sort(function(a, b){
			if( a.label < b.label ) return -1;
			if( a.label > b.label ) return 1;
			return 0;
		});
		

		// add filter blocks
		var c = 0;
		for( c = 0; c < list.length; c++ ) {
			var key = list[c].key;
			var label = list[c].label;
			var safeKey = key.replace(/\./,'___');
			
			var title = $("<li><a id='filter-block-title-"+safeKey+"' class='search-block-title'>"+label+"</a></li>");
			
			var display = "";
			if( openFilters.indexOf(key) > -1 ) display = "style='display:block'" 
			var block = $("<ul id='filter-block-"+safeKey+"' class='filter-block' "+display+"></ul>");
			
			for( var i = 0; i < results.filters[key].length; i++ ) {
				var item = results.filters[key][i];
				var query = CERES.mqe.getCurrentQuery();
				query.page = 0;
				
				var filter = {};
				filter[key] = item.filter;
				query.filters.push(filter);
				
				block.append($("<li><a href='"+CERES.mqe.queryToUrlString(query)+"'>"+item.filter+" ("+item.count+")</a></li>"));
			}
			
			title.append(block);
			panel.append(title);
		}
		
		if( c == 0 ) {
			panel.append($("<div>No filters available for this search</div>"));
			return;
		}
		
		panel.append($('<li class="divider"></li>'));
		
		// add hide/show handlers for the blocks
		$(".search-block-title").on('click', function(e){
			var id = e.target.id.replace(/filter-block-title-/, '');
			var panel = $("#filter-block-"+id);
			
			if( panel.css("display") == "none" ) {
				panel.show('blind');
				openFilters.push(id);
			} else {
				panel.hide('blind');
				openFilters.splice(openFilters.indexOf(id),1);
			}
		});
		
		// add static 'boolean' filters
		for( var filter in staticFilters ) {
			//panel.append($("<li><input type='checkbox' id='static-filter-"+filter+"' class='static-filters' >"+staticFilters[filter].label+"</a></li>"));
			panel.append($('<label class="checkbox">' +
								'<input type="checkbox" id="static-filter-'+filter+'" class="static-filters"> <a>'+staticFilters[filter].label+
							'</a></label>'
			));
		}
		
		// add click handler for static filters
		$(".static-filters").on('click', function(e) {
			var filter = e.target.id.replace(/static-filter-/, '');
			var query = CERES.mqe.getCurrentQuery();
			query.page = 0;
			if( this.checked ) {
				query.filters.push(staticFilters[filter].filter);
			} else {
				for( var i = 0; i < query.filters.length; i++ ) {
					var found = false;
					for( var j in query.filters[i] ) {
						if( j == filter ) {
							query.filters.splice(i,1);
							found = true;
							break;
						}
					}
					if( found ) break;
				}
			}
			
			window.location = CERES.mqe.queryToUrlString(query);
		});
		
	}
	
	function _updatePaging(results) {
		var tmpQuery = CERES.mqe.getCurrentQuery();
		var numPages = Math.ceil( parseInt(results.total) / tmpQuery.itemsPerPage );
		var cPage = Math.floor( parseInt(results.start+1) / tmpQuery.itemsPerPage );
		
		var buttons = [];
		
		// going to show 7 buttons
		var startBtn = cPage - 3;
		var endBtn = cPage + 3;
		
		if( endBtn > numPages ) {
			startBtn = numPages-7;
			endBtn = numPages;
		}
		if( startBtn < 0 ) {
			startBtn = 0;
			endBtn = 6;
			if( endBtn > numPages ) endBtn = numPages;
		}
		
		var panel = $("#search-paging-btns");
		var panelBottom = $("#search-paging-btns-bottom");
		panel.html("");
		panelBottom.html("");
		
		// add back button
		if( cPage != 0 ) {
			tmpQuery.page = cPage-1;
			panel.append($("<li><a href='"+CERES.mqe.queryToUrlString(tmpQuery)+"'>&#171;</a></li>"));
			panelBottom.append($("<li><a href='"+CERES.mqe.queryToUrlString(tmpQuery)+"'>&#171;</a></li>"));
		}
		
		for( var i = startBtn; i < endBtn; i++ ) {
			var label = i+1;
			tmpQuery.page = i;
			var btn = $("<li><a href='"+CERES.mqe.queryToUrlString(tmpQuery)+"'>"+label+"</a></li>");
			if( cPage == i ) btn.addClass('active');
			panel.append(btn);
			
			btn = $("<li><a href='"+CERES.mqe.queryToUrlString(tmpQuery)+"'>"+label+"</a></li>");
			if( cPage == i ) btn.addClass('active');
			panelBottom.append(btn);
		}
		
		// add next button
		if(  cPage != numPages-1 && numPages != 0 ) {
			tmpQuery.page = cPage+1;
			panel.append($("<li><a href='"+CERES.mqe.queryToUrlString(tmpQuery)+"'>&#187;</a></li>"));
			panelBottom.append($("<li><a href='"+CERES.mqe.queryToUrlString(tmpQuery)+"'>&#187;</a></li>"));
		}
	}
	
	function _updateResultsTitle(results) {
		var end = results.end;
		if( results.total < end ) end = results.total;
		
		var start = parseInt(results.start)+1;
		if( end == 0 ) start = 0;
		
		
		$("#results-title").html(titleTemplate({
			start : start,
			end   : end,
			total : results.total
		}));
	}
	
	function _updateResults(results) {
		var panel = $("#results-panel").html("");
		
		if( results.items.length == 0 ) {
			panel.append("<div style='font-style:italic;color:#999;padding:15px 10px'>No results found for your current search.</div>");
			return;
		}
		
		for( var i = 0; i < results.items.length; i++ ) {
			var item = results.items[i];
			
			var snippet = item.mission ? item.mission : "";
			if( snippet.length > 200 ) snippet = snippet.substr(0,200)+"... ";
			
			var contact = formatContact(item, false);
			if( contact.length > 0 ) {
				contact = "<h6>Address</h4>" + contact + "<br />";
			}
			
			var website = formatWebsite(item);
			if( website.length > 0 ) {
				website = "<h6>Website</h4>" + website + "<br />";
			}
			contact += website;

			
			panel.append(rowTemplate({
				_id     : item._id,
				title   : item.organization,
				snippet : snippet,
				contact : contact
			}));
		}
	}
	
	function formatContact(item, isLandingPage) {
		var contact = "";
		
		var contact = "";
		var link = "";
		var wrapInLink = false;

		if( item.contactInfo && item.contactInfo.length > 0 ) {
			var ci = item.contactInfo[0];
			
			if( ci.addressStreet ) {
				contact += ci.addressStreet.replace(/\n/,"<br />")+"<br />";
				
				// try and see if you can find a address line that starts w/ number
				var parts = ci.addressStreet.split("\n");
				for( var j = 0; j < parts.length; j++ ) {
					if( parts[j].match(/^\d+/) || wrapInLink ) {
						link += parts[j]+", ";
						wrapInLink = true
					}
				}
			}
			if( ci.addressStreet2 ) {
				contact += ci.addressStreet2+"<br /> ";
				link += ci.addressStreet2+" ";
			}
			if( ci.addressCity ) {
				contact += ci.addressCity+", ";
				link += ci.addressCity+", ";
			}
			if( ci.addressState ) {
				contact += ci.addressState+" ";
				link += ci.addressState+" ";
			}
			if( ci.addressZip ) {
				contact += ci.addressZip+"<br />";
				link += ci.addressZip;
			}
			
			if( wrapInLink ) {
				contact = "<a href='https://maps.google.com/maps?saddr=&daddr="+encodeURIComponent(link)+"' target='_blank'>"+contact+"</a>";
			}
			
			if( ci.name && isLandingPage ) {
				contact = ci.name+"<br />" + contact;
			}
			
			if( ci.phone && isLandingPage ) {
				contact += "Phone: "+formatPhone(ci.phone)+"<br />";
			}
			if( ci.altPhone && isLandingPage ) {
				contact += "Alt Phone: "+formatPhone(ci.altPhone)+"<br />";
			}
			if( ci.faxNumber && isLandingPage ) {
				contact += "Fax: "+formatPhone(ci.faxNumber)+"<br />";
			}
			if( ci.email && isLandingPage ) {
				contact += "<a href='mailto:"+ci.email+"'>"+ci.email+"</a><br />";
			}
			
		}
		
		
		
		return contact;
	}
	
	function formatPhone(text) {
		if( text.length <= 7 ) return text.replace(/(\d{3})(\d{4})/, '$1-$2');
		return text.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
	}
	
	function formatWebsite(item) {
		var website = "";
		if( item.contactInfo && item.contactInfo.length > 0 ) {
			var ci = item.contactInfo[0];
			if( ci.website ) {
				var url = ci.website;
				if( !url.match(/.*:\/\/.*/) ) url = "http://"+ci.website;
				website = "<a href='"+url+"' target='_blank'>"+ci.website+"</a>";
			}
		}
		return website;
	}
	
	
	return {
		init : init,
		formatContact : formatContact,
		formatWebsite : formatWebsite,
		formatPhone : formatPhone
	}
})();
                   
                   
