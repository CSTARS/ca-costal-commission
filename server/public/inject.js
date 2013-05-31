CCC = {};

CCC.jslib = [
        "jslib/bootstrap.min.js",
        "jslib/handlebars.js",
        "jslib/jquery.dform.min.js",
        "mqe/mqe.js",
];

CCC.js = [
	     "js/app.js",
	     "js/search.js",
	     "js/home.js",
	     "js/all.js",
	     "js/result.js",
	     "js/edit.js",
	     "js/bootstrap-dform.js"
];


CCC.css = [
        "css/bootstrap.min.css",
        "css/bootstrap-responsive.min.css",
        "css/style.css"
];

CCC.jquery = "//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js";
CCC.html = "html/main.html";
CCC.host = "http://node-ccc.ceres.ca.gov";
CCC.root = "#anchor";

window.onload = function() {
	// add jquery
	var head = document.getElementsByTagName("head")[0];
	
	// inject mobile meta tag
	var meta = document.createElement("meta");
	meta.name = "viewport";
	meta.content = "width=device-width, initial-scale=1, maximum-scale=1";
	head.appendChild(meta);
	
	// add jquery
	var jquery = document.createElement("script");
	jquery.src = CCC.jquery;
	jquery.onload = CCC.onJqueryLoad;
	head.appendChild(jquery);
}

CCC.onJqueryLoad = function() {
	var head = $('head');
	
	// add css
	for( var i = 0; i < CCC.css.length; i++ ) {
		head.append($('<link href="'+CCC.host+"/"+CCC.css[i]+'" rel="stylesheet" />'));
	}
	
	// inject root
	//$(CCC.root).load(CCC.host+"/"+CCC.html); // IE doesn't seem to like this
	// try this..
	$.get(CCC.host+"/"+CCC.html + "?" + new Date().getTime(), function(data) {
		$(CCC.root).html(data);
	});
	
	// add script tags
	var loadCount = 0;
	for( var i = 0; i < CCC.jslib.length; i++ ) {
		$.getScript(CCC.host+"/"+CCC.jslib[i], function(){
			loadCount++;
			if( loadCount == CCC.jslib.length ) {
				CCC.onLibsReady();
			}
		});
	}	
}

CCC.onLibsReady = function() {
	// add script tags
	var loadCount = 0;
	for( var i = 0; i < CCC.js.length; i++ ) {
		$.getScript(CCC.host+"/"+CCC.js[i], function(){
			loadCount++;
			if( loadCount == CCC.js.length ) {
				CCC.onReady();
			}
		});
	}	
}

CCC.onReady = function() {
	$("#accordion2").collapse();
	$("#accordion2").height("auto");
	
	CERES.mqe.init("home",CCC.host);
	CCC.home.init();
	CCC.search.init();
	CCC.result.init(CCC.host);
}