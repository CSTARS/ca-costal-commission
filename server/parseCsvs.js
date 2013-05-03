// import all csv files.  Join like attributes and tables on orgId
var csv = require('csv');
var fs = require('fs');

var fileLocation = "/../data/20130220/"
var mainTable = "TblMain";
var joinId = "OrgID";
var contactId = "ContactID";
var files = ["TblCounties","TblCountiesList","TblIntern","TblMain", "TblContactEmails",
             "TblPhone","TblSlideShow","TblVideos","TblVolunteer", "TblContactInfo",
             "TblContactName", "officeLocations"];
var fileData = {};

var tableMap = {
		TblCounties : "counties",
		TblCountiesList : "countiesList",
		TblIntern : "internships",
		TblMain : "main",
		TblContactEmails : "emails",
		TblPhone : "phone",
		TblSlideShow : "slideShow",
		TblVideos : "videos",
		TblVolunteer : "volunteers",
		TblContactInfo : "contactInfo",
		TblContactName : "contactName",
		officeLocations : "officeLocations"
}

// these are attributes that should be joined, the csv's have them listed out
// __value__ means the string value, otherwise assume it's a true/false
var arrayAttrMap = {
		orgType : {
			GovAgency    : "Government", 
			NonProfit    : "Non-profit",
			Citizen      : "Citizen Group", 
			SchoolUniv   : "School/University",
			ForProfit    : "For Profit",
			OrgTypeOther : "__value__",
		},
		geoFocus : {
			Local         : "Local",
			Regional      : "Regional",
			StateFocus    : "State",
			National      : "National",
			International : "International",
			BioRegional   : "BioRegional"
		},
		activities : {
			Research                 : "Research",
			Education                : "Education",
			Recycling                : "Recycling",
			Enforcement              : "Enforcement",
			Advocacy                 : "Advocacy",
			Policy                   : "Policy",
			Conservation             : "Conservation",
			Tourism                  : "Tourism",
			Recreation               : "Recreation",
			Commercial               : "Commercial",
			Restoration              : "Restoration",
			Regulation               : "Regulation",
			WaterMonitoring          : "Water Monitoring",
			ResourceManagement       : "Resource Management",
			WaterPollutionPrevention : "Water Pollution Prevention",
			ActivityOther            : "__value__"
		},
		topics : {
			Wetlands                     : "Wetlands",
			Aquaculture                  : "Aquaculture",
			CulturalHistory              : "Cultural History",
			KelpForest                   : "Kelp Forest",
			Islands                      : "Islands",
			Beaches                      : "Beaches",
			RockyIntertidal              : "Rocky Intertidal",
			Wildlife                     : "Wildlife",
			Energy                       : "Energy",
			WatershedHydrology           : "Watersheds/Hydrology",
			HabitatRestoration           : "Habitat Restoration",
			EndangeredSpecies            : "Endangered Species",
			WaterQualityStormWaterRunoff : "Water Quality/Storm Water Runoff",
			BayEstuaryHabitats           : "Bay & Estuary Habitats",
			"Coastal Access"             : "Coastal Access",
			Boating                      : "Boating",
			MarineEstuaryReserves        : "Marine/Estuary Reserves & Sanctuaries",
			EnvironmentalJustice         : "Environmental Justice",
			OpenOceanOceanography        : "Open Ocean",
			SandDuneHabitats             : "Sand Dune Habitats",
			Fisheries                    : "Fisheries",
			CoastalProcesses             : "Coastal Processes",
			MarineOther                  : "__value__"
		},
		eduResources : {
			Curriculum              : "Curriculum",
			ActivityLearningKit     : "Activity/Learning Kit",
			Posters                 : "Posters",
			Maps                    : "Maps",
			OutreachPrograms        : "Program(s) at Schools",
			OnSitePrograms          : "Program(s) at our Location",
			GuidedWalks             : "Guided Walks",
			FieldTrip               : "Field Trip",
			NatureTrails            : "Nature Trails",
			Events                  : "Events",
			Publications            : "Publications",
			Newsletter              : "Newsletter",
			Brochures               : "Brochures",
			Guidebooks              : "Guidebooks",
			ExhibitsDisplay         : "Exhibits/Displays",
			Multimedia              : "Multimedia",
			WebsiteEdRes            : "Online Resources",
			LibraryLendingMaterials : "Library/Lending Materials",
			InterpretiveCenter      : "Interpretive Center",
			SpeakerLectureSeries    : "Speaker and/or Lecture Series",
			EdOther                 : "__value__"
		},
		audiences : {
			Kto3               : "Grades preK-3",
			"4to6"             : "Grades 4-6",
			"7to9"             : "Grades 7-9",
			"10to12"           : "Grades 10-12",
			Adult              : "Adult",
			Teacher            : "Teacher",
			UniversityStudents : "University Students",
			NonFormalEducator  : "Informal Educators",
			GeneralPublic      : "General Public",
			TargetOther        : "__value__"
		},
		altLanguageMaterials : {
			WrittenMaterials    : "Written Materials",
			OralPresentations   : "Oral Presentations",
			MultiMediaResources : "Multimedia resources"
		},
		training : {
			Teachers                 : "Teachers",
			DocentsVolunteers        : "Volunteers",
			Naturalist               : "Naturalist",
			StudentsInterns          : "Students/Interns",
			GeneralPublicEdInservice : "General Public",
			PolicyMakers             : "PolicyMakers"
		},
		facilities : {
			Restrooms         : "Restrooms",
			PicnicArea        : "Picnic Area",
			BookstoreGiftShop : "Bookstore/Gift Shop",
			Telephone         : "Telephone",
		},
		transportation : {			
			ParkingAvailability : "Parking Availability",
			PublicTransitAccess : "Public Transit Access",
			DisabledAccess      : "Disabled Access"
		}
};

