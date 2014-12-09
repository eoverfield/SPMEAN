'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Beers = mongoose.model('Beers'),
	_ = require('lodash');

/**
 * List of Beers
 */
exports.list = function(req, res) {
	Beers.find().sort('beerSku').select('beerSku name description releaseDate').exec(function(err, beers) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(beers);
		}
	});
};

/**
 * Show the beer specified by beerId
 */
exports.read = function(req, res) {
	/*req.beer was set by beerBySku when called by router*/
	if (req.err) {
		return res.json({'err': req.err});
	}
	res.json(req.beer);
};

/**
 * Create a beer
 */
exports.create = function(req, res) {
	var beerNew = new Beers(req.body);

	//check to see if beer sku already exists
	Beers.findOne({'beerSku' : beerNew.beerSku}).select('beerSku').exec(function(err, beer) {
		if (err) {
			return res.status(400).send({err: 'error looking for unique sku: ' + errorHandler.getErrorMessage(err)});
		}
		
		//if no beer found, then we can add
		if (!beer) {
			beerNew.save(function(err) {
				if (err) {
					return res.status(400).send({err: errorHandler.getErrorMessage(err)});
				}
				else {
					res.json(beerNew);
				}
			});
		}
		else {
			return res.status(400).send({err: 'foundBeerSku'});
		}
	});
};

/**
 * Update a beer
 */
exports.update = function(req, res) {
	var beer = req.beer;

	beer = _.extend(beer, req.body);

	beer.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(beer);
		}
	});
};

/**
 * Delete a beer
 */
exports.delete = function(req, res) {
	var beer = req.beer;

	beer.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(beer);
		}
	});
};



/**
 * Beer middleware
 */
exports.beerBySku = function(req, res, next, beerSku) {
	Beers.findOne({'beerSku' : beerSku}).select('beerSku name description releaseDate labelUrl available').exec(function(err, beer) {
		if (err) return next(err);
		if (!beer) {
			//too harsh, just return nothing
			//return next(new Error('Failed to load beer ' + beerSku))
			req.beer = {};
			req.err = 'Failed to load beer ' + beerSku;
			next();
		}
		else {
			req.beer = beer;
			next();
		}
	});
};

/**
 * Beer authorization middleware
 * currently not implemented, assume all users have access
 */
exports.hasAuthorization = function(req, res, next) {
	/*
	if (req.beer.user.id !== req.user.id) {
		return res.status(403).send({
			message: 'User is not authorized'
		});
	}
	*/
	next();
};