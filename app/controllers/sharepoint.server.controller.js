'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	mongoose = require('mongoose'),
	https = require('https'),
	url = require('url'),
	User = mongoose.model('User');
	
/**
 * Send SharePoint Profile User Info
 */
exports.me = function(req, res) {
	var sharepointServer = module.exports.getSpServer(req);
	
	//Set up rest request to get 
	var headers = {
		'Accept': 'application/json;odata=verbose',
		'Authorization' : 'Bearer ' + req.user.providerData.accessToken,
	};
	//console.log('Going to ask SP for data: ' + req.user.host);
	//console.log('using token: ' + req.user.providerData.accessToken);
	//console.log('%j', req.user);
	
	var options = {
		host : sharepointServer.host, 
		port : 443,
		path : sharepointServer.path + '_api/web/currentuser',
		headers : headers,
		agent: false,
		//ciphers: 'RC4',
		secureOptions: require('constants').SSL_OP_NO_TLSv1_2
	};
	
	//console.log('Rest request host: ' + options.host);
	//console.log('Rest request path: ' + options.path);
	
	var myReq = https.get(options, function(myRes) {
		//console.log('Returned statusCode: ', myRes.statusCode);
		//console.log('Returned headers: ', myRes.headers);
		
		myRes.setEncoding('utf8');
		var userData = '';
		
		//as data is returned, keep adding it to userData
		myRes.on('data', function(data) {
			userData += data;
		});
		
		myRes.on('end', function() {
			//console.log('Rest request response ended. Process');
			var json = JSON.parse(userData);
			
			//if we have our expected "d" field, then we can continue
			if (json.d) {
				//console.log('SharePoint Me: returning json');
				res.json(json.d || null);
			}
			//if there was an error when parsing json, then address
			else if (json.error) {
				res.status(500).send({
					message: 'Rest requsest failed: ' + json.error.code + ' at ' + options.host + ':' + options.port + options.path
				});
			}
			else {
				res.status(500).send({
					message: 'Rest requsest failed: Unknown exception at' + options.host + ':' + options.port + options.path
				});
			}
		});
	}).on('error', function(e) {
		res.status(400).send({
			message: 'REST Get failed: ' + e + ' at ' + options.host + ':' + options.port + options.path
		});
	});
	
	/*Message to the node console for tracking purposes*/
	console.log('sent response for SharePoint Rest /me');
};


/**
 * Get beer docs query. Will get first 100 documents
 * http://nodejs.org/api/http.html
 * http://msdn.microsoft.com/en-us/library/office/dn292552%28v=office.15%29.aspx //working with list items in REST
 */
exports.beerDocsList = function(req, res) {
	var sharepointServer = module.exports.getSpServer(req);
	
	var headers = {
		'Accept': 'application/json;odata=verbose',
		'Authorization' : 'Bearer ' + req.user.providerData.accessToken
	};
	
	var options = {
		host : sharepointServer.host, 
		port : 443,
		path : sharepointServer.path + '_api/Web/Lists/GetByTitle(\'pbAssetLibrary\')/items/?$select=Id,Title,AssetSku/Title&$expand=AssetSku/Title&$top=100',
		headers : headers,
		agent: false,
		//ciphers: 'RC4',
		secureOptions: require('constants').SSL_OP_NO_TLSv1_2
	};
		
	var myReq = https.request(options, function(myRes) {
		myRes.setEncoding('utf8');
		var userData = '';
		
		myRes.on('data', function(data) {
			userData += data;
		});
		
		myRes.on('end', function() {
			var json = JSON.parse(userData);
			
			if (json.d) {
				res.json(json.d || null);
			}
			else if (json.error) {
				res.status(500).send('Rest requsest failed: ' + json.error.code + ' at ' + options.host + ':' + options.port + options.path);
			}
			else {
				res.status(500).send('Rest requsest failed: Unknown exception at ' + options.host + ':' + options.port + options.path + '<br />UserData: ' + userData);
			}
		});
	}).on('error', function(e) {
		res.status(400).send({
			message: 'REST Get failed: ' + e + ' at ' + options.host + ':' + options.port + options.path
		});
	});
	myReq.end();

	console.log('sent response for SharePoint Rest /getBeerDocs');
};

