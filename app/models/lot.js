// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var lotSchema = mongoose.Schema({
    
        lotNumber	 : Number,
		lotMakeDesc  : String,
		lotModelDesc : String,
        yardNumber	 : Number
		,
		"makeAnOfferFlag": Boolean,
		"lotYear": Number,
		"yardName": String,
		"lotModelGroup": String,
		"lotAcv": Number,
		"odometerReadingReceived": Number,
		"odometerReadingDesc": String,
		"auctionDateType": String,
		"gridRow": String,
		"locationCity": String,
		"locationState": String,
		"locationZip": String,
		"locationCountry": String,
		"currencyCode": String,
		"timeZone": String,
		"auctionDateUtc": Date,
		"auctionTime": String,
		"auctionAssignmentNumber": Number,
		"buyItNowPrice": Number,
		"vehicleTypeDesc": String,
		"titleState": String,
		"saleTitleType": String,
		"damageDesc": String,
		"saleState": String,
		"currentHighBid": Number,
		"lotColor": String,
		"v5Notes": String,
		"highlights": Array,
		"offsiteFlag": Boolean,
		"lane": String,
		"saleStatus": String,
		"lotImagesDetails": Object
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Lot', lotSchema);
