/**
 * Server authentication module
 */
var GoogleStrategy = require('passport-google').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
// setup the google strategy

var rootUrl = "http://auth.cstars.ucdavis.edu:3000";

//TODO: this should be a redis or like store
var users = {};

exports.init = function(server) {
	
	server.passport.serializeUser(function(user, done) {
	  done(null, user.email);
	});

	server.passport.deserializeUser(function(id, done) {
	  if( users[id] ) return done(null, users[id]);
	  done({error:true,message:"not logged in"})
	});
	
	server.app.get('/rest/isLoggedIn', function(req, res){
		if( req.user ) {
			res.send({
				status : true,
				user   : req.user
			})
			return;
		}
		
		res.send({status:false});
	});	
	
	_setupGoogleAuth(server);
	_setupFacebookAuth(server);
	_setupTwitterAuth(server);
};

function _setupTwitterAuth(server) {
	server.passport.use(new TwitterStrategy({
	    consumerKey: "LRqsWLecmTBXqY48feEKEw",
	    consumerSecret: "6SKx9t45LAH4zjAjys6uVpyh6b8fgDvoCAWciyHWfQ",
	    callbackURL: rootUrl+"/auth/twitter/callback"
	  },
	  function(token, tokenSecret, profile, done) {
			
			var user = {
				identifier : profile.id+"",
				email      : profile.username+"@twitter.com",
				name       : profile.displayName,
				provider   : 'Twitter'
			};
			
			// TODO: load groups
			users[user.email] = user;
			
			done(null, user);
	  }
	));
	
	server.app.get('/auth/twitter', server.passport.authenticate('twitter'));

	server.app.get('/auth/twitter/callback', server.passport.authenticate('twitter', { successRedirect: '/',
	                                     	failureRedirect: '/login' }));
}

function _setupFacebookAuth(server) {
	server.passport.use(new FacebookStrategy({
	    clientID: "270667999734842",
	    clientSecret: "8014c3c923b648cac2325b0f8573f72f",
	    callbackURL: rootUrl+"/auth/facebook/callback"
	  },
	  function(accessToken, refreshToken, profile, done) {
		  console.log(profile);
		  console.log(JSON.stringify(profile));
		  
			var user = {
				identifier : profile.profileUrl,
				email      : profile.username+"@facebook.com",
				name       : profile.displayName,
				provider   : 'Facebook'
			};
			
			// TODO: load groups
			users[user.email] = user;
			
			done(null, user);
	  }
	));
	
	server.app.get('/auth/facebook', server.passport.authenticate('facebook'));

	server.app.get('/auth/facebook/callback', server.passport.authenticate('facebook', { successRedirect: '/',
	                                      failureRedirect: '/login.html' }));
}

function _setupGoogleAuth(server) {
	// setup google auth
	server.passport.use(new GoogleStrategy({
	    returnURL: rootUrl+'/auth/google/return',
	    realm: rootUrl+"/"
	  },
	  function(identifier, profile, done) {
		
		var user = {
			identifier : identifier,
			email      : profile.emails[0].value,
			name       : profile.displayName,
			provider   : 'Google'
		};
		
		// TODO: load groups
		users[user.email] = user;
		
		done(null, user);
	  }
	));
	
	
	server.app.get('/auth/google', server.passport.authenticate('google'));
	
	server.app.get('/auth/google/return',  
			server.passport.authenticate('google', { successRedirect: '/',
			                       					 failureRedirect: '/login.html' }));
}