/**
 * get one beer docs by sku from pbAssetLibrary list
 */
exports.beerDocsReturnByBeerSku = function(req, res) {
	var beerSku = req.params.beerSku;
	
	if (!beerSku) {
		return res.status(500).send({
			message: 'beerSku required to query SharePoint list'
		});
	}
	
	module.exports.beerDocsGetByBeerSku(req, beerSku, function(r) {
		if (!r) {
			return res.status(500).send('Error, nothing returned from beerDocsGetByBeerSku');
		}
		
		if (!r.err) {
			res.json(r.d || null);
		}
		else {
			res.status(r.err.status).send(r.err.message);
		}
	});
	
	/*Message to the node console for tracking purposes*/
	console.log('sent response for SharePoint Rest /beerDocsGetByBeerSku');
};


/**
 * Get beer docs by beerSku query. Will get first 100 documents
 */
exports.beerDocsGetByBeerSku = function(req, beerSku, done) {
	var r = {};
	var sharepointServer = module.exports.getSpServer(req);
	
	var headers = {
		'Accept': 'application/json;odata=verbose',
		'Authorization' : 'Bearer ' + req.user.providerData.accessToken
	};

	var options = {
		host : sharepointServer.host, 
		port : 443,
		//path : sharepointServer.path + '_api/Web/Lists/GetByTitle(\'pbAssetLibrary\')/items/?$select=Id,Title,AssetSku/Title&$expand=AssetSku/Title&$filter=AssetSku/Title%20eq%20\'' + beerSku + '\'&$top=100',
		path : sharepointServer.path + '_api/Web/Lists/GetByTitle(\'pbAssetLibrary\')/items/?&$filter=AssetSku/Title%20eq%20\'' + beerSku + '\'&$top=100',
		headers : headers,
		agent: false,
		//ciphers: 'RC4',
		secureOptions: require('constants').SSL_OP_NO_TLSv1_2
	};
	
	var myReq = https.request(options, function(myRes) {
		myRes.setEncoding('utf8');
		var userData = '';
		
		myRes.on('data', function(data) {
			userData += data;
		});
		
		myRes.on('end', function() {
			var json = JSON.parse(userData);
			
			if (json.d) {
				r.d = json.d;
				
				//attempt to go and get the actual file data for this asset
				if (r.d.results[0] && r.d.results[0].Id) {
					module.exports.beerDocsGetFileById(req, r.d.results[0].Id, function(ret) {
						r.d.results[0].FileData = ret.d;
						done(r);
					});
				}
				else {
					done(r);
				}
			}
			else if (json.error) {
				r.err = {};
				r.err.status = 500;
				r.err.message = 'Rest requsest failed: ' + json.error.code + ' at ' + options.host + ':' + options.port + options.path;
				done(r);
			}
			else {
				r.err = {};
				r.err.status = 500;
				r.err.message = 'Rest requsest failed: Unknown exception at ' + options.host + ':' + options.port + options.path + '<br />UserData: ' + userData;
				done(r);
			}
		});
	}).on('error', function(e) {
		r.err = {};
		r.err.status = 400;
		r.err.message = 'REST Get failed: ' + e + ' at ' + options.host + ':' + options.port + options.path;
		done(r);
	});
	myReq.end();

	/*Message to the node console for tracking purposes*/
	console.log('sent response for SharePoint Rest /beerDocsGetByBeerSku');
};

/**
 * get one beer docs by sku from pbAssetLibrary list
 */
