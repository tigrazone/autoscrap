module.exports = function(app, passport) {

var bcrypt   = require('bcrypt-nodejs');

var one_mailer = require('../libs/one_mailer');

var elastic = require('../libs/elastic');
var scrapping = require('../libs/scrapping');

// load up the lot model
var Lot  = require('../app/models/lot');
var User  = require('../app/models/user');
var Order  = require('../app/models/order');

app.use('*', function(req, res, next)
{	
    // req.session.flash = [];
	
	console.log('req.originalUrl');
	console.log(req.originalUrl);

	if(req.query.hasOwnProperty('logout'))
	{		
        req.logout();
	}
	
		
		
	next();
});



// на основе материала статьи https://medium.com/the-node-js-collection/simple-server-side-cache-for-express-js-with-node-js-45ff296ca0f0
//////////// MEMORY CACHE
	
var mcache = require('memory-cache');
/*
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
*/
//////////// MEMORY CACHE end


/*
if (process.getuid) {
  console.log(`Current uid: ${process.getuid()}`);
}
*/

//console.log('wID='+wID);
/*
console.log('this');
console.log(this);
*/

console.log('this.process.pid='+this.process.pid);


    // show the home page (will also have our login links)
    app.get('/', function(req, res) {		
		/*
		    if (!req.isAuthenticated())
			{				
				res.redirect('/login');
				return;
			}
			*/
			
			console.log("req.isAuthenticated()="+(req.isAuthenticated()));
			console.log("req.user");
			console.log(req.user);
	
			if(req.isAuthenticated())
			res.render('index',{ 
				title: '*',
				user_id	: req.user._id,
				user_role: req.user['local']['role']
			});
			else
			res.render('index',{ 
				title: '*',
				user_id	: '',
				user_role: ''
			});
    });
	
	
	//////////////////////////////////////////////////
/*

        product_id	 : String,
        user_id		 : String,
		status		 : String,

		comment		 : String,
		created_ts	 : Number,
		
		started_ts	 : Number,
		started_who	 : String,
		
		done_ts		 : Number,
		statusChangees	 : []

*/

	
    app.post('/make_order/:lot_id', isLoggedIn,  function(req, res) {
		
		var lot_id = req.params.lot_id;
		var uid = req.user._id;
		var comment = req.body.comment;
		var ts = new Date().getTime();
		
		Lot.findById(lot_id, function(err, alot) {
		
		if(alot)
		{
			var an_order = []
			an_order['product_id'] 	= lot_id;
			an_order['user_id'] 	= uid;
			an_order['status'] 		= 'new';
			an_order['comment'] 	= comment;
			an_order['created_ts'] 	= ts;
										
										var query = {},
											options = { upsert: true };
											update = an_order;
										
											//store order
											Order.update(query, update, options, function(err) {
															if(err) { throw err; }
															//...
														}
													);
													
			res.sendStatus(200);
		}
		else
		{
			res.sendStatus(400);
		}
		
	}
	);

}
);


	//////////////////////////////////////////////////
	
	
	
    app.get('/users', isLoggedInADMIN,  function(req, res) {
		
		User.find({}, function(err, users) {

		var usrs = users.length;
		console.log('users: '+usrs);
		
			res.render('users',{ 
				title: 'primeauto users',
				usrs: users,
				user_id	: req.user._id,
				user_role: req.user['local']['role']
			});
			
				}
				);

}
);
	
    app.get('/chrole/:uid/:newrole', isLoggedInADMIN,  function(req, res) {
		
		var idd = req.params.uid;
		var newrole = req.params.newrole;
		
		console.log('/chrole/'+idd+'/'+newrole);
		
		User.findById(idd, function(err, user) {
		
		if(user)
		{
			user['local']['role'] = newrole;
										
										var query = { '_id': idd  },
											options = { upsert: true };
											update = user;
										
											//store user
											User.update(query, update, options, function(err) {
															if(err) { throw err; }
															//...
														}
													);
													
			res.sendStatus(200);
		}
		else
		{
			res.sendStatus(400);
		}
		
	}
	);

}
);
	
    app.get('/activate/:uid', isLoggedInADMIN,  function(req, res) {
		
		var idd = req.params.uid;
		
		console.log('/activate/'+idd);
		
		User.findById(idd, function(err, user) {
		
		if(user)
		{
			
			
			user['local']['role'] = 'member';
			user['local']['activatoHash'] = '';			
										
										var query = { '_id': user['_id']  },
											options = { upsert: true };
											update = user;
										
											//store user
											User.update(query, update, options, function(err) {
															if(err) { throw err; }
															//...
														}
													);
													
			res.sendStatus(200);
		}
		else
		{
			res.sendStatus(400);
		}
		
	}
	);

}
);
	
    app.get('/resend-act-email/:uid', isLoggedInADMIN,  function(req, res) {
		
		var idd = req.params.uid;
		
		console.log('/resend-act-email/'+idd);
		
		User.findById(idd, function(err, user) {
		
		if(user)
		{
			
							var activatoHash = 
							bcrypt.hashSync(
									'_'+Math.random()
									, bcrypt.genSaltSync(8), null
							);

						   //console.log(activatoHash);
						   activatoHash = activatoHash.replace(/[^[a-zA-Z0-9]]*/ig,''); 
						   //console.log('* '+activatoHash);
						   
						   //random crop letters
						   var needed_letters = 22;
						   var letters = activatoHash.length;
						   
						   var start = parseInt(Math.random()*(letters-needed_letters));
						   
						   activatoHash = activatoHash.substring(start, start + needed_letters);
						   

							//send activate email
							one_mailer.sendActivateEmail(user['local']['email'], 'http://dev001.primeauto.ltd', activatoHash);
			
							user['local']['role'] = 'newmember';			
							user['local']['activatoHash'] = activatoHash;			
										
										var query = { '_id': user['_id']  },
											options = { upsert: true };
											update = user;
										
											//store user
											User.update(query, update, options, function(err) {
															if(err) { throw err; }
															//...
														}
													);
													
			res.sendStatus(200);
		}
		else
		{
			res.sendStatus(400);
		}
		
	}
	);

}
);
	
	//////////////////////////////////////////////////
	
	
	
	
	
	
	
    app.get('/confirm/:acthash', function(req, res) {
		console.log('/confirm/:acthash');
			var actHash = req.params.acthash;
		
		//console.log(
			
	  User.find({'local.activatoHash' : actHash, 'local.role': 'newmember'}, function(err, users) {
		
		var usrs = users.length;
		console.log('users: '+usrs);
		
		if(!usrs)
		{
			res.render('activate_not_found',{ 
				title: 'primeauto user activation',
				user_id	: '',
				user_role: ''
			});			
		}
		else
		if(usrs != 1)
		{
			res.render('activate_not_found',{ 
				title: 'primeauto user activation',
				user_id	: '',
				user_role: ''
			});			
		}
		else
		{
			var user = users[0];
			
			user['local']['role'] = 'member';
			user['local']['activatoHash'] = '';			
										
										var query = { '_id': user['_id']  },
											options = { upsert: true };
											update = user;
										
											//store user
											User.update(query, update, options, function(err) {
															if(err) { throw err; }
															//...
														}
													);
													
			
			res.render('activate_ok',{ 
				title: 'primeauto user activation',
				user_id	: '',
				user_role: ''
			});
		}
			
    });
	
});


    app.get('/forget', isNOTLoggedIn,  function(req, res) {
		
			res.render('forget',{ 
				title: 'primeauto user forget password',
				user_id	: '',
				user_role: ''
			});
	}
	);
	
    app.post('/forget', isNOTLoggedIn,  function(req, res) {
			var query = req.body;
			if(query.hasOwnProperty('email'))
			{
				User.find({'local.email': query.email}, function(err, users) {
					
					
		var usrs = users.length;
		console.log('users: '+usrs);
		
		if(!usrs)
		{
			res.render('forget_email_not_found',{ 
				title: 'primeauto user forget password',
				user_id	: '',
				user_role: ''
			});			
		}
		else
		if(usrs != 1)
		{
			res.render('forget_email_not_found',{ 
				title: 'primeauto user forget password',
				user_id	: '',
				user_role: ''
			});			
		}
		else
		{
			var user = users[0];
			
var activatoHash = 
bcrypt.hashSync(
		'_'+Math.random()
		, bcrypt.genSaltSync(8), null
);

						   //console.log(activatoHash);
						   activatoHash = activatoHash.replace(/[^[a-zA-Z0-9]]*/ig,''); 
						   //console.log('* '+activatoHash);
						   
						   //random crop letters
						   var needed_letters = 22;
						   var letters = activatoHash.length;
						   
						   var start = parseInt(Math.random()*(letters-needed_letters));
						   
						   activatoHash = activatoHash.substring(start, start + needed_letters);
	
						   
			user['local']['activatoHash'] = activatoHash;
										
										var query = { '_id': user['_id']  },
											options = { upsert: true };
											update = user;
										
											//store user
											User.update(query, update, options, function(err) {
															if(err) { throw err; }
															//...
														}
													);
													
			
			
			
			res.render('forget_email_ok',{ 
				title: 'primeauto user forget password',
				user_id	: '',
				user_role: ''
			});
		}
				}
				);
	}
}
);
	
    app.get('/forget/:hash', isNOTLoggedIn,  function(req, res) {
			var actHash = req.params.hash;			
			
	  User.find({'local.activatoHash' : actHash }, function(err, users) {
		
		var usrs = users.length;
		console.log('users: '+usrs);
		
		if(!usrs)
		{
			res.render('forget_not_found',{ 
				title: 'primeauto user forget password',
				user_id	: '',
				user_role: ''
			});
		}
		else
		if(usrs != 1)
		{
			res.render('forget_not_found',{ 
				title: 'primeauto user forget password',
				user_id	: '',
				user_role: ''
			});			
		}
		else
		{
			var user = users[0];
			
			if(user.role == 'newmember')
			{
			res.render('activate_not_found',{ 
				title: 'primeauto user activation',
				user_id	: '',
				user_role: ''
			});	
				
			}
			
var activatoHash = 
bcrypt.hashSync(
		'_'+Math.random()
		, bcrypt.genSaltSync(8), null
);
	
						   
			var password = activatoHash;
							
			user['local'].password = password;
								
								
			user['local'].role = 'member';
			user['local'].activatoHash = '';
			
										
										var query = { '_id': user['_id']  },
											options = { upsert: true };
											update = user;
										
											//store user
											User.update(query, update, options, function(err) {
															if(err) { throw err; }
															//...
														}
													);
													
			
			
			one_mailer.sendForgetOkEmail(user.email, 'http://dev001.primeauto.ltd', password);
			
			res.render('forget_ok',{ 
				title: 'primeauto forget password',
				user_id	: '',
				user_role: ''
			});
		}
			
    });
	
});


    app.get('/admino', isLoggedInADMINorMGR, function(req, res) {		
			res.render('admino',{ 
				title: 'primeauto links',
				user_id	: req.user._id,
				user_role: req.user['local']['role']
			});
    });

	
    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function(req, res) {
		console.log('req.user');
		console.log(req.user);
		
		console.log('req.user[local.role]');
		console.log(req.user['local']['role']);
		
        res.render('profile', {
            user : req.user,
			title: 'Profile',
				user_id	: req.user._id,
				user_role: req.user['local']['role']
        });
    });
	
	
	
	//indexate
    app.get('/indexate', isLoggedInADMINorMGR, function(req, res) {
		console.log('indexate!');
			
	  Lot.find({}, function(err, all_lots) {
		  
		console.log('lots: '+all_lots.length);  
			
		//в body запишу объединенный текст - название и модель
		for(loti in all_lots) 
		{
		  var lot = all_lots[loti];	
		  all_lots[loti]['body'] = lot['lotMakeDesc']+' '+lot['lotModelDesc'];
		}
		
		elastic.bulkIndex('lots', 'lot', all_lots, req, res);
		
		
	  });
    });
	
	//show_indexed
    app.get('/show_indexed', function(req, res) {
			
		//indices();
		
		var response;
		elastic.esClient.cat.indices({v: true})
		.then(function(value){
			response = value;
			//response = response.replace('/\s+/','<td>');
						
			res.render('show_indexed', {
				resp: response,
				title: 'elasticsearch statistics',
				user_id	: req.user._id,
				user_role: req.user['local']['role']
			});
		});
    });
	
	app.get('/lot/:lotid', function(req, res) {
    //res.send(req.params.lotid);
	
	Lot.findById(req.params.lotid, function(err, alot) {
		console.log('LOT FOUND:')
		console.log(alot)
		
		var imagesk = [];
		var images = [];
		var li, lli
		
		if(alot)
		{
			if(('lotImagesDetails' in alot) && !(alot.lotImagesDetails===undefined)) //javascript is SHIT sometimes
					{
						if(alot.lotImagesDetails.hasOwnProperty('lotImages'))
						{
							for(li in alot.lotImagesDetails['lotImages'])
							{
								var lnk_ = alot.lotImagesDetails['lotImages'][li]['link']
								
								for(lli in lnk_)
								{	
									var lnk = lnk_[lli]
									if(!lnk.isThumbNail)
									imagesk[lnk['url']] = '';
								}		
							}
						}
					}
			
			for(li in imagesk) images.push(li) 
		}

		/*
		console.log('images')
		console.log(images)
		*/
		
		
		var options = {
		  era: 'narrow',
		  year: 'numeric',
		  month: 'short',
		  day: 'numeric',
		  weekday: 'short',
		  timezone: 'short',
		  hour: 'numeric',
		  minute: 'numeric',
		  second: 'numeric'
		};

		var dat = new Date(alot['auctionDateUtc']);
		var ddd =  dat.toLocaleString("en-US", options);
		ddd = ddd.replace("A, ", " ");
		
		if(req.isAuthenticated())
		res.render('lotpage', {
			lot: alot, 
			images: images,
			title: alot.lotYear+' '+alot.lotMakeDesc+' '+alot.lotModelDesc+' | '+'lot #'+alot.lotNumber,
			dat: ddd
			//dat: dat.toString()
			//dat: getWeekDay(dat)+' '+formatDate(dat)
			,
				user_id	: req.user._id,
				user_role: req.user['local']['role']
			});
		else
		res.render('lotpage', {
			lot: alot, 
			images: images,
			title: alot.lotYear+' '+alot.lotMakeDesc+' '+alot.lotModelDesc+' | '+'lot #'+alot.lotNumber,
			dat: ddd
			//dat: dat.toString()
			//dat: getWeekDay(dat)+' '+formatDate(dat)
			,
				user_id	: '',
				user_role: ''
			});
	});
  });
  
	
	//search
    app.get('/search', function(req, res) {
			
		var q='';
		if(req.query.hasOwnProperty('q'))
			q = req.query['q'];
		if(q.length) q=q.trim();
		
		var params = {};
		
		if(req.query.hasOwnProperty('make'))
			params.make = req.query.make;
		
		if(req.query.hasOwnProperty('model'))
			params.model = req.query.model;
		
		if(req.query.hasOwnProperty('color'))
			params.color = req.query.color;
		
		if(req.query.hasOwnProperty('damage'))
			params.damage = req.query.damage;
		
		params.year1 = -1;
		params.year2 = -1;
		
		params.byin1 = -1;
		params.byin2 = -1;
		
		if(req.query.hasOwnProperty('year1'))
			params.year1 = req.query.year1;
		
		if(req.query.hasOwnProperty('year2'))
			params.year2 = req.query.year2;
		
		if(req.query.hasOwnProperty('byin1'))
			params.byin1 = req.query.byin1;
		
		if(req.query.hasOwnProperty('byin2'))
			params.byin2 = req.query.byin2;
		
		elastic.search(q, params, req, res);
    });
	
	app.get('/scrapping', isLoggedInADMINorMGR, function(req, res) {
		
		scrapping.start();
		
		res.render('scrapping',{
			  title: 'scrapping',
				user_id	: req.user._id,
				user_role: req.user['local']['role']
		});

	});
	
	app.get('/_only_admins', function(req, res) {
				
		res.render('_only_admins',{
			  title: 'access denied',
				user_id	: req.user._id,
				user_role: req.user['local']['role']
		});

	});
	
	app.get('/_only_admins_managers', function(req, res) {
				
		res.render('_only_admins_managers',{
			  title: 'access denied',
				user_id	: req.user._id,
				user_role: req.user['local']['role']
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
        app.get('/login', function(req, res) {		
		    if (req.isAuthenticated())
			{				
				res.redirect('/profile');
				return;
			}
			
			var msgs = req.flash('loginMessage')		
			console.log("req.flash('loginMessage')")
			console.log(msgs)
			
			res.render('login', { 
				message: msgs, 
				title: 'Login',
				user_id	: '',
				user_role: ''
			  });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {	
		    if (req.isAuthenticated())
			{				
				res.redirect('/profile');
				return;
			}
			
			console.log("req.flash('signupMessage')");
			console.log(req.flash('signupMessage'));
			console.log(req.flash());
			
            res.render('signup', {
				message: req.flash('signupMessage'), 
				title: 'Sign up',
				user_id	: '',
				user_role: ''
				});
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
	{
		if(req.user['local']['role'] != 'newmember')
			return next();
		else
			res.redirect('/newmember');
			
	}

    res.redirect('/login');
}

// route middleware to ensure user is logged in ADMIN
function isLoggedInADMIN(req, res, next) {
    if (req.isAuthenticated())
	{
		if(req.user['local']['role'] == 'admin')
			return next();
		else
			res.redirect('/_only_admins');
			
	}

    res.redirect('/login');
}

// route middleware to ensure user is logged in ADMIN
function isLoggedInADMINorMGR(req, res, next) {
    if (req.isAuthenticated())
	{
		if(req.user['local']['role'] == 'admin' || req.user['local']['role'] == 'manager')
			return next();
		else
			res.redirect('/_only_admins_managers');
			
	}

    res.redirect('/login');
}

// route middleware to ensure user is NOT logged in
function isNOTLoggedIn(req, res, next) {
    if (!req.isAuthenticated())
        return next();

    res.redirect('/');
}
