SPMEAN - MEAN Stack Visual Studio Demo (VS 2013)
============

SharePoint and MEAN Stack demo project - VS Demo Solution

The demo solution and project found in the MeanStackVSDemo solution is intended to help you get started with your SharePoint 2013 App.

The original SharePoint 2013 App was created to be a provider host app. VS created an App as well as app web. The app web was removed as it was not needed. This is what NodeJS will provide for us.

The major changes were made to the AppManifest.xml file. In particular we added the required permissions our demo app requires. We also provided our App Client ID.

#Updating the Client ID

Find the following line in AppManifest.xml

<RemoteWebApplication ClientId="6d6faaab-908c-443a-8c99-40a7b618cadb" />

This ClientId must be replaced with the ClientId for your custom app.

#Create a ClientId and Client Secret in SP.

In a browser, on your app web, open the following page:

http://"yoursite".sharepoint.com/sites/"yoursitecollection"/_layouts/15/AppRegNew.aspx

Generate a ClientId and Client Secret. The demo values we provided for our demo app:

	Client Id:   	6d6faaab-908c-443a-8c99-40a7b618cada
	Client Secret:   	(our secret)
	Title:   	PM Mean Demo 1
	App Domain:   	localhost
	Redirect URI:   	https://localhost
	
Once you generate your App and obtain your Client Id and Client Secret, you must also update your NodeJS app.

Open the file: \config\env\secure.js

At the bottom of this file, update the following lines with your ClientId and ClientSecret

	sharepoint: {
		clientID: process.env.SHAREPOINT_ID || '6d6faaab-908c-443a-8c99-40a7b618cadb', //get from: /_layouts/15/AppRegNew.aspx
		clientSecret: process.env.SHAREPOINT_SECRET || '(our secret)' //get from: /_layouts/15/AppRegNew.aspx
		//callbackURL: '' /*we are not redirecting to SP, rather we are getting a token so no need for a callback*/
	}


