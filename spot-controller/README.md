# Spot (In-Room, Permanent) Controller

This repository holds the native application used for the dedicated in-room Spot-Remote to be used with a Spot-TV. The current implementation of the native application is to show a webview of the web Spot-Remote, and provide the webview additional functionality.

It is intended that the application be run on a tablet, preferably iPad. However, both phones and tablets are supported for both iOS and Android.

## Setup

For initial iOS and Android setup:
1. Install dependencies with `npm install`
1. Install the React Native CLI `npm install -g react-native-cli`

For iOS setup:
1. `cd ios`
1. Install iOS dependencies with `pod install`
1. Either run the project in Xcode or run `react-native run-ios`

For Android setup:
1. `react-native run-android`


## Debugging Notes
For iOS, the Safari browser can be used to examine the webview. In the Develop menu the connected iOS device should display and allow inspecting of the webview, as if it were opened on Safari itself.

For Android, chrome allows inspection of remote devices via the developer tools. Open developer tools, press Esc, and open the Remote Devices tab. Find the connected device and webview url, click it, and the webview can be inspected, as if it were opened in Chrome itself.