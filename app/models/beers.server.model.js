'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	crypto = require('crypto');

/**
 * A Validation function for local strategy properties
 */
var validateLocalStrategyProperty = function(property) {
	return ((this.provider !== 'local' && !this.updated) || property.length);
};

/**
 * A Validation function for local strategy password
 */
var validateLocalStrategyPassword = function(password) {
	return (this.provider !== 'local' || (password && password.length > 6));
};

/**
 * User Schema
 */
var BeerSchema = new Schema({
	beerSku: {
		type: String,
		unique: 'beerSku already exists',
		trim: true
	},
	name: {
		type: String,
		trim: true,
		default: ''
	},
	description: {
		type: String,
		trim: true,
		default: ''
	},
	labelUrl: {
		type: String,
		trim: true,
		default: ''
	},
	releaseDate: {
		type: Date,
		default: Date.now
	},
	available: {
		type: Number,
		default: 1
	}
});

/**
 * Find all beers
 */
BeerSchema.statics.findBeers = function(callback) {
	var _this = this;

	_this.find(
		{}, 
		function(err, beers) {
			if (!err) {
				if (!beers) {
					callback(null, beers);
				}
				else {
					callback('Error: no beers found', null);
				}
			}
			else {
				callback(err, null);
			}
		}
	);
};

mongoose.model('Beers', BeerSchema);