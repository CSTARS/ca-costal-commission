CCC.all = (function() {
	
	var initialized = false;
	
	function init() {
		if( initialized ) return;
		
		$.ajax({
			  url: "/rest/allOrgs",
			  success: function ( data ) {
			    _createList(data);
			  },
			  error : function ( err ) {
				  console.log(err);
			  }
		});
		
		initialized = true;
	}
	
	function _createList(data) {
		var list = $("<ul />"), li;
		var firstChar = _getFirstChar(data[1]);
		var panel = $("#all");
		var nav = $("#all-nav ul");
		
		_addHeader(panel, firstChar);
		_addToNav(nav, firstChar);
		
		for( var i = 1; i < data.length; i++ ) {
			li = $("<li><a href='/#result/"+data[i]._id+"'>"+data[i].Organization+"</a></li>");
			
			if( _getFirstChar(data[i]) == firstChar ) {
				list.append(li);
			} else {
				panel.append(list);
				
				list = $("<ul />");
				list.append(li);
				
				firstChar = _getFirstChar(data[i]);
				_addHeader(panel, firstChar);
				_addToNav(nav, firstChar);
			}
		}
		panel.append(list);
		
		nav.find("a").on('click', function(){
			var title = $("#all-title-"+this.id.replace(/all-nav-/,''));
			  $('body').animate({scrollTop : title.offset().top},'slow');
		});
	}
	
	function _addToNav(nav, firstChar) {
		nav.append("<li><a id='all-nav-"+firstChar+"' style='cursor:pointer'>&nbsp;"+firstChar+"&nbsp;</a></li>");
	}
	
	function _addHeader(panel, firstChar) {
		panel.append($("<div class='page-header'><h5 id='all-title-"+firstChar+"'>"+firstChar+"</h5></div>"));
	}
	
	
	function _getFirstChar(item) {
		if( !item.Organization ) return "";
		return item.Organization.toUpperCase().substring(0, 1);
	}
	
	return {
		init : init
	}
	
})();