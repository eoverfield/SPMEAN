'use strict';

(function() {
	// Beers Controller Spec
	describe('BeersController', function() {
		// Initialize global variables
		var BeersController,
			scope,
			$httpBackend,
			$stateParams,
			$location;

		// The $resource service augments the response object with methods for updating and deleting the resource.
		// If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
		// the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
		// When the toEqualData matcher compares two objects, it takes only object properties into
		// account and ignores methods.
		beforeEach(function() {
			jasmine.addMatchers({
				toEqualData: function(util, customEqualityTesters) {
					return {
						compare: function(actual, expected) {
							return {
								pass: angular.equals(actual, expected)
							};
						}
					};
				}
			});
		});

		// Then we can start by loading the main application module
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		// The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
		// This allows us to inject a service but then attach it to a variable
		// with the same name as the service.
		beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
			// Set a new global scope
			scope = $rootScope.$new();

			// Point global variables to injected services
			$stateParams = _$stateParams_;
			$httpBackend = _$httpBackend_;
			$location = _$location_;

			// Initialize the Beers controller.
			BeersController = $controller('BeersController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one beer object fetched from XHR', inject(function(Beers) {
			// Create sample beer using the Beers service
			var sampleBeer = new Beers({
				title: 'An Beer about MEAN',
				content: 'MEAN rocks!'
			});

			// Create a sample beers array that includes the new beer
			var sampleBeers = [sampleBeer];

			// Set GET response
			$httpBackend.expectGET('beers').respond(sampleBeers);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.beers).toEqualData(sampleBeers);
		}));

		it('$scope.findOne() should create an array with one beer object fetched from XHR using a beerId URL parameter', inject(function(Beers) {
			// Define a sample beer object
			var sampleBeer = new Beers({
				title: 'An Beer about MEAN',
				content: 'MEAN rocks!'
			});

			// Set the URL parameter
			$stateParams.beerId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/beers\/([0-9a-fA-F]{24})$/).respond(sampleBeer);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.beer).toEqualData(sampleBeer);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Beers) {
			// Create a sample beer object
			var sampleBeerPostData = new Beers({
				title: 'An Beer about MEAN',
				content: 'MEAN rocks!'
			});

			// Create a sample beer response
			var sampleBeerResponse = new Beers({
				_id: '525cf20451979dea2c000001',
				title: 'An Beer about MEAN',
				content: 'MEAN rocks!'
			});

			// Fixture mock form input values
			scope.title = 'An Beer about MEAN';
			scope.content = 'MEAN rocks!';

			// Set POST response
			$httpBackend.expectPOST('beers', sampleBeerPostData).respond(sampleBeerResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.title).toEqual('');
			expect(scope.content).toEqual('');

			// Test URL redirection after the beer was created
			expect($location.path()).toBe('/beers/' + sampleBeerResponse._id);
		}));

		it('$scope.update() should update a valid beer', inject(function(Beers) {
			// Define a sample beer put data
			var sampleBeerPutData = new Beers({
				_id: '525cf20451979dea2c000001',
				title: 'An Beer about MEAN',
				content: 'MEAN Rocks!'
			});

			// Mock beer in scope
			scope.beer = sampleBeerPutData;

			// Set PUT response
			$httpBackend.expectPUT(/beers\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/Beers/' + sampleBeerPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid beerId and remove the beer from the scope', inject(function(Beers) {
			// Create new beer object
			var sampleBeer = new Beers({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new beers array and include the beer
			scope.beers = [sampleBeer];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/beers\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleBeer);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.beers.length).toBe(0);
		}));
	});
}());