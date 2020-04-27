// load all the things we need
var LocalStrategy    = require('passport-local').Strategy;


var one_mailer = require('../libs/one_mailer');

// load up the user model
var User       = require('../app/models/user');


 var email_reg = /^([a-zA-Z0-9_\.\-])+@([a-zA-Z0-9\-]+\.?)*\.([a-zA-Z]){2,5}$/;
 var name_reg = /[a-zA-ZА-Яа-яЇїєЄіІъЪ]/ig;
 var rus_phones = /^((\+7|7|8)+([0-9]){10})$/gm;
 var ukr_phones = /^((\+38)-?)?(\(?044|045|048|032|050|063|066|099|073|093|067|097|098|068|091|094\)?)?-?\d{3}-?\d{2}-?\d{2}$/gm;


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
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },	
  function(req, username, password, done) {
        // asynchronous
        process.nextTick(function() {
				User.findOne({ 'local.email': username }, function (err, user) {
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
		
		var name1 = req.body.name1
		console.log('name1='+name1)
		if(name1.length) name1=name1.trim()
		if(!name1.length || name1===undefined) return done(null, false, req.flash('signupMessage', 'Please enter First Name'));
		
		if(!(name_reg.test(name1))) return done(null, false, req.flash('signupMessage', 'Please enter valid chars in First Name'));
		
		
		var name2 = req.body.name2
		console.log('name2='+name2)
		if(name2.length) name2=name2.trim()
		if(!name2.length || name2===undefined) return done(null, false, req.flash('signupMessage', 'Please enter Last Name'));
		
		if(!(name_reg.test(name2))) return done(null, false, req.flash('signupMessage', 'Please enter valid chars in Last Name'));
		
		
		console.log('email='+email)
		if(email.length) email=email.trim()
		if(!email.length || email===undefined) return done(null, false, req.flash('signupMessage', 'Please enter Email'));
		
		if(!(email_reg.test(email))) return done(null, false, req.flash('signupMessage', 'Please enter valid email'));
		
		
		var phone = req.body.phone
		console.log('phone='+phone)
		if(phone.length) phone=phone.trim()
		if(!phone.length || phone===undefined) return done(null, false, req.flash('signupMessage', 'Please enter Phone'));
		
		if( //не срабатывает ни одно условие
			!(rus_phones.test(phone)) 
			&&
			!(ukr_phones.test(phone))
			)
		return done(null, false, req.flash('signupMessage', 'Please enter valid Phone'));
		
		
		
		if(!password.length || password===undefined) return done(null, false, req.flash('signupMessage', 'Please enter Password'));
		
		var password2 = req.body.pwd2
		console.log('password='+password)
		if(!password2.length || password2===undefined) return done(null, false, req.flash('signupMessage', 'Please enter Password again'));
		
		if(password != password2)
			 return done(null, false, req.flash('signupMessage', 'Please enter same Passwords'));
		
		
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
						console.log('**** email already exists ');
                        return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                    } else {

                        
				
					//check by username
					//User.findOne({ 'local.username': username }, function (err, user) {
						/*
		console.log('user')
		console.log(user)
		console.log('err')
		console.log(err)
						
					  var fnd = true
					  if (err) { return done(err); }
					  if (!user) { fnd = false; }
					  
					  if(!fnd)
					  {
						  */
						  //create user
						   var newUser = new User();
						   
						   var activatoHash = newUser.generateHash(password+'_'+Math.random())
						   //console.log(activatoHash);
						   activatoHash = activatoHash.replace(/[^[a-zA-Z0-9]]*/ig,''); 
						   //console.log('* '+activatoHash);
						   
						   //random crop letters
						   var needed_letters = 22;
						   var letters = activatoHash.length;
						   
						   var start = parseInt(Math.random()*(letters-needed_letters));
						   
						   activatoHash = activatoHash.substring(start, start + needed_letters);
						   
						   /*
							TODO: send activation email
						   */
						   
						   
							
							newUser.local = {
								email : email,
								name1 : name1,
								name2 : name2,
								phone : phone,
								role  : 'newmember',
								password : newUser.generateHash(password),
								activatoHash: activatoHash
							};
							newUser.save(function (err) {
								if (err)
									return done(err);
								
								return done(null,newUser);
							});
							
							//send activate email
							one_mailer.sendActivateEmail(email, 'http://dev001.primeauto.ltd', activatoHash);
							/*
					  }					  
					  else
						return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
					//});
					*/
					
					
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
					//User.findOne({ 'local.username': username }, function (err, user) {
					  var fnd = true
					  if (err) { return done(err); }
					  if (!user) { fnd = false; }
					  
					  if(!fnd)
					  {
						  //create user
						   var newUser = new User();
							
							newUser.local = {
								email : email,
								name1 : name1,
								name2 : name2,
								phone : phone,
								role  : 'newmember',
								password : newUser.generateHash(password),
								activatoHash: activatoHash
							};
							newUser.save(function (err) {
								if (err)
									return done(err);
								
								return done(null,newUser);
							});
							
							//send activate email
							one_mailer.sendActivateEmail(email, 'http://dev001.primeauto.ltd', activatoHash);

					  }
					  else		 
						return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
					//});
						
						
						
                    }
                });
            } else {
                // user is logged in and already has a local account. Ignore signup. (You should log out before trying to create a new account, user!)
                return done(null, req.user);
            }

        });

    }));
	

};