exports.beerDocsReturnFileById = function(req, res) {
	var fileId = req.params.id;
	
	if (!fileId) {
		return res.status(500).send({
			message: 'fileId required to query SharePoint list'
		});
	}
	
	module.exports.beerDocsGetFileById(req, fileId, function(r) {
		if (!r) {
			return res.status(500).send('Error, nothing returned from beerDocsGetFileById');
		}
		
		if (!r.err) {
			res.json(r.d || null);
		}
		else {
			res.status(r.err.status).send(r.err.message);
		}
	});
	
	/*Message to the node console for tracking purposes*/
	console.log('sent response for SharePoint Rest /beerDocsReturnFileById');
};


/**
 * Get beer docs by beerSku query. Will get first 100 documents
 */
exports.beerDocsGetFileById = function(req, fileId, done) {
	var r = {};
	var sharepointServer = module.exports.getSpServer(req);
	
	var headers = {
		'Accept': 'application/json;odata=verbose',
		'Authorization' : 'Bearer ' + req.user.providerData.accessToken
	};

	var options = {
		host : sharepointServer.host, 
		port : 443,
		path : sharepointServer.path + '_api/Web/Lists/GetByTitle(\'pbAssetLibrary\')/items(' + fileId + ')/File',
		headers : headers,
		agent: false,
		//ciphers: 'RC4',
		secureOptions: require('constants').SSL_OP_NO_TLSv1_2
	};
	
	var myReq = https.request(options, function(myRes) {
		myRes.setEncoding('utf8');
		var userData = '';
		
		myRes.on('data', function(data) {
			userData += data;
		});
		
		myRes.on('end', function() {
			var json = JSON.parse(userData);
			
			if (json.d) {
				r.d = json.d;
				done(r);
			}
			else if (json.error) {
				r.err = {};
				r.err.status = 500;
				r.err.message = 'Rest requsest failed: ' + json.error.code + ' at ' + options.host + ':' + options.port + options.path;
				done(r);
			}
			else {
				r.err = {};
				r.err.status = 500;
				r.err.message = 'Rest requsest failed: Unknown exception at ' + options.host + ':' + options.port + options.path + '<br />UserData: ' + userData;
				done(r);
			}
		});
	}).on('error', function(e) {
		r.err = {};
		r.err.status = 400;
		r.err.message = 'REST Get failed: ' + e + ' at ' + options.host + ':' + options.port + options.path;
		done(r);
	});
	myReq.end();

	/*Message to the node console for tracking purposes*/
	console.log('sent response for SharePoint Rest /beerDocsGetFileById');
};

/**
 * Get beer skus query. Will get first 100 skus
 */
exports.skusList = function(req, res) {
	var sharepointServer = module.exports.getSpServer(req);
	
	var headers = {
		'Accept': 'application/json;odata=verbose',
		'Authorization' : 'Bearer ' + req.user.providerData.accessToken
	};
	
	var options = {
		host : sharepointServer.host, 
		port : 443,
		path : sharepointServer.path + '_api/Web/Lists/GetByTitle(\'pbAssetSkus\')/items/?$select=Id,Title,ContentTypeId&$top=100',
		headers : headers,
		agent: false,
		//ciphers: 'RC4',
		secureOptions: require('constants').SSL_OP_NO_TLSv1_2
	};
		
	var myReq = https.request(options, function(myRes) {
		myRes.setEncoding('utf8');
		var userData = '';
		
		myRes.on('data', function(data) {
			userData += data;
		});
		
		myRes.on('end', function() {
			var json = JSON.parse(userData);
			
			if (json.d) {
				res.json(json.d || null);
			}
			else if (json.error) {
				res.status(500).send('Rest requsest failed: ' + json.error.code + ' at ' + options.host + ':' + options.port + options.path);
			}
			else {
				res.status(500).send('Rest requsest failed: Unknown exception at ' + options.host + ':' + options.port + options.path + '<br />UserData: ' + userData);
			}
		});
	}).on('error', function(e) {
		res.status(400).send({
			message: 'REST Get failed: ' + e + ' at ' + options.host + ':' + options.port + options.path
		});
	});
	myReq.end();

	/*Message to the node console for tracking purposes*/
	console.log('sent response for SharePoint Rest /skusList');
};

