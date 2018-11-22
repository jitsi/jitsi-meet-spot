## Creating the Google API client for Google Calendar integration

In summary, a Google application will be made so that a Google Calendar can be accessed by Spot.

1. Log into a Google account.
1. Go to Google cloud platform dashboard. https://console.cloud.google.com/apis/dashboard
1. In the Select a Project dropdown, click New Project.
1. Give the project a name.
1. Proceed to the Credentials settings of the new project.
1. In the Credentials tab of the Credentials settings, click Create Credentials and select the type OAuth client ID.
1. Proceed with creating a Web application and add the domains (origins) on which the application will be hosted. Local development environments (http://localhost:8000 for example) can be added here.
1. While still in the Google cloud platform dashboard, click the Library settings for the calendar project.
1. Search for the Google Calendar API (used for calendar accessing), click its result, and enable it.
1. Do the same for Admin APK API (used for connecting with rooms).
