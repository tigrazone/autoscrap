// config/database.js
module.exports = {
    'url' : 'mongodb://tigrazone:primeauto@dev001.primeauto.ltd:27017/primeauto?authSource=primeauto' // looks like mongodb://<user>:<pass>@mongo.onmodulus.net:27017/Mikha4ot
	,
	options: {
        server: {
            socketOptions: {
                keepAlive: 1
            }
        }
    }
};
