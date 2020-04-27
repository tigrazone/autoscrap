const elasticsearch = require('elasticsearch');

const esClient = new elasticsearch.Client({
  host: 'http://dev001.primeauto.ltd:9200',
  log: 'error'
});

var results;
			

var lot_fields = [	
        "lotNumber",
		"lotMakeDesc",
		"lotModelDesc",
        "yardNumber"		
  ];
  
  

var mongoose = require('mongoose');
  

// load up the yard model
var Yard = require('../app/models/yard');
var Lot  = require('../app/models/lot');


/*
Here, we are calling the bulkIndex function passing it library as the index name, article as the type and the JSON data we wish to have indexed. 
The bulkIndex function in turn calls the bulk method on the esClient object. This method takes an object with a body property as an argument. 
The value supplied to the body property is an array with two entries for each operation
*/	
	
	
const bulkIndex = function bulkIndex(index, type, data, res) {
  let bulkBody = [];

  var fields = lot_fields;
  
  data.forEach(item => {
	  console.log('90');
	  console.log(item._id);
	  console.log(item.body);
	  
	
    bulkBody.push({
      index: {
        _index: index,
        _type: type,
        _id: item._id
      }
    });

	var aITEM = {};
	var i;
	for(i in fields)
	{
		var fn=fields[i];
		aITEM[fn] = item[fn];
	}
	
	bulkBody.push(aITEM);
	
  });

  
  esClient.bulk({body: bulkBody})
  .then(response => {
    console.log('here');
    let errorCount = 0;
    response.items.forEach(item => {
      if (item.index && item.index.error) {
        console.log(++errorCount, item.index.error);
      }
    });
	
	var resp = 
      `Successfully indexed ${data.length - errorCount}
       out of ${data.length} items`;
	
    console.log(resp);
	
        res.render('indexate', {
			resp: resp,
			title: 'Indexate',
				user_id	: req.user._id,
				user_role: req.user['local']['role']
			});
  })
  .catch(console.err);
  
};
	
	
const indices = function indices() {
  return esClient.cat.indices({v: true})
  .then(console.log)
  .catch(err => console.error(`Error connecting to the es client: ${err}`));
};


function toTranslit(text) {
	
	if(text===undefined) return '';
	
	//trim spaces
	if(text.length) text = text.trim();
	
    var s =
	text.replace(/([а-яё])|([\s\/\\_-])|([^a-z\d])/gi,
    function (all, ch, space, words, i) {
        if (space || words) {
            return space ? '-' : '';
        }
        var code = ch.charCodeAt(0),
            index = code == 1025 || code == 1105 ? 0 :
                code > 1071 ? code - 1071 : code - 1039,
            t = ['yo', 'a', 'b', 'v', 'g', 'd', 'e', 'zh',
                'z', 'i', 'y', 'k', 'l', 'm', 'n', 'o', 'p',
                'r', 's', 't', 'u', 'f', 'h', 'c', 'ch', 'sh',
                'shch', '', 'y', '', 'e', 'yu', 'ya'
            ]; 
        return t[index];
    });
	
	//many - to one -
	s = s.replace(/-+/gi, '-');
	s = s.toLowerCase(s);

	//remove last -
	if(s.charAt(s.length-1) == '-') s = s.substring(0, s.length-1);
	return s;
}