/**
 * get one beer sku from pbAssetSkus list to see if it exists or not
 */
exports.skusReturnOne = function(req, res) {
	var createIfNotFound = false; /*turn into a parameter if you want to set in request*/
	var beerSku = req.params.beerSku;
	
	if (!beerSku) {
		return res.status(500).send({message: 'beerSku required to query SharePoint list'});
	}
	
	module.exports.skusGetOne(req, beerSku, function(r) {
		if (!r) {
			return res.status(500).send('Error, nothing returned from skusGetOne');
		}
		
		if (!r.err) {
			//go and create sku if it is not found
			if ((r.d.results.length < 1) && createIfNotFound) {
				var json = {};
				json.beerSku = beerSku;
				module.exports.skusCreateOne(req, json, function(r) {
					if (!r) {
						return res.status(500).send('Error, nothing returned from skusGetOne');
					}
					
					if (!r.err) {
						res.json(r.d || null);
					}
					else {
						res.status(r.err.status).send(r.err.message);
					}
				});
			}
			else {
				res.json(r.d || null);
			}
		}
		else {
			res.status(r.err.status).send(r.err.message);
		}
	});
	
	/*Message to the node console for tracking purposes*/
	console.log('sent response for SharePoint Rest /skusGetOne');
};

/**
 * Given a req (to get user and sp path data, and a beerSku, go and get this sku from SP pmAssetSkus lists
 */
exports.skusGetOne = function(req, beerSku, done) {
	var r = {};
	var sharepointServer = module.exports.getSpServer(req);
	
	var headers = {
		'Accept': 'application/json;odata=verbose',
		'Authorization' : 'Bearer ' + req.user.providerData.accessToken
	};
	
	var options = {
		host : sharepointServer.host, 
		port : 443,
		path : sharepointServer.path + '_api/Web/Lists/GetByTitle(\'pbAssetSkus\')/items/?$select=Id,Title,ContentTypeId&$filter=Title%20eq%20\'' + beerSku + '\'',
		headers : headers,
		agent: false,
		//ciphers: 'RC4',
		secureOptions: require('constants').SSL_OP_NO_TLSv1_2
	};
		
	var myReq = https.request(options, function(myRes) {
		myRes.setEncoding('utf8');
		var userData = '';
		
		myRes.on('data', function(data) {
			userData += data;
		});
		
		myRes.on('end', function() {
			var json = JSON.parse(userData);
			
			if (json.d) {
				r.d = json.d;
				done(r);
			}
			else if (json.error) {
				r.err = {};
				r.err.status = 500;
				r.err.message = 'Rest requsest failed: ' + json.error.code + ' at ' + options.host + ':' + options.port + options.path;
				done(r);
			}
			else {
				r.err = {};
				r.err.status = 500;
				r.err.message = 'Rest requsest failed: Unknown exception at ' + options.host + ':' + options.port + options.path + '<br />UserData: ' + userData;
				done(r);
			}
		});
	}).on('error', function(e) {
		r.err = {};
		r.err.status = 400;
		r.err.message = 'REST Get failed: ' + e + ' at ' + options.host + ':' + options.port + options.path;
		done(r);
	});
	myReq.end();
};


/**
 * add one sku
 * first check to see if sku already exists. If it does, return error. If it does not attempt to add
 */
