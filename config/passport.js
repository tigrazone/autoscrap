// load all the things we need
var LocalStrategy    = require('passport-local').Strategy;

// load up the user model
var User       = require('../app/models/user');


module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
	/*
	passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      if (!user.verifyPassword(password)) { return done(null, false); }
      return done(null, user);
    });
  }
));
	*/
	
    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'login',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },	
  function(req, username, password, done) {
        // asynchronous
        process.nextTick(function() {
				User.findOne({ 'local.username': username }, function (err, user) {
                // if there are any errors, return the error
                if (err)
                    return done(err);

                // if no user is found, return the message
                if (!user)
                    return done(null, false, req.flash('loginMessage', 'No user found.'));

                if (!user.validPassword(password))
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));

                // all is well, return user
                else
                    return done(null, user);
				});
        });
  }
	
	/*
    function(req, email, password, done) {
        if (email)
            email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching

        // asynchronous
        process.nextTick(function() {
            User.findOne({ 'local.email' :  email }, function(err, user) {
                // if there are any errors, return the error
                if (err)
                    return done(err);

                // if no user is found, return the message
                if (!user)
                    return done(null, false, req.flash('loginMessage', 'No user found.'));

                if (!user.validPassword(password))
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));

                // all is well, return user
                else
                    return done(null, user);
            });
        });

    }
	*/
	
	));
	
	
    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    function(req, email, password, done) {
        if (email)
            email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching
		
		var username = req.body.username
		//console.log('username='+username)
		if(username.length) username=username.trim()
		if(!username.length || username===undefined) return done(null, false, req.flash('signupMessage', 'Please enter username'));
		
		console.log('req.user')
		console.log(req.user)
		
		
        // asynchronous
        process.nextTick(function() {
            // if the user is not already logged in:
            if (!req.user) {
                User.findOne({ 'local.email' :  email }, function(err, user) {
					
					
		console.log('user')
		console.log(user)
		console.log('err')
		console.log(err)
		
					
                    // if there are any errors, return the error
                    if (err)
                        return done(err);

                    // check to see if theres already a user with that email
                    if (user) {
                        return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                    } else {

                        
				
					//check by username
					User.findOne({ 'local.username': username }, function (err, user) {
						
		console.log('user')
		console.log(user)
		console.log('err')
		console.log(err)
						
					  var fnd = true
					  if (err) { return done(err); }
					  if (!user) { fnd = false; }
					  
					  if(!fnd)
					  {
						  //create user
						   var newUser = new User();
							
							newUser.local = {
								email : email,
								username : username,
								password : newUser.generateHash(password)
							};
							newUser.save(function (err) {
								if (err)
									return done(err);
								
								return done(null,newUser);
							});
					  }					  
					  else
						return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
					});
					
					
					
                    }

                });
            // if the user is logged in but has no local account...
            } else if ( !req.user.local.email ) {
                // ...presumably they're trying to connect a local account
                // BUT let's check if the email used to connect a local account is being used by another user
                User.findOne({ 'local.email' :  email }, function(err, user) {
                    if (err)
                        return done(err);
                    
                    if (user) {
                        return done(null, false, req.flash('loginMessage', 'That email is already taken.'));
                        // Using 'loginMessage instead of signupMessage because it's used by /connect/local'
                    } else {
						
				
					//check by username
					User.findOne({ 'local.username': username }, function (err, user) {
					  var fnd = true
					  if (err) { return done(err); }
					  if (!user) { fnd = false; }
					  
					  if(!fnd)
					  {
						  //create user
						   var newUser = new User();
							
							newUser.local = {
								email : email,
								username : username,
								password : newUser.generateHash(password)
							};
							newUser.save(function (err) {
								if (err)
									return done(err);
								
								return done(null,newUser);
							});
					  } else		 
						return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
					});
						
						
						
                    }
                });
            } else {
                // user is logged in and already has a local account. Ignore signup. (You should log out before trying to create a new account, user!)
                return done(null, req.user);
            }

        });

    }));
	

};
