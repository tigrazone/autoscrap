
var request = require('request');

// load up the yard model
var Yard = require('../app/models/yard');
var Lot  = require('../app/models/lot');

var elastic = require('../libs/elastic');


var results;
var conn0;

//queue name
var q = 'tasks';


var lots_processed = 0; 
 

function scrapYards(URL, q, ch, msg)
{
		console.log('scrapYards('+URL+')');
	
		request(URL, function (err, res, body) {
			//if (err) throw err;
			if (err) return;
			
			
			if(res.statusCode != 200) 
				return;
			
			results = JSON.parse(body);
			//console.log(results);
			
			var yards=0;
			
			for(ri in results)
			{
				yards++;
				//if(yards==13) break;
				
				var resu = results[ri];
				
				var query = { 'yardNumber': resu.yardNumber, 'yardName': resu.yardName, 'auctionDate': resu.auctionDate  },
					options = { upsert: true };
					update = query;
					
					update['links'] = resu['links'];
					
					//store yard
					Yard.update(query, update, options, function(err) {
									if(err) { throw err; }
									//...
								}
							);
							
							
							//get lots links
							var links = resu['links'];
							
							for(li in links)
							{
								var lnk = links[li];
								var URL = lnk['href'];
								
								publishLot(URL, q);
							}
			}
			
			ch.ack(msg);
		});
}

function scrapLot(URL, ch, msg)
{
		console.log('scrapLot('+URL+')');
		
		
if (process.getuid) {
  console.log(`Current uid: ${process.getuid()}`);
}


								request(URL, function (err, res, body) {
									//if (err) throw err;
									if (err) return;

									if(res.statusCode != 200) 
										return;
									
									//console.log(body);
									//console.log(res.statusCode);
									
									var resultt = JSON.parse(body);
									var results = resultt['response']['docs'];
									
									lots = 0;
									
									for(rli in results)
									{
										lots++;
										//if(lots==13) break;
										
										lots_processed++;

										if(lots_processed % 200 == 0)
										{

										  console.log('* indexate!');
												
										  Lot.find({}, function(err, all_lots) {
											  
											console.log('lots: '+all_lots.length);  
												
											//в body запишу объединенный текст - название и модель
											for(loti in all_lots) 
											{
											  var lot = all_lots[loti];	
											  all_lots[loti]['body'] = lot['lotMakeDesc']+' '+lot['lotModelDesc'];
											}
											
											elastic.bulkIndex('lots', 'lot', all_lots, res);
											
											
										  });										}
										
										var resu = results[rli];										
										
										var query = { 'lotNumber': resu.lotNumber, 'yardNumber': resu.yardNumber  },
											options = { upsert: true };
											update = resu;
										
											//store lot
											Lot.update(query, update, options, function(err) {
															if(err) { throw err; }
															//...
														}
													);
										
								
										// break;													
									}
			
									ch.ack(msg);
									
								});
}
 
function bail(err) {
  console.error(err);
  process.exit(1);
}
 
// Publishers
function publisherYards() {
  conn = conn0;	
  conn.createChannel(on_open);
  function on_open(err, ch) {
    if (err != null) bail(err);
    ch.assertQueue(q);
	
	//get yards list
	var URL = 'https://inventory.copart.io/v1/list';
    ch.sendToQueue(q, new Buffer('y*'+URL));
  }
}


function publishLot(URL, q) {
  conn = conn0;	
  conn.createChannel(on_open);
  function on_open(err, ch) {
    if (err != null) bail(err);
    ch.assertQueue(q);
	
    ch.sendToQueue(q, new Buffer('l*'+URL));
  }
}


// Consumer
function consumer(conn) {
  var ok = conn.createChannel(on_open);
  function on_open(err, ch) {
    if (err != null) bail(err);
    ch.assertQueue(q);
    ch.consume(q, function(msg) {
      if (msg !== null) {
        //console.log(msg);
		var message = msg.content.toString();
		console.log('*** '+message);
		
		var msg_parts = message.split('*');
		if(msg_parts.length==2)
		{
			var action 	= msg_parts[0];
			var URL 	= msg_parts[1];
			
			switch(action)
			{
				case 'y': //get yards
						  scrapYards(URL, q, ch, msg);
						  break;
				case 'l': //get lots
						  scrapLot(URL, ch, msg);
						  break;
			}
		}
		  
      }
    });
  }
}
 
require('amqplib/callback_api')
  .connect(
  'amqp://localhost'
  , 
  function(err, conn) {
    if (err != null) bail(err);
    consumer(conn);
	
	conn0 = conn;
	
	//start scan yards
	//publisherYards();
	
	//once a day	
	setTimeout( 
		function() 
		
		{ 
			publisherYards(); 
		} 
		
		, 
		1000 //1 s
		* 60 //1 min
		//* 5  //once a 5 min
		 * 60 //1 hour		
		 * 24 //1 day
		);
		
  });





  
  
function start0()
{
		//var URL = 'https://inventory.copart.io/v1/list';
		
		console.log('start0() start...');
		
		publisherYards();
		
		/*
		request(URL, function (err, res, body) {
			if (err) throw err;
			
			if(res.statusCode != 200) 
				return;
			
			//console.log(body);
			console.log('res.statusCode = ' + res.statusCode);
			
			results = JSON.parse(body);
			//console.log(results);
			
			var yards=0;
			var lots=0;
			
			for(ri in results)
			{
				yards++;
				if(yards==13) break;
				
				var resu = results[ri];
				
				// Setup stuff
				var query = { 'yardNumber': resu.yardNumber, 'yardName': resu.yardName, 'auctionDate': resu.auctionDate  },
					options = { upsert: true };
					update = query;
					
					update['links'] = resu['links'];
					
					Yard.update(query, update, options, function(err) {
									if(err) { throw err; }
									//...
								}
							);
							*/
							/*
							"lotNumber": 36632928,
							"makeAnOfferFlag": false,
							"lotMakeDesc": "ARNES",
							"lotModelDesc": "BIG HORN",
							"lotYear": 2018,
							"yardName": "*VIX*",
							"lotModelGroup": "BIG HORN",
							"fullVin": "55ZR1E24J1001480",
							"lotAcv": 5517,
							"yardNumber": 770,
							*/
							/*
							var links = resu['links'];
							
							for(li in links)
							{
								var lnk = links[li];
								var URL = lnk['href'];

								request(URL, function (err, res, body) {
									if (err) throw err;
									
									//console.log(body);
									//console.log(res.statusCode);
									
									var resultt = JSON.parse(body);
									var results = resultt['response']['docs'];
									
									lots = 0;
									
									for(rli in results)
									{
										lots++;
										if(lots==13) break;
										
										var resu = results[rli];										
										
										// Setup stuff
										var query = { 'lotNumber': resu.lotNumber, 'yardNumber': resu.yardNumber  },
											options = { upsert: true };
											update = resu;
											
											Lot.update(query, update, options, function(err) {
															if(err) { throw err; }
															//...
														}
													);
										
								
										// break;													
									}									
									
								});
							}
							
					  
			}
		});
		*/
}


module.exports.start = start0;