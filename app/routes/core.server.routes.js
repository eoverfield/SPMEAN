'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport');
var core = require('../../app/controllers/core.server.controller');

module.exports = function(app) {
	app.route('/beersapp').get(core.index);
	
	//root route for now
	//if post to root then redirect to SP auth
	app.route('/').post(function(req, res) {
		res.redirect('/sharepoint/auth');
	});
	//if get to root then redirect to beersapp
	app.route('/').get(function(req, res) {
		res.redirect('/beersapp');
	});
};