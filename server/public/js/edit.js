
CCC.edit = (function(){
	
	var initialized = false;
	
	function init() {
		if( initialized ) return _update();
		
		$('#edit').load('/edit.html', function() {
			 initialized = true;
			 _update();
		});
	}
	
	function _update() {
		
	}
	
	
	return {
		init : init
	}
	
})();