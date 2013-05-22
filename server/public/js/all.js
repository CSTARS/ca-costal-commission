CCC.all = (function() {
	
	var initialized = false;
	
	function init(host) {
		if( initialized ) return;
		
		$.ajax({
			  url: host ? host+"/rest/allOrgs" : "/rest/allOrgs",
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
			li = $("<li><a href='/#result/"+data[i]._id+"'>"+data[i].organization+"</a></li>");
			
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
		var header = $("<div class='page-header'></div>");
		var title = $("<h5 id='all-title-"+firstChar+"'>"+firstChar+"</h5>");
		var top = $("<a class='pull-right' style='color:#157ab5;cursor:pointer'><i class='icon-arrow-up'></i> top</a>").on('click', function(){
			$('body').animate({scrollTop : 0},'slow');
		});
		
		panel.append(header.append(title.prepend(top)));
	}
	
	
	function _getFirstChar(item) {
		if( !item.organization ) return "";
		return item.organization.toUpperCase().substring(0, 1);
	}
	
	return {
		init : init
	}
	
})();