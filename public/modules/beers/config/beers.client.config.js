'use strict';

// Configuring the Beers module
angular.module('beers').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Beers', 'beers', 'dropdown', '/beers(/create)?');
		Menus.addSubMenuItem('topbar', 'beers', 'List Beers', 'beers');
		Menus.addSubMenuItem('topbar', 'beers', 'New Beer', 'beers/create');
	}
]);