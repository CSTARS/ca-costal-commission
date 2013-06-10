if( !window.Ceres ) window.Ceres = {};

// create dforms that look great in bootstrap
// only one form at a time on the page ... for the moment
Ceres.forms = (function(){
	
	// add nice bootstrap buttons
	$.dform.addType("btn", function(options) {
	    return $("<a>").addClass('btn').dform('attr', options).html(options.value);
	});
	
	// add nice address
	$.dform.addType("address", function(options) {
		var panel = $("<div>Street &nbsp;&nbsp;&nbsp;<input type='text' id='"+options.id+"-Street' /><br />" +
					  "Street 2 <input type='text' id='"+options.id+"-Street2' /><br />" +
					  "City <input type='text'id='"+options.id+"-City' style='width:120px' /> " +
					  "State<input type='text' id='"+options.id+"-State' style='width:40px' /> " + 
					  "Zip<input type='number' id='"+options.id+"-Zip' style='width:80px' /></div>");
	    return panel.dform('attr', options);
	});
	

	// element types that should be wrapped in div
	var wrapTypes = ["text", "password", "checkbox", "select", "checkboxes", "radiobuttons", "tel", 
	                 "number", "email", "url", "address", "textarea"];
	var boxTypes = ["text", "password", "tel", "number", "email", "url", "textarea"];
	var addressTypes = ["Street", "Street2", "City", "State", "Zip"];
	
	// current form vars
	var formEles = null;
	var subForms = null;
	var subFormCounts = {};
	var input = {};
	
	// create the form
	// object inputs
	/**
	 * {
	 *   fromid   : [id], // dom element id to generate form in
	 *   option   : [object], // dforms options object
	 *   schema   : [object], // object schema data
	 *   data     : [object],  // data to call the form with
	 *   onCreate : [function] // fired when form is created 
	 * }
	 */
	function generate(input) {
		formEles = $.extend(true, [], input.options.html);
		subFormCounts = {};
		schema = input.schema;
		id = input.id;
		
		// ORDER MATTERS!!!!
		// the order these functions are called in is VERY important.
		_addSchemaOptions(input.options.html, schema);
		_wrapIds(id.replace(/#/,''), input.options.html);
		subForms = _subFormPrep(input.options.html);
		_addRequiredMarker(input.options.html);
		_createHelp(input.options.html);
		_wrapElements(input.options.html);
		
		$(id).dform(input.options);
		
		_postProcess(id);
		_createSubForms();
		
		_setFormData(id, input.data, formEles);
		
		if( input.onCreate ) input.onCreate();
	}
	
	// pullout and save subform data and generate subform stubs
	function _subFormPrep(eles) {
		var forms = [];
		for( var i = 0; i < eles.length; i++ ) {
			if( eles[i].type == "subform" )  {
				// save form descriptor
				forms.push(eles[i]);
				// set anchor
				eles[i] = {
						type : "div",
						"class" : "dform-section",
						id   : eles[i].id
				}
				
				eles.splice(i, 0, {
						type : "div", 
						id   : eles[i].id+"-title"
				});
			}
		}
		return forms;
	}
	
	function _createSubForms() {
		for( var i = 0; i < subForms.length; i++ ) {
			_createSubForm(subForms[i]);
		}
	}
	
	function _createSubForm(subform) {
		var title = $("<h4>"+subform.caption+"</h4>");
		 $("#"+subform.id+"-title").append(title);
		
		var addBtn = $("<a class='btn' style='margin-left:15px' id='subform-add-"+subform.id+"'><i class='icon-plus'></i> Add</a>").on('click', function(){
			_addSubForm($(this).attr('id').replace(/subform-add-/, ''), true);
		});
		
		title.append(addBtn);
	}
	
	function _addSubForm(id, animate) {
		var subform = null;
		for( var i = 0; i < subForms.length; i++ ) {
			if( subForms[i].id == id ) {
				subform = subForms[i];
				break;
			}
		}
		if( subform == null ) return;
		
		var panel = $("#"+subform.id);
		
		if( subFormCounts[subform.id] == null ) subFormCounts[subform.id] = 0;
		var subformId = subform.id+"-"+subFormCounts[subform.id];

		// clone
		var newform = $.extend(true, {}, subform);
		
		_addSchemaOptions(newform.form, schema);
		
		// create the ids for all of these elements
		for( var i = 0; i < newform.form.length; i++ ) {
			if( newform.form[i].id != null  ) {
				newform.form[i].id = subform.id + "-" + subFormCounts[subform.id] + "-" + newform.form[i].id;
			}	
		}
		
		newform.form.splice(0, 0, {
			"id"    : subformId+"-remove",
            "type"  : "btn",
            "class" : "btn-danger pull-right",
            "value" : "<i class='icon-remove-circle icon-white'></i> Remove"
		});
		
		
		_addRequiredMarker(newform.form);
		_createHelp(newform.form);
		_wrapElements(newform.form);
		
		panel.prepend($("<div id='"+subformId+"' class='dform-subform' style='display:none'></div>"));
		$("#"+subformId).dform({
			html : newform.form
		});
		
		_postProcess("#"+subformId);
		
		$("#"+subformId+"-remove").on('click', function(){
			if( confirm("Are you sure you want to remove?") ) {
				$("#"+subformId).hide('slow', function(){
					$(this).remove();
				});
			}
		});
		
		subFormCounts[subform.id]++;
		
		if( animate ) $("#"+subformId).show('slow');
		else $("#"+subformId).show();
	}	
	
	// wrap inputs in div tags to add block spacing
	function _wrapElements(eles) {
		var wrapper;
		for( var i = 0; i < eles.length; i++ ) {
			if( wrapTypes.indexOf(eles[i].type) > -1 ) {
				wrapper = { type : "div", "class" : "dform-section" };
				wrapper.html = eles[i];
				eles[i] = wrapper;
			}
		}
	}
	
	// append form id to all element ids
	function _wrapIds(id, eles) {
		for( var i = 0; i < eles.length; i++ ) {
			if( eles[i].id ) eles[i].id = id + "-" + eles[i].id;
		}
	}
	
	// add required red '*' to elements
	function _addRequiredMarker(eles) {
		for(var i = 0; i < eles.length; i++ ) {
			if( eles[i].required ) {
				eles[i].caption += "<span style='color:red'>*</span>";
			}
		}
	}
	
	// create options object for radioboxes & checkboxes from provided schema
	function _addSchemaOptions(eles, schema) {
		for(var i = 0; i < eles.length; i++ ) {
			if( eles[i].options == "schema" && schema[eles[i].id] ) {
				var arr = schema[eles[i].id].sort();
				
				// if array has __*__ remove and push to end
				var tmpArr = [];
				for( var j = 0; j < arr.length; j++ ) {
					if( arr[j].match(/__.*__/) ) tmpArr.push(arr[j]);
				}
				for( var j = 0; j < tmpArr; j++ ) {
					arr.splice(arr.indexOf(tmpArr),1);
					arr.push(tmpArr[j]);
				}
				
				var options = {};
				for( var j = 0; j < arr.length; j++ ) {
					options[arr[j]] = arr[j];
				}
				eles[i].options = options;
			}
		}
	}
	
	// create help block for elements
	function _createHelp(eles) {
		for(var i = 0; i < eles.length; i++ ) {
			if( eles[i].help ) {
				eles[i].caption = "<b>"+eles[i].caption+"</b><span class='help-block'>"+eles[i].help+"</span>";
			} else if( eles[i].caption ){
				eles[i].caption = "<b>"+eles[i].caption+"</b>";
			}
		}
	}
	
	// fix up the checkboxes and radio buttons
	// clean up checkboxes that should be inputs
	function _postProcess(id) {
		var panel = $(id), $this, label, parent;
		// checkboxes
		panel.find("input[type=checkbox]").each(function(){
			$this = $(this);
			parent = $this.parent();
			label = $this.next().addClass("checkbox");
			
			label.remove();
			$this.remove();
			
			parent.append(label.prepend($this));
			
			// if it's __foo__ it's a text input (custom value)
			if( label.text().match(/__.*__/ig) ) {
				var name = label.text().replace(/_/g,'');
				var input = $("<input type='text' name='"+name+"' />");
				
				label.html(name+"&nbsp;").append(input);
				$this.css("margin-top","15px");
			}
			
			
		});
		
		panel.find("input[type=radio]").each(function(){
			$this = $(this);
			parent = $this.parent();
			label = $this.next().addClass("radio");
			
			label.remove();
			$this.remove();
			
			parent.append(label.prepend($this));
		});
		
	}
	
	function getData() {
		return _getData(id, formEles);
	}
	
	
	// return form data as json
	function _getData(id, eles) {
		// get root form data
		var data = {}, val, ele;
		var errors = [];
		
		for(var i = 0; i < eles.length; i++ ) {
			if( !eles[i].id ) continue;
			ele = eles[i];
			
			// input boxes
			if( boxTypes.indexOf(ele.type) > -1 ) {
				val = $(id+"-"+ele.id).val();
				if( val && val.length > 0 ) data[ele.id] = val; 
				
			// checkbox
			} else if ( ele.type == "checkbox" ) {
				val = false;
				if( $(id+"-"+ele.id).is(':checked') ) val = true;
				data[ele.id] = val;
			
		    // radiobuttons
			} else if ( ele.type == "radiobuttons" ) {
				var btns = $(id+"-"+ele.id).find("input[type=radio]");
				for( var j = 0; j < btns.length; j++ ) {
					if( $(btns[j]).is(':checked') ) {
						data[ele.id] = $(btns[j]).val();
						break;
					} 
				}
			
			// checkboxes
			} else if ( ele.type == "checkboxes" ) {
				var btns = $(id+"-"+ele.id).find("input[type=checkbox]");
				data[ele.id] = [];
				for( var j = 0; j < btns.length; j++ ) {
					if( $(btns[j]).is(':checked') ) {
						data[ele.id].push($(btns[j]).val());
					} 
				}
				
				// see if there is a manual input
				var input = $(id+"-"+ele.id).find("input[type=text]");
				if( input.length > 0 && input.val().length > 0) data[ele.id].push(input.val());
				
			} else if ( ele.type == "address" ) {
				var val;
				for( var j = 0; j < addressTypes.length; j++ ) {
					val = $(id+"-"+ele.id+"-"+addressTypes[j]).val();
					if( val ) data[ele.id+addressTypes[j]] = val;
				}
				
			// subform
			} else if ( ele.type == "subform" ) {
				data[ele.id] = [];
				
				if( subFormCounts[id.replace(/#/,'')+"-"+ele.id] == null ) continue;
				
				var c = subFormCounts[id.replace(/#/,'')+"-"+ele.id];
				for( var j = 0; j < c; j++ ) {
					// make sure form hasn't been removed
					if( $(id+"-"+ele.id+"-"+j).length > 0 ) {
						var tdata = _getData(id+"-"+ele.id+"-"+j, ele.form);
						if( tdata.error ) {
							for( var z = 0; z < tdata.required.length; z++ ) errors.push(tdata.required[z]);
						} else {
							data[ele.id].push(tdata);
						}
					}
				}
				
				
			}
			
		}
		
		var err = _checkRequired(data, id, eles);
		for( var i = 0; i < err.length; i++ ) {
			errors.push(err[i]);
		}
		
		if( errors.length > 0 ) {
			return {error:true,required:errors};
		}
		
			
		return data;
	}
	
	function _checkRequired(data, fid, eles) {
		var errors = [];
		
		for( var i = 0; i < eles.length; i++ ) {
			if( eles[i].required ) {
				var ele = eles[i];
				if( data[ele.id] == null ) {
					errors.push(ele.id);
				} else if ( data[ele.id] instanceof Array && data[ele.id].length == 0 ) {
					errors.push(ele.id);
				} else if ( typeof data[ele.id] === 'string' && data[ele.id] == "" ) {
					errors.push(ele.id);
				} else if ( ele.type == "checkbox" && data[ele.id] == false ) {
					errors.push(ele.id);
				} else {
					$("label[for="+fid.replace(/#/,'')+"-"+ele.id+"]").removeClass("error");
				}
			}
		}
		
		for( var i = 0; i < errors.length; i++ ) {
			// wtf? why doesn't this work?
			$("label[for="+fid.replace(/#/,'')+"-"+errors[i]+"]").addClass("error");
			
			// prepend nested id's if there is one
			if( fid != id ) errors[i] = fid.replace(id+"-","")+"-"+errors[i];
		}
		
		
		
		return errors;
	}
	
	function _setFormData(id, data, eles) {
		if( !data ) return;

		for( var i = 0; i < eles.length; i++ ) {
			var ele = eles[i];
			
			// input boxes
			if( boxTypes.indexOf(ele.type) > -1 && data[ele.id] != null ) {
				$(id+"-"+ele.id).val(data[ele.id]);
				
			// checkbox
			} else if ( ele.type == "checkbox" ) {
				if( data[ele.id] ) $(id+"-"+ele.id).prop('checked', true);
				else $(id+"-"+ele.id).prop('checked', false);
			
		    // radiobuttons
			} else if ( ele.type == "radiobuttons" && data[ele.id] != null ) {
				
				// little sanity checking
				var d = data[ele.id];
				if( d instanceof Array && d.length > 0 ) d = d[0];
				if( typeof d != "string" ) d = "";
				
				// hack for yes / no case
				if( d.toLowerCase() == "yes" || d.toLowerCase() == "yes" ) d = d.toLowerCase();
				
				$(id+"-"+ele.id).find("input[type=radio]").prop('checked',false);
				$(id+"-"+ele.id).find("input[value=\""+d+"\"]").prop('checked', true);
				
			// checkboxes
			} else if ( ele.type == "checkboxes" && data[ele.id] != null ) {
				
				// need a list of found data elements
				// if data element not found, you assume it's the 'other' value
				var insertList = [];
				
				var btns = $(id+"-"+ele.id).find("input[type=checkbox]");
				for( var j = 0; j < btns.length; j++ ) {
					var btn = $(btns[j]);
					if( data[ele.id].indexOf(btn.val()) > -1 ) {
						btn.prop('checked',true);
						insertList.push(btn.val());
					} else {
						btn.prop('checked',false);
					}
				}
				
				// see if we can find an element not inserted
				for( var j = 0; j < data[ele.id].length; j++ ) {
					if( insertList.indexOf(data[ele.id][j]) == -1 ) {
						$(id+"-"+ele.id).find("input[type=text]").val(data[ele.id][j]);
						break;
					}
				}

				
			} else if ( ele.type == "address" ) {
				
				for( var j = 0; j < addressTypes.length; j++ ) {
					if( data[ele.id+addressTypes[j]] != null ) {
						$(id+"-"+ele.id+"-"+addressTypes[j]).val(data[ele.id+addressTypes[j]]);
					} else {
						$(id+"-"+ele.id+"-"+addressTypes[j]).val("");
					}
				}
				
			// subform
			} else if ( ele.type == "subform" && data[ele.id] != null ) {
				
				// create subforms
				for( var j = 0; j < data[ele.id].length; j++ ) {
					_addSubForm(id.replace(/#/,'')+"-"+ele.id);
					_setFormData(id+"-"+ele.id+"-"+j, data[ele.id][j], ele.form);
				}
				
			}
		}
	}
	
	
	return {
		generate : generate,
		getData  : getData
	}
	
})();