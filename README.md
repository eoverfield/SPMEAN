SPMEAN
============

SharePoint and MEAN Stack demo project

###Execute the following commands
1. git clone https://github.com/eoverfield/SPMEAN.git yourWebApp
2. cd yourWebApp
3. npm install

*You may have to execute npm install twice because of timeout or lock issues*

The above commands will make a clone (copy) of the current master branch of the demo NodeJS project. You may replace yourWebApp with your own folder name

update ./config/env/secure.js with clientId and clientSecret for your app

*set the node_env to secure*
* Powershell
  * $env:NODE_ENV="secure"
  * (or for production) $env:NODE_ENV="production"
* in command line - for secure connection
  * set NODE_ENV secure

before you execute grunt, you will need to have MongoDB set up and configured, instructions are found below.

execute in shell: grunt

At this point NodeJS should be running our NodeJS web app on localhost. Additional information found below.


###Additional notes:

*Install MongoDb*
	#https://www.mongodb.org/downloads


	
*Install NodeJS*
* http://nodejs.org/download/
* test script to make sure it works
* find Hello World example folder, execute command
* node hello.js

make sure that "node" is in your system "PATH"



*install Git*
	#http://git-scm.com/downloads
	
*Install Bower(Package manager), using npm (node package manager), requires internet access*
npm install -g bower

*Install Grunt Task Runner (aids running package)*
npm install -g grunt-cli



*Create MongoDB Database*
1. C:\>"C:\DataStore\Mean Stack\MongoDB\MongoDBBin\bin\mongo.exe"
2. Paste all content from "helper_scripts\MongDB_initial_data.txt" into mongoDB shell


	
*Register a new SP App in your SP Dev site so as to get a clientID and clientSecret*
i.e.: /_layouts/15/AppRegNew.aspx
i.e.: https://pixelmill.sharepoint.com/sites/demo-mean-dev1/_layouts/15/AppRegNew.aspx
	/* Demo 
	Client Id:   	6d6faaab-908c-443a-8c99-40a7b618cada
	Client Secret:   	JZNnw1LCgznGXHIOF1oyB40jHpSpkgxlYS6/2ZXvhJh=
	Title:   	PM Mean Demo 1
	App Domain:   	localhost
	Redirect URI:   	https://localhost
	*/
		
*Create a new SP 2013 App in Visual Studio*

A demo app may be found in vs_solution folder


###How MEANJS was originally built

Open PowerShell (more powerful than command line. Could also use git bash)

*Get the MeanJS scaffolding*
* git clone https://github.com/meanjs/mean.git meanBeerApp
* cd meanBeerApp

*modify package.json to modify any settings*
package.json 

*Install the package (has to download all packages, may take a few minutes)*
npm install



*we need to configure environment variables*
cd config/env

edit all.js to add more .js files such as moment and angularMoment

*edit secure.js to remove assets and strategies we do not need as well as add SharePoint App vars*
* set mongoDb db - i.e. 'mongodb://localhost/meanBeerApp',
* here is where you will add your SP App clientID and clientSecret

	
*cd ../strategies (config/strategies)*

remove all strategies and add sharepoint.js (update strategy)


*create sslcerts folder in config and upload certificate files*


*cd config*

update express.js, removing facebook call and updating ssl certs files



*We can now configure the node server side "app"*

*controllers*

cd app/controllers

* remove article
* add beer and sharepoint
* update core to give it title
* update users to remove users.password

cd app\controllers\users

* update users.authentication to remove signup and remove, update save
* remove users.password as not needed


*models (our connection to our mongoDB)*
* cd app\models
* remove article, add beers
* update user.server.model


*routes*
* cd app\routes
* remove articles
* add beers and sharepoint
* update core and users (core - main routes for app, users - remove all unneeded user routes)



*views*
* cd app\views
* add spapp (an spapp response page that is not used)
* remove templates sub folder, not needed



*upate password-sharepoint strategy*
* cd \node_modules\passport-sharepoint\lib\passport-sharepoint
* copy over updated strategy.js #changed a few redirects and other aspects

*The "app" is now ready to running, change to root of app*
* cd ./ 
* --set the node_env to secure
* $env:NODE_ENV="secure"

* $env:NODE_ENV="production" /*powershell*/
* set NODE_ENV secure /*in command line - for secure connection*/

*execute*

grunt


*app should now be running on local host with SSL cert*

*load in browser*

* https://localhost/beers
* https://localhost/beers/pb001
* https://localhost/beers/pb002



###now move onto Angular (client side rendering)

cd public

*replace application.js if you want to add moment. Will also need to install moment js files*
* cd /(root of app)
* bower install moment --save
* bower install angular-moment --save
* replace config.js if you want to add angularMoment dependency


*dist* is home for final js deliverables to client, must be compiled. For dev, we configured to use all js files. not as efficientmo but easier during development

*lib* is for libraries we would add to using npm


*modules - modules are Angular based containers for storing sets of functions*
* cd modules
* remove articles
* add beers module
  * contains config / routes, controllers, services and views - views are templates
* update core
* cd core/config
  * replace core.client.routes to update routes to route to beers module
	
	
	
*we are all set, return to demo site "Site contents" and click on app*

https://pixelmill.sharepoint.com/sites/demo-mean-dev1/...

1. add a new beer, see how new BeerSKU is added to SP
2. Add new document to beerSkuDocs in SP, linking to new beerSku.
3. return to mean app and view


###Other demos to try

* now update angular Mean View for viewing doc to add more SP Doc Data.
* look at how if at all we need to update node app to provide more data from SP