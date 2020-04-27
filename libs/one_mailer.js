
const nodemailer = require('nodemailer');


var config = require('../libs/config');

var transporter;

switch(config.mailTRANSPORT)
{
	case 'mailtrap.io':

							var transporter = nodemailer.createTransport({
							  host: "smtp.mailtrap.io",
							  port: 2525,
							  auth: {
								user: "802fdcc54b5193",
								pass: "90dcf9ec296f62"
							  }
							});
							
break;
}

function sendActivateEmail(email, siteADDR, code)
{
	var txt = `Hello!
	<table class="body-wrap" style="margin: 0; padding: 0; box-sizing: border-box; font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; color: #8F9BB3; font-size: 14px; line-height: 22px; width: 100%; background-color: white;">
    <tbody><tr style="margin: 0; padding: 0; box-sizing: border-box; font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; color: #8F9BB3; font-size: 14px; line-height: 22px;">
      <td style="margin: 0; padding: 0; box-sizing: border-box; font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; color: #8F9BB3; font-size: 14px; line-height: 22px; vertical-align: top;"></td>
      <td width="400" class="container" style="font-size: 14px; box-sizing: border-box; font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; color: #8F9BB3; padding: 0; line-height: 22px; vertical-align: top; margin: 0 auto; display: block; max-width: 400px; clear: both;">
        <div class="content" style="padding: 0; box-sizing: border-box; font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; color: #8F9BB3; font-size: 14px; line-height: 22px; margin: 0 auto; max-width: 400px; display: block;">
          <table width="100%" cellpadding="0" cellspacing="0" class="main" style="margin: 0; padding: 0; box-sizing: border-box; font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; color: #8F9BB3; font-size: 14px; line-height: 22px;">
            <tbody><tr style="margin: 0; padding: 0; box-sizing: border-box; font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; color: #8F9BB3; font-size: 14px; line-height: 22px;">
              <td class="logo" style="margin: 0; padding: 0; box-sizing: border-box; font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; color: #8F9BB3; font-size: 14px; line-height: 22px; vertical-align: top; text-align: center;">
                <img src="https://privacy.com/assets/images/email/logo.png" width="120" style="padding: 0; box-sizing: border-box; font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; color: #8F9BB3; font-size: 14px; line-height: 22px; max-width: 100%; margin: 30px 0;">
              </td>
            </tr>
            <tr style="margin: 0; padding: 0; box-sizing: border-box; font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; color: #8F9BB3; font-size: 14px; line-height: 22px;">
              <td class="content-wrap" style="margin: 0; padding: 0; box-sizing: border-box; font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; color: #8F9BB3; font-size: 14px; line-height: 22px; vertical-align: top;">
                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0; padding: 0; box-sizing: border-box; font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; color: #8F9BB3; font-size: 14px; line-height: 22px;">
                  <tbody><tr style="margin: 0; padding: 0; box-sizing: border-box; font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; color: #8F9BB3; font-size: 14px; line-height: 22px;">
                    <td class="content-block" style="font-size: 14px; margin: 0; box-sizing: border-box; line-height: 22px; vertical-align: top; color: #8F9BB3; padding: 20px 0; font-family: 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; background: #ffffff; border-radius: 3px; box-shadow: 0 0 0 1px #D8DDE2;">
                      <p style="margin: 0; box-sizing: border-box; font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; color: #8F9BB3; font-size: 14px; line-height: 22px; font-weight: normal; margin-bottom: 0; padding: 0 20px;"><strong style="margin: 0; padding: 0; box-sizing: border-box; font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 22px; color: #596C80;">Please <a href="`+siteADDR+`/confirm/`+code+`">`+
					  `confirm your email address</a> <a href="`+siteADDR+`/confirm/`+
					  code+`">`+siteADDR+
					  `/confirm/`+code+
					  `</a></strong>,
                        to activate your account. If you received this by mistake or weren't expecting it, please disregard this email.</p>
                    </td>
                  </tr>
                  <tr style="margin: 0; padding: 0; box-sizing: border-box; font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; color: #8F9BB3; font-size: 14px; line-height: 22px;">
                    <td class="action" style="margin: 0; padding: 0; box-sizing: border-box; font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; color: #8F9BB3; font-size: 14px; line-height: 22px; vertical-align: top; padding-top: 20px;">
                      <a href="`+siteADDR+`/confirm/`+code+`" class="btn-primary" style="line-height: 22px; margin: 0; box-sizing: border-box; font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; color: #ffffff; font-size: 18px; padding: 20px; display: block; font-weight: bold; background: #00E056; border-radius: 3px; text-decoration: none; text-align: center;">Confirm email address</a>
                    </td>
                  </tr>
                </tbody></table>
              </td>
            </tr>
          </tbody></table>
        </div>
      </td>
    </tr>
  </tbody></table>
	`+siteADDR;

							//TEST EMAIL
							// setup email data with unicode symbols
							let mailOptions = {
								from: '', // sender address
								to: email, // list of receivers
								subject: 'Hello ✔ '+config.mailTRANSPORT, // Subject line
								text: `Hello!
Please confirm your email address <a href="`+siteADDR+`/confirm/`+
					  +code+`">`+siteADDR+
					  `/confirm/`+code+
					  `</a>, to activate your account. If you received this by mistake or weren't expecting it, please disregard this email.
					  
					  `+siteADDR, // plain text body
								html: txt // html body
							};

							// send mail with defined transport object
							transporter.sendMail(mailOptions, (error, info) => {
								if (error) {
									return console.log(error);
								}
								console.log('Message %s sent: %s', info.messageId, info.response);
							});
}

