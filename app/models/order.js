// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var orderSchema = mongoose.Schema({
	
        product_id	 : String,
        user_id		 : String,
		status		 : String,
		created_ts	 : Number,
		
		started_ts	 : Number,
		started_who	 : String,
		
		done_ts		 : Number,
		statusChangees	 : []

});

// create the model for users and expose it to our app
module.exports = mongoose.model('Order', orderSchema);
