// config/database.js
module.exports = {

    //'url' : 'mongodb://localhost:27017/passport' // looks like mongodb://<user>:<pass>@mongo.onmodulus.net:27017/Mikha4ot
    'url' : 'mongodb://thruser:thrpassword@ds149481.mlab.com:49481/tigrazone-mongo' // looks like mongodb://<user>:<pass>@mongo.onmodulus.net:27017/Mikha4ot
	,
	options: {
        server: {
            socketOptions: {
                keepAlive: 1
            }
        }
    }      
   // 'url' : 'mongodb://thrzzzzz:RqOn4K6GQZm4gpGX@cluster0-shard-00-00-2fzzx.mongodb.net:27017/passport'
   //'url' : 'mongodb://thrzzzzz:RqOn4K6GQZm4gpGX@cluster0-shard-00-00-2fzzx.mongodb.net:27017,cluster0-shard-00-01-2fzzx.mongodb.net:27017,cluster0-shard-00-02-2fzzx.mongodb.net:27017/Cluster0?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin'

};
