'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;

module.exports = function(app) {
	// User Routes
	var users = require('../../app/controllers/users.server.controller');
	var sharepoint = require('../../app/controllers/sharepoint.server.controller');

	// Setting up the users profile api
	app.route('/users/me').get(users.me);
	app.route('/users').put(users.update);
	
	// Finish by binding the user middleware
	app.param('userId', users.userByID);
};