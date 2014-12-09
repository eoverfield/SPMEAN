'use strict';

module.exports = {
	port: 443,
	db: process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || 'mongodb://localhost/meanBeerApp',
	log: {
		// Can specify one of 'combined', 'common', 'dev', 'short', 'tiny'
		format: 'combined',
		// Stream defaults to process.stdout
		// Uncomment to enable logging to a log on the file system
		options: {
			stream: 'access.log'
		}
	},
	//when ready to go to production, will need to make sure that application.min.js is created using all js files in /public/modules, etc
	/*
	assets: {
		lib: {
			css: [
				'public/lib/bootstrap/dist/css/bootstrap.min.css',
				'public/lib/bootstrap/dist/css/bootstrap-theme.min.css',
			],
			js: [
				'public/lib/angular/angular.min.js',
				'public/lib/angular-resource/angular-resource.min.js',
				'public/lib/angular-animate/angular-animate.min.js',
				'public/lib/angular-ui-router/release/angular-ui-router.min.js',
				'public/lib/angular-ui-utils/ui-utils.min.js',
				'public/lib/angular-bootstrap/ui-bootstrap-tpls.min.js'
			]
		},
		css: 'public/dist/application.min.css',
		js: 'public/dist/application.min.js'
	},
	*/
	sharepoint: {
		clientID: process.env.SHAREPOINT_ID || '6d6faaab-908c-443a-8c99-40a7b618cadb', //get from: /_layouts/15/AppRegNew.aspx
		clientSecret: process.env.SHAREPOINT_SECRET || 'JZNnw1LCgznGXHIOF1oyB40jHpSpkgxlYS6/2ZXvhJo=' //get from: /_layouts/15/AppRegNew.aspx
		//callbackURL: '' /*we are not redirecting to SP, rather we are getting a token so no need for a callback*/
	}
};