exports.skusCreate = function(req, res) {
	if (!req.body) {
		return res.status(500).send({message: 'Unable to add beerSku to SharePoint, req body required'});
	}
	var json = {};
	if (typeof(req.body) === 'object') json = req.body;
	else json = JSON.parse(req.body);
	if (!json.beerSku) {
		return res.status(500).send({message: 'Unable to add beerSku to SharePoint, beerSku required'});
	}
	
	module.exports.skusGetOne(req, json.beerSku, function(r) {
		if (!r) {
			return res.status(500).send('Error, unable to check to see if beerSku existed');
		}
		
		if (!r.err) {
			if (r.d.results.length > 0) {
				return res.status(200).json({'status':'found','msg':'beerSku already exists'});
			}
			
			//go and add beerSku then
			module.exports.skusCreateOne(req, json, function(r) {
				if (!r) {
					return res.status(200).json({'status':'error','msg':'Nothing returned from skusCreateOne'});
				}
				
				if (!r.err) {
					res.json(r.d || null);
				}
				else {
					res.status(r.err.status).send(r.err.message);
				}
			});
		}
		else {
			res.status(r.err.status).send(r.err.message);
		}
	});
	
	console.log('sent response for SharePoint Rest /skusCreate');
};

/**
 * Given a req (to get user and sp path data, and a json beerSku to add, go and add this sku from SP pmAssetSkus lists
 */
exports.skusCreateOne = function(req, json, done) {
	var r = {};
	var sharepointServer = module.exports.getSpServer(req);
	
	//need to get form digest before post
	//we need to post request to get meta data value beacuse of bug in rest
	//thanks to post: http://sharepointificate.blogspot.co.uk/2014/05/taxonomy-columns-sharepoint-2013-list.html
	module.exports.getFormDigest(req, function(formDigest) {
		var headers = {
			'Accept': 'application/json;odata=verbose',
			'content-type': 'application/json;odata=verbose',
			'Authorization' : 'Bearer ' + req.user.providerData.accessToken,
			'X-RequestDigest': formDigest
		};
		
		var myReqBody = {};
		/*get metadata value from 'type' from request such as https://localhost/beerdocskus*/
		myReqBody.__metadata = { 'type': 'SP.Data.PbAssetSkusListItem'};
		myReqBody.Title = json.beerSku;
		/*the content type id must be pulled from a get request such as https://localhost/beerdocskus*/
		myReqBody.ContentTypeId = '0x01006638412647CA494A9C651A5600947E07';
		
		var options = {
			host : sharepointServer.host, 
			port : 443,
			path : sharepointServer.path + '_api/lists/GetByTitle(\'pbAssetSkus\')/items',
			headers : headers,
			method : 'POST',
			agent: false,
			//ciphers: 'RC4',
			secureOptions: require('constants').SSL_OP_NO_TLSv1_2
		};	
		
		//console.log('%j', options);
		
		var myReq = https.request(options, function(myRes) {
			myRes.setEncoding('utf8');
			var userData = '';
			
			myRes.on('data', function(data) {
				userData += data;
			});
			
			myRes.on('end', function() {
				var json = JSON.parse(userData);
				
				if (json.d) {
					r.d = json.d;
					done(r);
				}
				else if (json.error) {
					r.err = {};
					r.err.status = 500;
					r.err.message = 'Rest requsest failed: ' + json.error.code + ' at ' + options.host + ':' + options.port + options.path;
					done(r);
				}
				else {
					r.err = {};
					r.err.status = 500;
					r.err.message = 'Rest requsest failed: Unknown exception at ' + options.host + ':' + options.port + options.path + '<br />UserData: ' + userData;
					done(r);
				}
			});
		}).on('error', function(e) {
			r.err = {};
			r.err.status = 400;
			r.err.message = 'REST Get failed: ' + e + ' at ' + options.host + ':' + options.port + options.path;
			done(r);
		});
		
		myReq.write(JSON.stringify(myReqBody));
		myReq.end(); /*end the post to actually send it*/
	});
};

/**
 * Post to REST sample - only here as a shell of how to get formDigest so as to make Post request to SP Rest api
 */