// * nif = Not in submission form
var attrMap = {
	TblMain : {
		DateEntered : "dateEntered",
		DisabledAccessDiscription : "disabledAccess",
		EdPrograms : "eduDescription",
		FeeDescription : "feesDescription",
		Organization : "organization",
		Mission : "mission", 
		ActivityComments : "activityComments", // nif
		MarineComments : "marineComments", // nif
		DescribeLecture : "describeLecture", // nif
		EdOther : "eduOther", // nif
		EdPrograms : "eduDescription",
		GroupSize : "groupSize",
		TypeOfLanguage : "languages",
		ResourceDescription : "altLanguageResources",
		InServiceDescription : "trainingDescription", 
		ServiceFees : "fees",
		FeeDescription : "feesDescription", 
		ParkingAvailability : "parkingAvailability", // nif
		ParkingAvailabilityText : "parking",
		PublicTransitAccess : "publicTransitAccess", // nif
		PublicTransitAccessext : "publicTransit",
		DisabledAccess : "disabledAccessTf", // nif
		DisabledAccessDiscription : "disabledAccess",
		Notes : "Notes" // nif
	},
	TblContactEmails : {
		EmailAddress : "email"
	},
	TblContactInfo : {
	    Address      : "addressStreet",
	    City         : "addressCity",
	    Zip          : "addressZip",
	    EmailAddress : "email",
	    WebSite      : "website",
	    Office       : "office", // nif
	    WorkPhone    : "WorkPhone", // nif, phone is linked from phone table
	    FaxNumber    : "fax" 
	},
	TblContactName : {
		ContactName : "name"
	},
	TblCounties : {
		County : "county"
	},
	TblIntern : {
		InternProgram : "title", 
		InDescription : "description",
		InWhenNeeded : "timeOfYear",
		InQualifications : "qualifications",
		InApplication : "applicationProcedure",
		Housing : "housingProvided",
		HousingDepends : "HousingDepends", // nif
		PaidInternship : "paid",
		PaidDepends : "paidDepends", // nif
		Stipend : "stipend",
		StipendDepends : "stipendDepends", // nif
		Credit : "academicCredit", 
		CreditDepends : "creditDepends", // nif
		InContactName : "contactName",
		InWorkPhone : "contactPhone",
		InExtension : "contactExt",
		InEmailAddress : "contactEmail",
		NumberOfInterns : "numberAvailable"
	},
	TblPhone : {
		Phone : "phone",
		Extension : "ext"
	},
	TblVolunteer : {
		VolProgram : "title",
		VPDescription : "description",
		VPWhenNeeded : "timeOfYear",
		VPQualifications : "qualifications",
		VPCommittmentRequired : "commitment",
		VPApplicationTraining : "applicationProcedure",
		VPCommServiceDoc : "documentation",
		VPContact : "contactName",
		VPWorkPhone : "contactPhone",
		VPExtension : "contactExt",
		VPEmailAddress : "contactEmail"
	}

}


function parseFiles(callback) {
	var data = [], header = [], record;
	
	var parsedFiles = 0;
	
	for( var i = 0; i < files.length; i++ ) {
		parseFile(files[i], function(){
			parsedFiles++;
			if( parsedFiles == files.length ) {
				callback();
			}
		});
	}
}

function parseFile(file, callback) {
	var record, header;
	fileData[file] = [];
	
	console.log(__dirname+fileLocation+file+'.csv');
	
	csv()
	.from( fs.createReadStream(__dirname+fileLocation+file+'.csv', {encoding: 'utf8'}))
	.on('record', function(row, index) {
		if( index == 0 ) {
			header = row;
		} else {
			record = {};
			for( var i = 0; i < header.length; i++ ) {
				if( row[i] && row[i] != 'null' ) {
					record[header[i]] = row[i];
				}
			}

			record = map(file, record);

			fileData[file].push(record);	
		}
	})
	.on('error', function(error){
	  console.log("Error parsing: "+file);
	  console.log(error);
	})
	.on('end', function(){
		callback();
	});
}

