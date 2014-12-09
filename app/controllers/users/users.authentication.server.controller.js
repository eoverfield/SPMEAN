'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	errorHandler = require('../errors.server.controller'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	User = mongoose.model('User');

/**
 * OAuth callback
 */
exports.oauthCallback = function(strategy) {
	return function(req, res, next) {
		passport.authenticate(strategy, function(err, user, redirectURL) {
			if (err || !user) {
				return res.redirect('/#!/signin');
			}
			req.login(user, function(err) {
				if (err) {
					return res.redirect('/#!/signin');
				}

				return res.redirect(redirectURL || '/');
			});
		})(req, res, next);
	};
};

/**
 * Helper function to save or update a OAuth user profile to model
 */
exports.saveOAuthUserProfile = function(req, providerUserProfile, done) {
	//console.log('saveOAuthUserProfile: Called, review data and then save to model');
	
	// Define a search query fields
	var searchMainProviderIdentifierField = 'providerData.' + providerUserProfile.providerIdentifierField;
	var searchAdditionalProviderIdentifierField = 'additionalProvidersData.' + providerUserProfile.provider + '.' + providerUserProfile.providerIdentifierField;

	// Define main provider search query
	var mainProviderSearchQuery = {};
	mainProviderSearchQuery.provider = providerUserProfile.provider;
	mainProviderSearchQuery[searchMainProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];

	// Define additional provider search query
	var additionalProviderSearchQuery = {};
	additionalProviderSearchQuery[searchAdditionalProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];
	
	// Define a search query to find existing user with current provider profile
	var searchQuery = {
		$or: [mainProviderSearchQuery, additionalProviderSearchQuery]
	};
	
	//console.log('review query\n%j', searchQuery);
	
	//check to see if request already had a user attached to it
	if (!req.user) {
		//console.log('No user found in request.');

		//try to find the user in the model (collection)
		User.findOne(searchQuery, function(err, user) {
			//console.log('findOne complete');
			
			//an error was returned by model
			if (err) {
				//console.log('an error occurred: ' + err);
				return done(err);
			}
			else {
				if (!user) {
					//console.log('No user found in model, so add');
					
					//get possible user names to add to model
					var possibleUsername = providerUserProfile.username || ((providerUserProfile.email) ? providerUserProfile.email.split('@')[0] : '');
					//console.log('try to add username: ' + possibleUsername);

					//look in model looking for unqiue username, will return availableUsername
					User.findUniqueUsername(possibleUsername, null, function(availableUsername) {
						//console.log('find unique useranme done: ' + availableUsername);
						
						//set up new user object to save to model
						user = new User({
							username: availableUsername,
							displayName: providerUserProfile.displayName,
							email: providerUserProfile.email,
							host: providerUserProfile.host,
							site: providerUserProfile.site,
							provider: providerUserProfile.provider,
							providerData: providerUserProfile.providerData
						});

						//console.log('going to save user to model');
						// And save the user
						user.save(function(err) {
							//console.log('save done, so returning done, error and user');
							return done(err, user);
						});
					});
				}
				else {
					//console.log('user found, so no need to add');
					//console.log('user %j', user);
					return done(err, user);
				}
			}
		});
	}
	//else a user was already found in request
	else {
		//console.log('User already found in request.');
		
		// User is already logged in, join the provider data to the existing user
		var user = req.user;

		// Check if user exists, is not signed in using this provider, and doesn't have that provider data already configured
		if (user.provider !== providerUserProfile.provider && (!user.additionalProvidersData || !user.additionalProvidersData[providerUserProfile.provider])) {
			// Add the provider data to the additional provider data field
			if (!user.additionalProvidersData) user.additionalProvidersData = {};
			user.additionalProvidersData[providerUserProfile.provider] = providerUserProfile.providerData;

			// Then tell mongoose that we've updated the additionalProvidersData field
			user.markModified('additionalProvidersData');

			// And save the user
			user.save(function(err) {
				return done(err, user, '/#!/settings/accounts');
			});
		}
		else {
			//return done(new Error('User is already connected using this provider'), user);
			User.findOne(searchQuery, function(err, user) {
				//console.log('Done finding user in model for a user already connected to this provider');
				if (err) {
					//console.log('An error occurred finding user in model when already connected to model: ' + err);
					return done(err);
				}
				else {
					return done(err, user);
				}
			});
		}
	}
};