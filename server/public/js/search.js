Handlebars.registerHelper('contact', function() {
  return new Handlebars.SafeString(this.contact);
});

CCC.search = (function() {
	
	// handle bar template layouts
	var RESULT_TEMPLATE = [
	    "<div class='search-result-row'>",
	    	"<h4><a href='#result/{{_id}}'>{{title}}</a></h4>",
	    	"<div class='row-fluid'>",
	    		"<div class='span7'>{{snippet}}<br /><a href='#result/{{_id}}'>[See complete details for this organization.]</a></div>",
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
			Volunteer : {
				filter : {Volunteer : { $exists: true, $not : { $size : 0 }  }},
				label: "Volunteer Opportunities"
			},
			Intern : {
				filter :  { Intern : { $exists: true, $not : { $size : 0 }  }},
				label : "Internship Opportunities"
			},
			alt_language_materials : {
				filter : {alt_language_materials : { $exists: true, $not : { $size : 0 } }},
				label : "Non-English resources"
			}
	};
	
	
	function init() {
		
		rowTemplate = Handlebars.compile(RESULT_TEMPLATE);
		titleTemplate = Handlebars.compile(TITLE_TEMPLATE);
		
		$(window).on("search-update-event", function(e, results){
			_updateResultsTitle(results);
			_updateResults(results);
			_updateFilters(results); // this should always be before adding active filters
			_updateActiveFilters(results);
			_updatePaging(results);
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
		var query = CCC.mqe.getCurrentQuery();
		query.text = $("#search-text").val();
		window.location = CCC.mqe.queryToUrlString(query);
	}
	
	
	function _updateActiveFilters() {
		var panel = $("#active-filters").html("");
		var query = CCC.mqe.getCurrentQuery();
		
		if( query.filters.length == 0 ) return;
		
		panel.append("<h6 style='margin-top:0px'>You are currently searching for:</h6>");
		
		
		for( var i = 0; i < query.filters.length; i++ ) {
			// get query copy and splice array
			var tmpQuery = CCC.mqe.getCurrentQuery();
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
			
			panel.append($("<a href='"+CCC.mqe.queryToUrlString(tmpQuery)+"' style='margin:0 5px 5px 0' class='btn btn-primary btn-small'><i class='icon-remove icon-white'></i> "+f+"</a>"))
			
		}
		
		// make sure text box is always correct
		$("#search-text").val(query.text);
		
	}
	
	function _updateFilters(results) {
		var panel = $("#filter-nav").html("");
		
		// add the title
		panel.append($('<li class="nav-header">Narrow Your Search</li>'));
		panel.append($('<li class="divider"></li>'));
		
		var c = 0;
		

		// add filter blocks
		var c = 0;
		for( var key in results.filters ) {
			var title = $("<li><a id='filter-block-title-"+c+"' class='search-block-title'>"+key+"</a></li>");
			var block = $("<ul id='filter-block-"+c+"' class='filter-block'></ul>");
			
			for( var i = 0; i < results.filters[key].length; i++ ) {
				var item = results.filters[key][i];
				var query = CCC.mqe.getCurrentQuery();
				query.page = 0;
				
				var filter = {};
				filter[key] = item.filter;
				query.filters.push(filter);
				
				block.append($("<li><a href='"+CCC.mqe.queryToUrlString(query)+"'>"+item.filter+" ("+item.count+")</a></li>"));
			}
			
			title.append(block);
			panel.append(title);
			c++;
		}
		
		panel.append($('<li class="divider"></li>'));
		
		// add hide/show handlers for the blocks
		$(".search-block-title").on('click', function(e){
			var id = e.target.id.replace(/filter-block-title-/, '');
			var panel = $("#filter-block-"+id);
			
			if( panel.css("display") == "none" ) panel.show('blind');
			else panel.hide('blind');
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
			var query = CCC.mqe.getCurrentQuery();
			
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
			
			window.location = CCC.mqe.queryToUrlString(query);
		});
		
	}
	
	function _updatePaging(results) {
		var tmpQuery = CCC.mqe.getCurrentQuery();
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
		panel.html("");
		
		// add back button
		if( cPage != 0 ) {
			tmpQuery.page = cPage-1;
			panel.append($("<li><a href='"+CCC.mqe.queryToUrlString(tmpQuery)+"'>&#171;</a></li>"));
		}
		
		for( var i = startBtn; i < endBtn; i++ ) {
			var label = i+1;
			tmpQuery.page = i;
			var btn = $("<li><a href='"+CCC.mqe.queryToUrlString(tmpQuery)+"'>"+label+"</a></li>");
			if( cPage == i ) btn.addClass('active');
			panel.append(btn);
		}
		
		// add next button
		if(  cPage != numPages-1 ) {
			tmpQuery.page = cPage+1;
			panel.append($("<li><a href='"+CCC.mqe.queryToUrlString(tmpQuery)+"'>&#187;</a></li>"));
		}
		
	}
	
	function _updateResultsTitle(results) {
		var end = results.end;
		if( results.total < end ) end = results.total;
		
		$("#results-title").html(titleTemplate({
			start : parseInt(results.start)+1,
			end   : end,
			total : results.total
		}));
	}
	
	function _updateResults(results) {
		var panel = $("#results-panel").html("");
		
		
		
		
		for( var i = 0; i < results.items.length; i++ ) {
			var item = results.items[i];
			
			var snippet = item.Mission ? item.Mission : "";
			if( snippet.length > 200 ) snippet = snippet.substr(0,200)+"... ";
			
			var contact = "";
			var link = "";
			var wrapInLink = false;
			var website = "";
			if( item.ContactInfo && item.ContactInfo.length > 0 ) {
				var ci = item.ContactInfo[0];
				
				if( ci.Address ) {
					contact += ci.Address.replace(/\n/,"<br />")+"<br />";
					
					// try and see if you can find a address line that starts w/ number
					var parts = ci.Address.split("\n");
					for( var j = 0; j < parts.length; j++ ) {
						if( parts[j].match(/^\d+/) || wrapInLink ) {
							link += parts[j]+", ";
							wrapInLink = true
						}
					}
				}
				if( ci.City ) {
					contact += ci.City+", ";
					link += ci.City+", ";
				}
				if( ci.State ) {
					contact += ci.State+" ";
					link += ci.State+" ";
				}
				if( ci.Zip ) {
					contact += ci.Zip+"<br />";
					link += ci.Zip;
				}
				if( ci.WebSite ) {
					var url = ci.WebSite;
					if( !url.match(/.*:\/\/.*/) ) url = "http://"+ci.WebSite;
					website = "<h6>Website</h6><a href='"+url+"' target='_blank'>"+ci.WebSite+"</a>";
				}
			}
			
			if( wrapInLink ) {
				contact = "<a href='https://maps.google.com/maps?saddr=&daddr="+encodeURIComponent(link)+"' target='_blank'>"+contact+"</a>";
			}
			if( contact.length > 0 ) {
				contact = "<h6>Address</h4>" + contact + "<br />";
			}
			contact += website;

			
			panel.append(rowTemplate({
				_id     : item._id,
				title   : item.Organization,
				snippet : snippet,
				contact : contact
			}));
		}
	}
	
	return {
		init : init
	}
})();
                   
                   