function sendForgetOkEmail(email, siteADDR, pass)
{
	var txt = `Hello!
	<table class="body-wrap" style="margin: 0; padding: 0; box-sizing: border-box; font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; color: #8F9BB3; font-size: 14px; line-height: 22px; width: 100%; background-color: white;">
    <tbody><tr style="margin: 0; padding: 0; box-sizing: border-box; font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; color: #8F9BB3; font-size: 14px; line-height: 22px;">
      <td style="margin: 0; padding: 0; box-sizing: border-box; font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; color: #8F9BB3; font-size: 14px; line-height: 22px; vertical-align: top;"></td>
      <td width="400" class="container" style="font-size: 14px; box-sizing: border-box; font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; color: #8F9BB3; padding: 0; line-height: 22px; vertical-align: top; margin: 0 auto; display: block; max-width: 400px; clear: both;">
        <div class="content" style="padding: 0; box-sizing: border-box; font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; color: #8F9BB3; font-size: 14px; line-height: 22px; margin: 0 auto; max-width: 400px; display: block;">
          <table width="100%" cellpadding="0" cellspacing="0" class="main" style="margin: 0; padding: 0; box-sizing: border-box; font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; color: #8F9BB3; font-size: 14px; line-height: 22px;">
            <tbody><tr style="margin: 0; padding: 0; box-sizing: border-box; font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; color: #8F9BB3; font-size: 14px; line-height: 22px;">
              <td class="logo" style="margin: 0; padding: 0; box-sizing: border-box; font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; color: #8F9BB3; font-size: 14px; line-height: 22px; vertical-align: top; text-align: center;">
                <img src="https://privacy.com/assets/images/email/logo.png" width="120" style="padding: 0; box-sizing: border-box; font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; color: #8F9BB3; font-size: 14px; line-height: 22px; max-width: 100%; margin: 30px 0;">
              </td>
            </tr>
            <tr style="margin: 0; padding: 0; box-sizing: border-box; font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; color: #8F9BB3; font-size: 14px; line-height: 22px;">
              <td class="content-wrap" style="margin: 0; padding: 0; box-sizing: border-box; font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; color: #8F9BB3; font-size: 14px; line-height: 22px; vertical-align: top;">
                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0; padding: 0; box-sizing: border-box; font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; color: #8F9BB3; font-size: 14px; line-height: 22px;">
                  <tbody><tr style="margin: 0; padding: 0; box-sizing: border-box; font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; color: #8F9BB3; font-size: 14px; line-height: 22px;">
                    <td class="content-block" style="font-size: 14px; margin: 0; box-sizing: border-box; line-height: 22px; vertical-align: top; color: #8F9BB3; padding: 20px 0; font-family: 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; background: #ffffff; border-radius: 3px; box-shadow: 0 0 0 1px #D8DDE2;">
                      <p style="margin: 0; box-sizing: border-box; font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; color: #8F9BB3; font-size: 14px; line-height: 22px; font-weight: normal; margin-bottom: 0; padding: 0 20px;"><strong style="margin: 0; padding: 0; box-sizing: border-box; font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 22px; color: #596C80;">
					  <strong>Your password: </strong> ` + pass + `</p>
                    </td>
                  </tr>
                </tbody>
				</table>
              </td>
            </tr>
          </tbody></table>
        </div>
      </td>
    </tr>
  </tbody></table>
	`+siteADDR;

							//TEST EMAIL
							// setup email data with unicode symbols
							let mailOptions = {
								from: '', // sender address
								to: email, // list of receivers
								subject: 'Hello ✔ '+config.mailTRANSPORT, // Subject line
								text: `Hello!
Your password is ` +pass+`					  
					  `+siteADDR, // plain text body
								html: txt // html body
							};

							// send mail with defined transport object
							transporter.sendMail(mailOptions, (error, info) => {
								if (error) {
									return console.log(error);
								}
								console.log('Message %s sent: %s', info.messageId, info.response);
							});
}

module.exports.transporter = transporter;
module.exports.sendActivateEmail = sendActivateEmail;
module.exports.sendForgetOkEmail = sendForgetOkEmail;