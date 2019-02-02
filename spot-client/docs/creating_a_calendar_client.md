For Spot to display a calendar, an integration application needs to be made so Spot can talk to the application in order to obtain calendar events.

## Creating the Google API client for Google Calendar integration

1. Log into a Google admin account.
1. Go to Google cloud platform dashboard. https://console.cloud.google.com/apis/dashboard
1. In the Select a Project dropdown, click New Project.
1. Give the project a name.
1. Proceed to the Credentials settings of the new project.
1. In the Credentials tab of the Credentials settings, click Create Credentials and select the type OAuth client ID.
1. Proceed with creating a Web application and add the domains (origins) on which the application will be hosted. Local development environments (http://localhost:8000 for example) can be added here.
1. While still in the Google cloud platform dashboard, click the Library settings for the calendar project.
1. Search for the Google Calendar API (used for calendar accessing), click its result, and enable it.
1. Do the same for Admin APK API (used for connecting with rooms).
1. Proceed to the admin dashboard. https://admin.google.com
1. Proceed to Security > API reference.
1. Click Enable API access.

## Creating the Microsoft app for Microsoft Outlook integration

1. Go to https://apps.dev.microsoft.com/
1. Proceed through the "Add an app" flow. Once created, a page with several Graph Permissions fields should display.
1. Under "Platforms" add "Web"
1. Add a redirect URL for the Microsoft auth flow to visit once a user has confirmed authentication. By default this is the base url. For example, a spot instance hosted on http://localhost:8000 can have the same redirect URL.
1. Add the following delegated graph permissions: Calendars.Read, Calendars.Read.Shared, User.Read
1. Save the changes.

Note: The user which will be logged into the calendar integration should be a delegate of the room which will be connected to Spot. This can be set in the admin portal, https://admin.microsoft.com/AdminPortal/Home#/ResourceMailbox.
1. Select the desired room.
1. Set the Delegate.
1. Also, Edit Exchange Settings and set the delegate in "mailbox delegation."
