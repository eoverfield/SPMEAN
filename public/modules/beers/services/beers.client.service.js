'use strict';

//Beers service used for communicating with the beers REST endpoints
angular.module('beers').factory('Beers', ['$resource',
	function($resource) {
		return $resource('beers/:beerSku', {
			beerSku: '@beerSku'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);

angular.module('beers').factory('BeerDocs', ['$resource',
	function($resource) {
		return $resource('beerdocs/:beerSku', {
			beerSku: '@beerSku'
		});
	}
]);

angular.module('beers').factory('BeerDocSkus', ['$resource',
	function($resource) {
		return $resource('beerdocskus/:beerSku', {
			beerSku: '@beerSku'
		});
	}
]);