var config = {}


const FAKE_MAIL = 0;

var expiryDate = new Date( Date.now() + 60 * 60 * 1000 ); // 1 hour



if(FAKE_MAIL)
	config.mailTRANSPORT = 'local_mail';
else
	config.mailTRANSPORT = 'mailtrap.io';


module.exports = config;
