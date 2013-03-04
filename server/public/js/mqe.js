var CCC = {
	widgets : {}
};

CCC.mqe = (function(){
	
	var DEFAULT_PAGE = "home";
	var DEFAULT_SEARCH = {
		text         : "",
		filters      : [],
		page         : 0,
		itemsPerPage : 6
	};
	var HASH_SEARCH_ORDER = ["text","filters","page","itemsPerPage"];
	
	var validPages = [DEFAULT_PAGE, "search", "result"];
	var cPage = "";
	var cPath = "";
	var cQuery = null;
	
	function init() {
		_parseUrl();
		
		CCC.home.init();
		CCC.search.init();
		
		$(window).on("hashchange", function(){
			_parseUrl();
		});
	}
	
	function _parseUrl() {
		var hash = window.location.hash.replace("#",'');
		if( !hash ) hash = DEFAULT_PAGE;
		
		var parts = hash.split("/");
		for( var i = 0; i < parts.length; i++ ) parts[i] = decodeURIComponent(parts[i]);
		
		_updatePage(parts[0]);
		_updatePageContent(parts);
	}
	
	function _updatePage(page) {
		if( page == cPage ) return;
		
		if( validPages.indexOf(page) == -1 ) page = DEFAULT_PAGE;
		
		$("#"+cPage).hide();
		$("#"+page).show();
		
		cPage = page;
	}
	
	function _updatePageContent(hash) {
		if( cPage == "home" ) {
			// do nothing
		} else if ( cPage == "search" ) {
			_updateSearch(hash);
		} else if ( cPage == "result" ) {
			_updateResult();
		}
	}
	
	function _updateSearch(hash) {
		var search = $.extend({}, DEFAULT_SEARCH);
		
		for( var i = 1; i < hash.length; i++ ) {
			if( hash[i].length > 0 ) {
				search[HASH_SEARCH_ORDER[i-1]] = hash[i];
			}
		}
		
		try {
			if( typeof search.filters == 'string' ) {
				search.filters = JSON.parse(search.filters);
			}
		} catch (e) {
			console.log(e);
		}
		
		
		try {
			if( typeof search.page == 'string' ) {
				search.page = parseInt(search.page);
			}
			if( typeof search.itemsPerPage == 'string' ) {
				search.itemsPerPage = parseInt(search.itemsPerPage);
			}
		} catch(e) {
			console.log(e);
		}
		
		cQuery = search;
		
		$.get('/rest/query?text='+search.text + 
				'&filters=' + JSON.stringify(search.filters) + 
				'&start=' + (search.page*search.itemsPerPage) +
				'&end=' + ((search.page+1)*search.itemsPerPage) +
				'&includeFilters=true',
			function(data) {
				$(window).trigger("search-update-event",[data]);  
			}
		);
	}
	
	function _updateResult(hash) {
		
	}
	
	function getCurrentQuery() {
		return $.extend(true, {}, cQuery);
	}

	function queryToUrlString(query) {
		var hash = "/#search";
		for( var i = 0; i < HASH_SEARCH_ORDER.length; i++ ) {
			if( query[HASH_SEARCH_ORDER[i]] != null) {
				if( typeof query[HASH_SEARCH_ORDER[i]] == 'object' ) {
					hash += "/"+encodeURIComponent(JSON.stringify(query[HASH_SEARCH_ORDER[i]]));
				} else {
					hash += "/"+encodeURIComponent(query[HASH_SEARCH_ORDER[i]]);
				}
			} else {
				hash += "/";
			}
		}
		return hash;
	}
	
	
	return {
		init : init,
		queryToUrlString : queryToUrlString,
		getCurrentQuery : getCurrentQuery
	};
	
})();