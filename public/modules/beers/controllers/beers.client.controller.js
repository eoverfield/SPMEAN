'use strict';

//var moment = require('../../../libs/moment/min/moment.min');

angular.module('beers').controller('BeersController', ['$scope', '$stateParams', '$location', 'Beers', 'BeerDocs', 'BeerDocSkus',
	function($scope, $stateParams, $location, Beers, BeerDocs, BeerDocSkus) {
		$scope.create = function() {
			var beer = new Beers({
				beerSku: this.beerSku,
				name: this.name,
				description: this.description,
				labelUrl: this.labelUrl,
				releaseDate: this.releaseDate,
				available: this.available
			});
			beer.$save(function(response) {
				
				$scope.docSkus = BeerDocSkus.save({
					beerSku: response.beerSku
				}, function() {
					$location.path('beers/' + response.beerSku);
				
					$scope.beerSku = '';
					$scope.name = '';
					$scope.description = '';
					$scope.labelUrl = '';
					$scope.releaseDate = '';
					$scope.available = '';
				});
				
				
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.remove = function(beer) {
			if (beer) {
				beer.$remove();

				for (var i in $scope.beers) {
					if ($scope.beers[i] === beer) {
						$scope.beers.splice(i, 1);
					}
				}
			} else {
				$scope.beer.$remove(function() {
					$location.path('beers');
				});
			}
		};

		$scope.update = function() {
			var beer = $scope.beer;

			//beer.releaseDate = agMoment(beer.releaseDate).format('MM-DD-YYYY HH:mm:ss');
			
			beer.$update(function() {
				$location.path('beers/' + beer.beerSku);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.find = function() {
			$scope.beers = Beers.query();
			
			//console.log($scope.beers);
		};

		$scope.findOne = function() {
			$scope.beer = Beers.get({
				beerSku: $stateParams.beerSku
			}, function() {
				$scope.beer.docs = BeerDocs.get({
					beerSku: $stateParams.beerSku
				}, function() {
					//console.log($scope.beer);
				});
			});
		};
	}
]);