module.exports = function(app, passport) {

var request = require('request');

// load up the yard model
var Yard       = require('../app/models/yard');

app.use('*', function(req, res, next)
{
	next();
});



// на основе материала статьи https://medium.com/the-node-js-collection/simple-server-side-cache-for-express-js-with-node-js-45ff296ca0f0
//////////// MEMORY CACHE
	
var mcache = require('memory-cache');

var cache = (duration) => {
  return (req, res, next) => {
    let key = '__express__' + req.originalUrl || req.url
    let cachedBody = mcache.get(key)
    if (cachedBody) {
      res.send(cachedBody)
      return
    } else {
      res.sendResponse = res.send
      res.send = (body) => {
        mcache.put(key, body, duration * 1000);
        res.sendResponse(body)
      }
      next()
    }
  }
}

//////////// MEMORY CACHE end



    // show the home page (will also have our login links)
    app.get('/', function(req, res) {		
		    if (!req.isAuthenticated())
			{				
				res.redirect('/login');
				return;
			}
	
			res.render('index');
    });

	
    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function(req, res) {
		console.log('req.user');
		console.log(req.user);
		
        res.render('profile', {
            user : req.user
        });
    });
	
	app.get('/scrapping', function(req, res) {

		var URL = 'https://inventory.copart.io/v1/list';

		request(URL, function (err, res, body) {
			if (err) throw err;
			
			//console.log(body);
			//console.log(res.statusCode);
			
			var results = JSON.parse(body);
			//console.log(results);
			
			var added = 0;
			
			for(ri in results)
			{
				var resu = results[ri];
				
				var rrr = resu;
				
					  {
						  //create yard
						   var newYard = new Yard();
							
							newYard.local = rrr;
							newYard.save(function (err) {
								if (err)
								{
									//return done(err);
									console.log('ERROR');
									console.log(err);
									return false;
								}
								
								//return done(null,newYard);
								
								added++;
								
								return true;
							});
					  }
					  
			}
			
			console.log('yards added: '+added);
		});

	});
	

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', cache(10), function(req, res) {		
		    if (req.isAuthenticated())
			{				
				res.redirect('/');
				return;
			}
			
			var msgs = req.flash('loginMessage')		
			console.log("req.flash('loginMessage')")
			console.log(msgs)
			
			res.render('login', { message: msgs });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', cache(10), function(req, res) {	
		    if (req.isAuthenticated())
			{				
				res.redirect('/');
				return;
			}
			
            res.render('signup', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
