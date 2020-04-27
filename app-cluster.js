/*
	кластерная версия сервера с ручным управлением удалением мусора node.js
	кластер даёт возможность перезапускать сервер сразу же после падения, 
	запускается несколько копий сервера и запросы обрабатываются быстрее,
	что значительно увеличивает надёжность и пропускную способность сайта
	основано на материалах видеоуроков 
	"Настройка Express App. Запуск сервера в кластерном режиме. Управление Garbage Collector." https://www.youtube.com/watch?v=qjTR1v1rA9c и
	"Разгоняем Node.js backend" https://www.youtube.com/watch?v=GO2oBomdcMY
	
	используется шаблонный движок gaikan, не jade/pug и не ejs
	по тестам он гораздо быстрее других, и достаточно удобен, легко делать layout и блоки
*/

var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');

var express    = require('express');

var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

var configDB = require('./config/database.js');


// Initialize the gaikan module.
var gaikan = require('gaikan');

var   path = require('path')
	, favicon = require('serve-favicon')
	, cluster = require('cluster')
	, compression = require('compression')
	, os = require('os')
	;



// Initialize the application.
var app = express();

//console.log(path.join(__dirname, 'public')+'/favicon.ico');
app.use(favicon(path.join(__dirname, 'public')+'/favicon.ico'));

console.log('require(os).cpus()')
console.log(os.cpus().length)
console.log(os.cpus())

process.env.NODE_ENV = 'production';

var clusterIDD = 0;

if(cluster.isMaster)
{
	//var cpuCount = os.cpus().length;
	var cpuCount = 2; //2 процессa записутить
	
	for(var i=0;i<cpuCount; i++)
	{
		cluster.schedulingPolicy = cluster.SCHED_NONE;
		clusterIDD++;
		
		cluster.fork();
	}
	
	cluster.on('exit', function(worker) {
		console.log('Worker '+worker.id+' died :(');
		//start new thread
		clusterIDD++;
		
		//cluster.fork();
	});
}
else
{

var wID = 0;
	
if (cluster.isWorker) 
{
  console.log('I am worker #' + cluster.worker.id);
  wID = cluster.worker.id;
}


/******* GARBAGE ********/
var gcInterval;
function init()
{
	gcInterval = setInterval(function() {gcDo(); }, 60000);
}

function gcDo()
{
	global.gc();
	clearInterval(gcInterval);
	init();
}

init();

/************************/

	


var port = (process.env.PORT || 8080);	
	

app.use(compression()); //gzip on


app.use(favicon(path.join(__dirname, 'public')+'/favicon.ico'));


// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));



// Configure gaikan to use the layout.
gaikan.options.layout = 'layout';
// Configure express to default to the html extension.
app.set('view engine', '.html');
// Configure express to use the gaikan template engine.
app.engine('html', gaikan);



// <<<<<<< HEAD
// =======
var one_mailer = require('./libs/one_mailer');
var config = require('./libs/config');
var nodemailer = require('nodemailer');

var bcrypt   = require('bcrypt-nodejs');

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
//one_mailer.sendActivateEmail('tigrazone@ukr.net', 'http://dev001.primeauto.ltd', activatoHash);
//one_mailer.sendActivateEmail('tigrazone@gmail.com');




// >>>>>>> ff8bc9e3f1184fe6855e3fa63630adb58a72bacc
var myconfig_session = {
    "secret": "nodeJSForever",
    "key": "sid",
    "cookie": {
        "httpOnly": true,
        "maxAge": null
    }
};

// required for passport
// идея о хранилище сессий в mongodb взята из видеоурока https://www.youtube.com/watch?v=QUgyb-NvLe8	
var sessionStore = require('./libs/sessionStore');
    app.use(session({
        secret: myconfig_session.secret,
        key: myconfig_session.key,
        cookie: myconfig_session.cookie,
        store: sessionStore,
		resave: true,
		saveUninitialized: true
    }));
	

//инициализация passport и всплывающих сообщений
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session


app.use(express.static(path.join(__dirname, 'public')));

// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport


//errors
app.use(function(err, req, res, next) {
  // NODE_ENV = 'production'
  if (app.get('env') == 'development') {
    var errorHandler = express.errorHandler();
    errorHandler(err, req, res, next);
  } else {
    res.sendStatus(404);
  }
});



// launch ======================================================================

app.listen(port, function() {
    console.log("The magic happens on port " + port);
});
}