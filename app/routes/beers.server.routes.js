'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users.server.controller'),
	beers = require('../../app/controllers/beers.server.controller');

module.exports = function(app) {
	// Article Routes
	app.route('/beers')
		.get(beers.list);
		//.post(users.requiresLogin, beers.create);

	app.route('/beers/:beerSku')
		.get(beers.read)
		.post(beers.create)
		.put(beers.update)
		.delete(beers.delete);
		//.put(users.requiresLogin, beers.hasAuthorization, beers.update)
		//.delete(users.requiresLogin, beers.hasAuthorization, beers.delete);

	// Finish by binding the beer middleware
	app.param('beerSku', beers.beerBySku);
};