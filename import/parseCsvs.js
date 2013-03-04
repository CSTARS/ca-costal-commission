// import all csv files.  Join like attributes and tables on orgId
var csv = require('csv');
var fs = require('fs');

var fileLocation = "/../data/20130220/"
var mainTable = "TblMain";
var joinId = "OrgID";
var contactId = "ContactID";
var files = ["TblCounties","TblCountiesList","TblIntern","TblMain", "TblContactEmails",
             "TblPhone","TblSlideShow","TblVideos","TblVolunteer", "TblContactInfo",
             "TblContactName"];
var fileData = {};

// these are attributes that should be joined, the csv's have them listed out
// __value__ means the string value, otherwise assume it's a true/false
var attrMap = {
		org_type : {
			GovAgency    : "Government", 
			NonProfit    : "Non-profit",
			Citizen      : "Citizen Group", 
			SchoolUniv   : "School/University",
			ForProfit    : "For Profit",
			OrgTypeOther : "__value__",
		},
		geo_focus : {
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
		edu_resources : {
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
		target_audiences : {
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
		alt_language_materials : {
			WrittenMaterials : "Written Materials",
			OralPresentations : "Oral Presentations",
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
			Restrooms : "Restrooms",
			PicnicArea : "Picnic Area",
			BookstoreGiftShop : "Bookstore/Gift Shop",
			Telephone         : "Telephone",
		},
		transportation : {			
			ParkingAvailability : "Parking Availability",
			PublicTransitAccess : "Public Transit Access",
			DisabledAccess : "Disabled Access"
		}
};


function parseFiles(callback) {
	var data = [], header = [], record;
	
	var parsedFiles = 0;
	
	for( var i = 0; i < files.length; i++ ) {
		parseFile(files[i], function(){
			parsedFiles++;
			if( parsedFiles == files.length ) callback();
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
			
			// map the attributes in the main table
			if( file == mainTable) {
				record = map(record);
			}

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

function map(record) {
	for( var i in attrMap ) {
		record[i] = [];
		for( var j in attrMap[i] ) {
			if( record[j] && record[j] == "TRUE" ) {
				
				if( attrMap[i][j] == "__value__")  {
					// we want the db provided value in the array
					record[i].push(record[j]);
				} else {
					// pushed map value array
					record[i].push(attrMap[i][j]);
				}
			}
			// remove the old value
			delete record[j];
		}
	}
	return record;
}

function mergeTables() {
	var main = fileData[mainTable], r;
	
	for(var i in fileData ) {
		if( i == mainTable ) continue;
		
		for( var j = 0; j < fileData[i].length; j++ ) {
			r = fileData[i][j];
			if( r[joinId] ) joinAttribute(joinId, i.replace("Tbl",""), r, main);
		}
	}
}

function joinAttribute(joinAttr, attr, value, table) {
	for( var i = 0; i < table.length; i++ ) {
		if( table[i][joinAttr] == value[joinAttr] ) {
			var record = table[i];
			
			if( record[attr] == null ) record[attr] = [];
			if( typeof record[attr] != 'array' ) record[attr] = [];
			
			delete value[joinAttr];
			
			// link external tables
			if( attr == 'ContactInfo' ) {
				linkContactInfo(value);
			}
			
			if( attr == 'Counties' ) {
				record[attr].push(value.County);
			} else {
				record[attr].push(value);
			}
			
			return;
		}
	}
}

function linkContactInfo(contact) {
	// get the phone an extension
	var phones = fileData['TblPhone'];
	for( var i = 0; i < phones.length; i++ ) {
		if( phones[i][contactId] == contact[contactId] ) {
			delete phones[i][contactId];
			if( !contact.phones ) contact.phones = [];
			contact.phones.push(phones[i]);
		}
	}
	
	var emails = fileData['TblContactEmails'];
	for( var i = 0; i < emails.length; i++ ) {
		if( emails[i][contactId] == contact[contactId] ) {
			if( !contact.emails ) contact.emails = [];
			contact.emails.push(emails[i].EmailAddress);
		}
	}
	
	var names = fileData['TblContactName'];
	for( var i = 0; i < names.length; i++ ) {
		if( names[i][contactId] == contact[contactId] ) {
			contact.cname = names[i].ContactName;
			delete contact[contactId];
			
			return;
		}
	}
	
}

exports.getData = function(callback) {
	parseFiles(function(){
		mergeTables();
		
		callback(fileData[mainTable]);
	});
}