'use strict';

/**
 * Module dependencies.
 */
 var passport = require('passport'),
	url = require('url'),
	SharePointStrategy = require('passport-sharepoint').Strategy,
	config = require('../config'),
	users = require('../../app/controllers/users.server.controller');

module.exports = function() {
	// Use sharepoint strategy
	passport.use(new SharePointStrategy({
			appId: config.sharepoint.clientID ,
			appSecret: config.sharepoint.clientSecret ,
			//callbackURL: config.sharepoint.callbackURL, //not using callbackURL for now
			spLanguage: '',
			passReqToCallback: true //tells NodeJS that we want to execute the function below when oauth complete
		},
		//this is our callback function. passReqToCallback from above is telling passport our callback is expecting req as well
		function(req, accessToken, refreshToken, profile, done) {
			//review profile json data (look for sample data at bottom of this file)
			//console.log('profile: %j', profile); //raw profile object
			//console.log('profile id: ' + profile.id);
			//console.log('username: ' + profile.username);
			//console.log('cacheKey: ' + profile.cacheKey);
			//console.log('accessToken: ' + accessToken);
		
			//review refreshToken json data (look for sample data at bottom of this file)
			//console.log('refreshToken %j', refreshToken);
		
			// Set the provider data and include tokens
			// provider data is what we will be storing in model document collection
			var providerData = profile._raw;
			providerData.accessToken = accessToken;
			providerData.refreshToken = refreshToken;

			// Create the user OAuth profile to store in model
			var providerUserProfile = {
				displayName: profile.displayName,
				email: profile.emails[0].value,
				username: profile.username,
				host: profile.host,
				site: profile.site,
				provider: 'sharepoint',
				providerIdentifierField: 'id',
				providerData: providerData
			};
			
			// Save the user OAuth profile to our model
			users.saveOAuthUserProfile(req, providerUserProfile, done);
			
			//does not need to return anything. This middleware is over and control is passed back to router that brought us here
			//with SP, user should be redirected to app page at this point.
		} /* /end our callback from passport authentication request */
	));
};


/* sample profile returned from OAUTH
{
	"provider":"sharepoint",
	"id":9,
	"username":"i:0#.f|membership|eoverfield@pixelmill.com",
	"displayName":"Eric Overfield",
	"emails":[{
		"value":"eoverfield@pixelmill.com"
	}],
	"host":"https://pixelmill.sharepoint.com",
	"site":"/sites/demo-mean-dev1/",
	"_raw":{
		"d":{
			"__metadata":{
				"id":"https://pixelmill.sharepoint.com/sites/demo-mean-dev1/_api/Web/GetUserById(9)",
				"uri":"https://pixelmill.sharepoint.com/sites/demo-mean-dev1/_api/Web/GetUserById(9)",
				"type":"SP.User"
			},
			"Groups":{
				"__deferred":{
					"uri":"https://pixelmill.sharepoint.com/sites/demo-mean-dev1/_api/Web/GetUserById(9)/Groups"
				}
			},
			"Id":9,
			"IsHiddenInUI":false,
			"LoginName":"i:0#.f|membership|eoverfield@pixelmill.com",
			"Title":"Eric Overfield",
			"PrincipalType":1,
			"Email":"eoverfield@pixelmill.com",
			"IsShareByEmailGuestUser":false,
			"IsSiteAdmin":false,
			"UserId":{
				"__metadata":{
					"type":"SP.UserIdInfo"
				},
				"NameId":"1003bffd865c89d4",
				"NameIdIssuer":"urn:federation:microsoftonline"
			}
		}
	},
	"cacheKey":"lq5hppdm+keAaD0CpLlTkREAHXWq97GhFQT4BmtDI/4="
}
*/

/* sample refresh Token
{
	"token_type":"Bearer",
	"access_token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6ImtyaU1QZG1Cdng2OHNrVDgtbVBBQjNCc2VlQSJ9.eyJhdWQiOiIwMDAwMDAwMy0wMDAwLTBmZjEtY2UwMC0wMDAwMDAwMDAwMDAvcGl4ZWxtaWxsLnNoYXJlcG9pbnQuY29tQGU0NmM5MzAzLTMzMWQtNDIxMi1hZjUwLWYwYTZiNzc0MDFlNCIsImlzcyI6IjAwMDAwMDAxLTAwMDAtMDAwMC1jMDAwLTAwMDAwMDAwMDAwMEBlNDZjOTMwMy0zMzFkLTQyMTItYWY1MC1mMGE2Yjc3NDAxZTQiLCJuYmYiOjE0MTY0NTU2MTgsImV4cCI6MTQxNjQ5ODgxOCwibmFtZWlkIjoiMTAwM2JmZmQ4NjVjODlkNCIsImFjdG9yIjoiNmQ2ZmFhYWItOTA4Yy00NDNhLThjOTktNDBhN2I2MThjYWRiQGU0NmM5MzAzLTMzMWQtNDIxMi1hZjUwLWYwYTZiNzc0MDFlNCIsImlkZW50aXR5cHJvdmlkZXIiOiJ1cm46ZmVkZXJhdGlvbjptaWNyb3NvZnRvbmxpbmUifQ.g_6I_S1-au4shEMJ7UOV4Lw5RiOpvbwtPf3zl9S_iG_ygVsxwwi0vDXyRDWNBLaAa3NlViTLoO21nVbb1w5GWK2P_b5AcJJCGnmqN0Jy0HXOvFlVMX0Kux8GlyBjpBoIvNc5pSIinS41EVlYNerDdc2rIy04VFmiE-DWT5ZDsmot02TseAFUWUJ0ReIMUcha6E_nfbY9j0ypiCnh5n3QuTZZdUgc6Q_JzEHWNBl6Y-xfuC4sNDEVPnkQ92yri1-LyCXYeb3DdQKNspyp9IeU6XVDaORWC5qTqluiGyfEu4K4N4NdPeyh9sw3N0i5VWf4ljHBbkPed5C87ueaU_HZmg",
	"expires_in":"43199",
	"not_before":"1416455618",
	"expires_on":"1416498818",
	"resource":"00000003-0000-0ff1-ce00-000000000000/pixelmill.sharepoint.com@e46c9303-331d-4212-af50-f0a6b77401e4"
}
*/