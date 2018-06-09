// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var yardSchema = mongoose.Schema({

    local            : {
        yardNumber	 : Number,
		yardName	 : String,
		auctionDate  : Date,
		links     	 : [],
        lotNumber    : Number,
		result		 : {}
    }

});

// create the model for users and expose it to our app
module.exports = mongoose.model('Yard', yardSchema);