exports.loadAppPostSample = function(req, res) {
	var sharepointServer = module.exports.getSpServer(req);
	
	//need to get form digest before post
	//we need to post request to get meta data value beacuse of bug in rest
	//thanks to post: http://sharepointificate.blogspot.co.uk/2014/05/taxonomy-columns-sharepoint-2013-list.html
	module.exports.getFormDigest(req, function(formDigest) {
		var headers = {
			'Accept': 'application/json;odata=verbose',
			'Authorization' : 'Bearer ' + req.user.providerData.accessToken,
			'X-RequestDigest': formDigest
		};
		//console.log('Going to ask SP for data: ' + req.user.host);
		//console.log('using token: ' + req.user.providerData.accessToken);
		//console.log('%j', req.user);

		var options = {
			host : sharepointServer.host, 
			port : 443,
			path : sharepointServer.path + '_api/Web/Lists/GetByTitle(\'pbAssetLibrary\')/GetItems(query=@v1)?@v1={\'ViewXml\':\'<View><Query></Query></View>\'}',
			headers : headers,
			method: 'POST',
			agent: false,
			//ciphers: 'RC4',
			secureOptions: require('constants').SSL_OP_NO_TLSv1_2
		};
		
		//console.log('Rest request host: ' + options.host);
		//console.log('Rest request path: ' + options.path);
		
		var myReq = https.request(options, function(myRes) {
			//console.log('Returned statusCode: ', myRes.statusCode);
			//console.log('Returned headers: ', myRes.headers);
			
			myRes.setEncoding('utf8');
			var userData = '';
			
			//as data is returned, keep adding it to userData
			myRes.on('data', function(data) {
				userData += data;
			});
			
			myRes.on('end', function() {
				//console.log('Rest request response ended. Process');
				var json = JSON.parse(userData);
				
				//if we have our expected "d" field, then we can continue
				if (json.d) {
					res.json(json.d || null);
				}
				//if there was an error when parsing json, then address
				else if (json.error) {
					res.status(500).send('Rest requsest failed: ' + json.error.code + ' at ' + options.host + ':' + options.port + options.path);
				}
				else {
					res.status(500).send('Rest requsest failed: Unknown exception at ' + options.host + ':' + options.port + options.path + '<br />UserData: ' + userData);
				}
			});
		}).on('error', function(e) {
			console.log('REST Get failed: ' + e + ' at ' + options.host + ':' + options.port + options.path , null);
		});
		myReq.end(); /*end the post to actually send it*/
	});
	
	console.log('sent response for SharePoint Rest /loadAppPostSample');
};

/**
 * Get a form digest for post requests
 */
exports.getFormDigest = function(req, done) {
	var sharepointServer = module.exports.getSpServer(req);
		
	var headers = {
		'Accept': 'application/json;odata=verbose',
		'Authorization' : 'Bearer ' + req.user.providerData.accessToken
	};	        
	var options = {
		host : sharepointServer.host, 
		port : 443,
		path : sharepointServer.path + '_api/contextinfo',	
		headers : headers,
		method: 'POST',
		agent: false,
		//ciphers: 'RC4',
		secureOptions: require('constants').SSL_OP_NO_TLSv1_2
	};
	var myReq = https.request(options, function(myRes) {
		myRes.setEncoding('utf8');
		var userData = '';
		
		myRes.on('data', function(data) {
			userData += data;
		});
		
		myRes.on('end', function() {
			var json = JSON.parse(userData);
			if (json.d) {
				var formDigest = json.d.GetContextWebInformation.FormDigestValue;
				done(formDigest);
			}
			else if (json.error) {
				done(null);
			}
			else {
				done(null);
			}
		});
	}).on('error', function(e) {
		console.log('Get Form Digest error: ' + e);
		done(null);
	});
	myReq.end();
};

/**
 * giving a request, get correct host and path to make REST calls to
 */
exports.getSpServer = function(req) {
	var myUrl = req.user.host + req.user.site;
	
	var sharepointServer = url.parse(myUrl);
	if ((sharepointServer.path.length > 1) && (sharepointServer.path.indexOf('/', sharepointServer.path.length - 1) < 0))
		sharepointServer.path = sharepointServer.path + '/';
		
	return sharepointServer;
};