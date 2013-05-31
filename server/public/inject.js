var ie = (function(){
    var undef,
        v = 3,
        div = document.createElement('div'),
        all = div.getElementsByTagName('i');
    while (
        div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->',
        all[0]
    );
    return v > 4 ? v : undef;
}());

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
CCC.html = "html/main.js";
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
	
	// jquery.onload = CCC.onJqueryLoad;
	// Attach handlers for all browsers
	if( ie ) {
		var done = false;
		jquery.onreadystatechange = function() {
		    if ( !done && (!this.readyState ||
		            this.readyState === "loaded" || this.readyState === "complete") ) {
		    	done = true;
		    	CCC.onJqueryLoad();
		    }
		};
	} else {
		jquery.onload = CCC.onJqueryLoad;
	}
	head.appendChild(jquery);
}

CCC.onJqueryLoad = function() {
	// IE cross-site for jquery
	// add ajax transport method for cross domain requests when using IE9
	if('XDomainRequest' in window && window.XDomainRequest !== null) {
	   $.ajaxTransport("+*", function( options, originalOptions, jqXHR ) {
	        var xdr;

	        return {
	            send: function( headers, completeCallback ) {
	                // Use Microsoft XDR
	                xdr = new XDomainRequest();
	                xdr.open("get", options.url); // NOTE: make sure protocols are the same otherwise this will fail silently
	                xdr.onload = function() {
	                    if(this.contentType.match(/\/xml/)){
	                        var dom = new ActiveXObject("Microsoft.XMLDOM");
	                        dom.async = false;
	                        dom.loadXML(this.responseText);
	                        completeCallback(200, "success", [dom]);
	                    } else {
	                    	try {
	                    		this.reponseText = eval('('+this.responseText+')');
	                    	} catch (e) {
	                    		CCC.error = e;
	                    	}
	                    	
	                        completeCallback(200, "success", [this.responseText]);
	                    }
	                };

	                xdr.onprogress = function() {};

	                xdr.ontimeout = function(){
	                    completeCallback(408, "error", ["The request timed out."]);
	                };

	                xdr.onerror = function(){
	                    completeCallback(404, "error", ["The requested resource could not be found."]);
	                };

	                xdr.send();
	            },
	            abort: function() {
	                if(xdr) xdr.abort();
	            }
	        };
	    });
	}
	
	
	
	var head = $('head');
	
	// add css
	for( var i = 0; i < CCC.css.length; i++ ) {
		head.append($('<link href="'+CCC.host+"/"+CCC.css[i]+'" rel="stylesheet" />'));
	}
	
	// inject root
	//$(CCC.root).load(CCC.host+"/"+CCC.html); // IE doesn't seem to like this
	// try this..
	$.getScript(CCC.host+"/"+CCC.html, function(){
		$(CCC.root).html(CCC.mainhtml);
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

// if IE prototype out indexOf
if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function(elt /*, from*/) {
    var len = this.length >>> 0;

    var from = Number(arguments[1]) || 0;
    from = (from < 0)
         ? Math.ceil(from)
         : Math.floor(from);
    if (from < 0)
      from += len;

    for (; from < len; from++)
    {
      if (from in this &&
          this[from] === elt)
        return from;
    }
    return -1;
  };
}