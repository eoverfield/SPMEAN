'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
// User Routes
var users = require('../../app/controllers/users.server.controller');
var sharepoint = require('../../app/controllers/sharepoint.server.controller');

module.exports = function(app) {
	/*TODO: For get request to /auth/sharepoint, handle gracefully and redirect to SP for autheticaion.
	* or review profile/session to see if accessToken already exists. If it does, redirect to /sharepoint/app
	*/
	app.get('/auth/sharepoint', function (req, res) {
		res.status(200).render('201', {
			url: req.originalUrl,
			error: 'Not Allowed'
		});
	});
	//will be a post call to auth/sharepoint
	app.post('/auth/sharepoint', passport.authenticate('sharepoint'),
		function(req, res){
			//called once we have received a token from SP
			res.redirect('/beersapp');
		}
	);
	
	//will be a post call to auth/sharepoint
	app.post('/auth/sharepoint', passport.authenticate('sharepoint'),
		function(req, res){
			//called once we have received a token from SP
			res.redirect('/beersapp');
		}
	);
	
	/*get me information*/
	app.route('/sharepoint/me').get(sharepoint.me);
	
	/*SP "beerdocs" routes*/
	app.route('/beerdocs').get(sharepoint.beerDocsList);
	app.route('/beerdocs/:beerSku')
		.get(sharepoint.beerDocsReturnByBeerSku);
	
	app.route('/beerdocfile/:id')
		.get(sharepoint.beerDocsReturnFileById);
		
	app.route('/beerdocskus')
		.get(sharepoint.skusList);
	app.route('/beerdocskus/:beerSku')
		.get(sharepoint.skusReturnOne)
		.post(sharepoint.skusCreate);
	
	// Finish by binding the user middleware
	//app.param('userId', users.userByID);
};