function map(file, record) {
	var newRecord = {};
	
	if( record[joinId] ) newRecord[joinId] = record[joinId];
	if( record[contactId] ) newRecord[contactId] = record[contactId];
	
	if( file == "officeLocations")  {
		return record;
	}
	
	// map keys
	if( attrMap[file] ) {
		var map = attrMap[file];
		for( var i in record ) {
			if( map[i] ) {
				newRecord[map[i]] = record[i];
			}
		}
	}
	
	// map array values 
	if( file == "TblMain")  {
		for( var i in arrayAttrMap ) {
			newRecord[i] = [];
			for( var j in arrayAttrMap[i] ) {
				if( record[j] && record[j] == "TRUE" ) {
					
					if( arrayAttrMap[i][j] == "__value__")  {
						// we want the db provided value in the array
						newRecord[i].push(record[j]);
					} else {
						// pushed map value array
						newRecord[i].push(arrayAttrMap[i][j]);
					}
				}
			}
		}
	}
	
	
	// quick fixes
	if( file == "TblIntern" ) {
		if( newRecord.contactPhone && newRecord.contactExt ) {
			newRecord.contactPhone += ", Ext. " + newRecord.contactExt 
			delete newRecord.contactExt;
		}
	} else if( file == "TblVolunteer" ) {
		if( newRecord.contactPhone && newRecord.contactExt ) {
			newRecord.contactPhone += ", Ext. " + newRecord.contactExt 
			delete newRecord.contactExt;
		}
	} else if ( file == "TblPhone" ) {
		if( newRecord.phone && newRecord.ext ) {
			newRecord.phone += ", Ext. " + record.ext 
			delete newRecord.ext;
		}
	} else if ( file == "TblMain" ) {
		if( newRecord.fees != null ) {
			if( newRecord.fees == "TRUE" ) newRecord.fees = "yes";
			else newRecord.fees = "no";
		}
		
	}
	
	
	return newRecord;
}

function mergeTables() {
	var main = fileData[mainTable], r;
	
	for(var i in fileData ) {
		if( i == mainTable ) continue;
		
		for( var j = 0; j < fileData[i].length; j++ ) {
			r = fileData[i][j];
			if( r[joinId] ) joinAttribute(joinId, tableMap[i], r, main);
		}
	}
}

function joinAttribute(joinAttr, attr, value, table) {
	for( var i = 0; i < table.length; i++ ) {
		if( table[i][joinAttr] == value[joinAttr] ) {
			
			delete value[joinAttr];
			
			// make sure this value has some other key, other than 'joinAttr'
			var hasKey = false;
			for( var key in value ) {
				hasKey = true;
				break;
			}
			if( !hasKey ) return;
					
			var record = table[i];
			
			if( record[attr] == null ) record[attr] = [];
			if( typeof record[attr] != 'array' ) record[attr] = [];

			
			// link external tables
			if( attr == 'contactInfo' ) {
				linkContactInfo(value, table[i].organization);
			}
			
			if( attr == 'counties' ) {
				record[attr].push(value.county);
			} else {
				record[attr].push(value);
			}
			
			return;
		}
	}
}

function linkContactInfo(contact, orgName) {
	// get the phone an extension
	var phones = fileData['TblPhone'];
	for( var i = 0; i < phones.length; i++ ) {
		if( phones[i][contactId] == contact[contactId] ) {
			//delete phones[i][contactId];
			if( !contact.phone ) contact.phone = phones[i].phone;
			else if( !contact.altPhone ) contact.altPhone = phones[i].phone;
		}
	}
	
	var emails = fileData['TblContactEmails'];
	for( var i = 0; i < emails.length; i++ ) {
		if( emails[i][contactId] == contact[contactId] ) {
			if( !contact.email ) contact.email = emails[i].email;
		}
	}
	
	var names = fileData['TblContactName'];
	for( var i = 0; i < names.length; i++ ) {
		if( names[i][contactId] == contact[contactId] ) {
			contact.name = names[i].name;
			break;
		}
	}
	
	var counties = fileData['officeLocations'];
	for( var i = 0; i < counties.length; i++ ) {
		if( counties[i]["Organization"] == orgName ) {
			contact.county = counties[i].County1;
			counties.splice(i,1);
			break;
		}
	}
	
	delete contact[contactId];
}

exports.getData = function(callback) {
	parseFiles(function(){
		mergeTables();
		
		console.log("Unmatched Counties: ");
		console.log(fileData['officeLocations']);
		callback(fileData[mainTable]);
	});
}