function search(q, params, req, res)
{	
		esClient.search({
		  index: 'lots',
		  type: 'lot',
		  body: {
			query: {
			  multi_match: {
				query: q,
				fields: [ "lotMakeDesc", "lotModelDesc"]
			  }
			}
		  }
		}).then(function(response) {
		  var hits = response.hits.hits;
		  
		  /*
		  console.log('255')
		  console.log(hits[0]);
		  */
		  
		  //найти и установить thumb images
		  var iii;
		  var ids = [];
		  
		  if(hits.length) 
		  {
		  for(iii in hits)
		  {
			  var idd = hits[iii]['_id'];
			  ids.push(mongoose.Types.ObjectId(idd));
		  }
		  
		  Lot.find({
				'_id': { $in: ids}
		  }, function(err, docs){
				//console.log(docs);
				console.log('FOUND: '+docs.length);
				
				//collect all GET parameters
				var p_make = {};
				var p_model = {};
				var p_color = {};
				var p_damage = {};
				
				var checked_cb = [];
				
				//swap if min > max
				if(params.year1 > params.year2)
				{
					var temp = params.year1;
					params.year1 = params.year2;
					params.year2 = temp;
				}
					
				if(params.byin1 > params.byin2)
				{
					var temp = params.byin1;
					params.byin1 = params.byin2;
					params.byin2 = temp;
				}
				
				//set keys from checkboxes
				if(params.hasOwnProperty('make'))
				{
					for(iii in params.make)
					{
						var p = params.make[iii];
						p_make[p] = iii;
						checked_cb.push('make_'+p);
					}
				}
				
				if(params.hasOwnProperty('model'))
				{
					for(iii in params.model)
					{
						var p = params.model[iii];
						p_model[p] = iii;
						checked_cb.push('model_'+p);
					}
				}
				
				if(params.hasOwnProperty('color'))
				{
					for(iii in params.color)
					{
						var p = params.color[iii];
						p_color[p] = iii;
						checked_cb.push('color_'+p);
					}
				}
				
				if(params.hasOwnProperty('damage'))
				{
					for(iii in params.damage)
					{
						var p = params.damage[iii];
						p_damage[p] = iii;
						checked_cb.push('damage_'+p);
					}
				}
				
			/*	
			console.log('p_make:');
			console.log(p_make);
				
			console.log('p_model:');
			console.log(p_model);
				
			console.log('p_color:');
			console.log(p_color);
				
			console.log('p_damage:');
			console.log(p_damage);
				
			console.log('params.year1:');
			console.log(params.year1);
				
			console.log('params.year2:');
			console.log(params.year2);
				
			console.log('params.byin1:');
			console.log(params.byin1);
				
			console.log('params.byin2:');
			console.log(params.byin2);
			*/
			
				
				//collect values for filters
				/*				
				  year - range
				  make - check boxes
				  model - check boxes
				  color - check boxes
				  buy it now price range
				  damage - check boxes
				*/
				
				var f_make = {};
				var f_model = {};
				var f_color = {};
				var f_damage = {};
				var f_buyItNow = []; //min max
				var f_year = [];	 //min max
				
				var i = 0;
				var i1 = 0;
				
				var filtered = [];
				
				for(iii in docs)
				{
					var l = docs[iii];
					/*
					  console.log('***');
					  console.log(l.lotImagesDetails['lotImages'][0].link);
					  */
					
					if(i1==0)
					{
						f_year[0] = l.lotYear;
						f_year[1] = l.lotYear;
						f_buyItNow[0] = l.buyItNowPrice;
						f_buyItNow[1] = l.buyItNowPrice;
					}
					else
					{
						//find min, max year
						if(l.lotYear < f_year[0]) f_year[0] = l.lotYear;
						if(l.lotYear > f_year[1]) f_year[1] = l.lotYear;
						
						//find min, max buyItNowPrice
						if(l.buyItNowPrice < f_buyItNow[0]) f_buyItNow[0] = l.buyItNowPrice;
						if(l.buyItNowPrice > f_buyItNow[1]) f_buyItNow[1] = l.buyItNowPrice;
					}
					
					var t_make = toTranslit(l.lotMakeDesc);
					var t_model = toTranslit(l.lotModelDesc);
					var t_color = toTranslit(l.lotColor);
					var t_damage = toTranslit(l.damageDesc);
					
					if(!(l.lotMakeDesc===undefined) && l.lotMakeDesc!="")
						f_make[t_make] = l.lotMakeDesc;
					
					if(!(l.lotModelDesc===undefined) && l.lotModelDesc!="")
						f_model[t_model] = l.lotModelDesc;
					
					if(!(l.lotColor===undefined) && l.lotColor!="")
						f_color[t_color] = l.lotColor;
					
					if(!(l.damageDesc===undefined) && l.damageDesc!="")
						f_damage[t_damage] = l.damageDesc;
					
					/*
					console.log('*** 148 l');
					console.log(l);
					console.log("l.hasOwnProperty('lotImagesDetails') = "+(docs[iii].hasOwnProperty('lotImagesDetails')));
					console.log("'lotImagesDetails' in l = "+('lotImagesDetails' in l));
					//console.log("'lotImages' in l['lotImagesDetails'] = "+('lotImages' in l['lotImagesDetails']));
					console.log("'lotImages' in l.lotImagesDetails = "+('lotImages' in l.lotImagesDetails));
					console.log("l.lotImagesDetails.hasOwnProperty('lotImages') = "+(l.lotImagesDetails.hasOwnProperty('lotImages')));
					*/
					
					var lnk = '';
					
					//if lot has images
					//if(l.hasOwnProperty('lotImagesDetails'))
					if(('lotImagesDetails' in l) && !(l.lotImagesDetails===undefined)) //javascript is SHIT sometimes
					{
						//if('lotImages' in l['lotImagesDetails'])
						if(l.lotImagesDetails.hasOwnProperty('lotImages'))
						{
							/*
					console.log('*** 167 l.lotImagesDetails');
					console.log(l.lotImagesDetails);
							*/
							
							var lnk_ = l.lotImagesDetails['lotImages'][0].link || {};
							var li
							for(li in lnk_)
							{
							  var o = lnk_[li];
							  if(o.isThumbNail) lnk = o.url
							}
						}
					}
					
					i1++;
					
					//check filters
					//console.log(l);
					
					//check lot year
					if(params.year1>0 && l.lotYear<params.year1)
						continue;
					
					if(params.year2>0 && l.lotYear>params.year2)
						continue;
					
					//check lot buyItNowPrice
					if(params.byin1>0 && l.buyItNowPrice<params.byin1)
						continue;
					
					if(params.byin2>0 && l.buyItNowPrice>params.byin2)
						continue;
					
					//check other checkboxed filters
					if(params.hasOwnProperty('make'))
					{
						if(!(p_make.hasOwnProperty(t_make)))
							continue;
					}
					
					if(params.hasOwnProperty('model'))
					{
						if(!(p_model.hasOwnProperty(t_model)))
							continue;
					}
					
					if(params.hasOwnProperty('color'))
					{
						if(!(p_color.hasOwnProperty(t_color)))
							continue;
					}
										
					if(params.hasOwnProperty('damage'))
					{
						if(!(p_damage.hasOwnProperty(t_damage)))
							continue;
					}
					
					filtered[i] = docs[iii];
					filtered[i]['_source'] = l;
					
					//console.log(lnk);
					filtered[i]['_source']['thumb'] = lnk
					
					i++;
				}
			
			/*
			console.log('year:');
			console.log(f_year);
				
			console.log('buyItNow:');
			console.log(f_buyItNow);
				
			console.log('make:');
			console.log(f_make);
				
			console.log('model:');
			console.log(f_model);
				
			console.log('color:');
			console.log(f_color);
				
			console.log('damage:');
			console.log(f_damage);
			*/
			
			console.log('filtered: '+i);
			
			if(!req.hasOwnProperty('user'))
			{
				req.user = {};
			}
			
			if(!(req['user']).hasOwnProperty('_id'))
			{
				req.user['_id'] = 0;
			}
			
			if(!(req['user']).hasOwnProperty('role'))
			{
				req.user['role'] = '';
			}
				
			res.render('search', {
			  hits: filtered, 
			  q:q,
			  vals:
			  {
				  year		: f_year,
				  buyItNow	: f_buyItNow,
				  make		: Object.values(f_make),
				  model		: Object.values(f_model),
				  color		: Object.values(f_color),
				  damage	: Object.values(f_damage),
				  
				  kmake		: Object.keys(f_make),
				  kmodel	: Object.keys(f_model),
				  kcolor	: Object.keys(f_color),
				  kdamage	: Object.keys(f_damage),
				  
			  },
			  checked_cb	: checked_cb,
			  years_set	: [params.year1, params.year2],
			  byin_set	: [params.byin1, params.byin2],
			  title: 'search '+q,
				user_id	: req.user._id,
				user_role: req.user['local']['role']
			});
		  });
		  }
		  else
		  {
		if(req.isAuthenticated())	  
		  res.render('search-not-found', {
			  q:q,
			  title: 'search '+q,
				user_id	: req.user._id,
				user_role: req.user['local']['role']
			  });	  
		else	  
		  res.render('search-not-found', {
			  q:q,
			  title: 'search '+q,
				user_id	: 0,
				user_role: ''
			  });
		  }
		  
		  
		}, function(error) {
		  console.log('259 error.message');
		  console.trace(error.message);
		  
		  if(req.isAuthenticated())
		  res.render('search-error', {
			  q:q,
			  title: 'search '+q,
			  msg: error.message,
				user_id	: req.user._id,
				user_role: req.user['local']['role']
			  });
		  else
		  res.render('search-error', {
			  q:q,
			  title: 'search '+q,
			  msg: error.message,
				user_id	: 0,
				user_role: ''
			  });
		});
}

module.exports.indices = indices;
module.exports.bulkIndex = bulkIndex;
module.exports.search = search;
module.exports.esClient = esClient;