# Manual Test Plan

This document is a manual QA test plan to run as needed. Also, it serves as a feature and behavior summary for Spot.

Note that some of the test cases should already be automated in Spot-Webdriver.

Environments supported as a Spot-Remote
------
- [ ] Latest Firefox
- [ ] Latest Chrome (has wireless screenshare support)
- [ ] Latest Safari
- [ ] Latest iOS Safari
- [ ] Latest Android Chrome
- [ ] Android App
- [ ] iOS 11.x iPad/iPhone App
- [ ] iOS 12.x iPad/iPhone App
- [ ] iOS 13.x iPad/iPhone App

Hosting
------
- [ ] Spot-TV can only be opened either from Chrome or the native electron wrapper(spot-electron)
- [ ] Spot-TV displays a compatibility message for non-Chrome browsers

Pairing
------
- [ ] Spot-Remote can pair with Spot-TV
- [ ] Backend flow only: both temporary and permanent remotes can be paired
- [ ] Backend flow only: Spot TV pairing code can be passed as a URL param (llpc)
- [ ] Backend flow only: Permanent remote pairing screen can be skipped with URL param (skipPairRemote)

Calendar
------
- [ ] Spot-Remote sees Spot-TV's calendar events

Setup
------
- [ ] Device selection is saved
- [ ] Selected devices are used in a meeting
- [ ] Wired screensharing can be enabled and disabled
- [ ] Room name is saved and displayed in the app and meeting
- [ ] Device selection screen can be skipped with URL param (skipSelectMedia)

Home
------
- [ ] Spot-Remote starts a meeting from a calendar event
- [ ] Spot-Remote starts an ad-hoc meeting with random name
- [ ] Spot-Remote starts an ad-hoc meeting with typed in name
- [ ] Spot-Remote starts an ad-hoc meeting on a specified domain
- [ ] Spot-Remote starts an ad-hoc meeting by dialing out
- [ ] Spot-Remote starts an ad-hoc meeting with wired screenshare
- [ ] Spot-Remote starts an ad-hoc meeting with wireless screenshare

Spot In Meeting (with two remotes)
------
- [ ] Spot-Remote toggles audio mute
- [ ] Spot-Remote toggles video mute
- [ ] Spot-Remote toggles wireless screensharing
- [ ] Spot-Remote toggles wired screensharing
- [ ] Spot-TV automatically hides filmstrip when screensharing in a lonely call
- [ ] Spot-TV automatically pins the latest screenshare
- [ ] Spot-Remote toggles tile view layout
- [ ] Spot-Remote can change Spot-TV volume when Spot-TV is hosted in Electron
- [ ] Spot-Remote cannot change Spot-TV volume when Spot-TV is hosted in a browser
- [ ] Spot-Remote hangs up
- [ ] Spot-Remote submits feedback
- [ ] Spot-TV and Spot-Remote proceed to Home after feedback submission
- [ ] Spot-Remote can send touch tones (when dialing into a jitsi-meet call for example)
- [ ] If native volume control is supported on the Spot-TV (URL param volumeControlSupported), volume control UI appears on the Spot-Remote

Wireless SS
------
- [ ] Spot-Remote stops wireless SS by clicking the Chrome bar
- [ ] Spot-Remote stops wireless SS by clicking the hangup button
- [ ] Spot-Remote stops wireless SS by closing the browser window
- [ ] Spot-Remote cancels screenshare picker
- [ ] Spot-Remote cannot share wirelessly on any browser except Chrome

Automatic Wired Screensharing
------
- [ ] Spot-TV at Home automatically joins a meeting with SS when connecting a device
- [ ] Spot-TV in a meeting automatically starts SS when connecting a device
- [ ] Spot-TV in a meeting automatically stops SS when disconnecting a device

In-Meeting Errors
------
- [ ] Spot-Remotes can enter a password for a locked meeting
- [ ] Spot-TV and Spot-Remote show an error message when kicked from a meeting

Disconnects - Open source flow
------
- [ ] Spot-TV reloads the page and Spot-Remote displays join code entry
- [ ] Spot-TV reestablishes its own connection to the backend after losing internet

Disconnects - Backend flow
------
- [ ] Spot-TV exits the browser and Spot-Remotes remains waiting for the Spot-TV
- [ ] Spot-TV automatically rejoins with existing setup when re-opening the browser
- [ ] Spot-Remote reconnects automatically to the Spot-TV after the Spot-TV reconnects
- [ ] Spot-TV reestablishes its own connection to the backend after losing internet
- [ ] Permanent Spot-Remote reestablishes its connection to the Spot-TV after losing internet
- [ ] Temporary Spot-Remote does not try to establish its connection to the Spot-TV after losing internet
- [ ] Temporary Spot-Remotes are disconnected after a meeting ends.

Screenshare Selection
------
Wired available and wireless available
- [ ] Click start sharing shows selection buttons for both
- [ ] Click Wireless opens desktop picker
- [ ] Click start with Wireless in progress shows modal with stop button
- [ ] Clicking stop wireless screenshare button stops screenshare, displays selection again  
- [ ] Clicking Wired shows connect cable message
- [ ] Click start with wired in progress shows stop button
- [ ] Clicking stop wired screenshare button stops screenshare, displays selection again

Wired unavailable and wireless available
- [ ] Click start opens desktop picker
- [ ] Click start with wireless in progress shows modal with stop button
- [ ] Clicking stop wireless closes the modal
- [ ] There is no mention of wired screensharing

Wired available and wireless unavailable
- [ ] Click start opens the modal showing connect cable message
- [ ] Click start with wired in progress shows stop button
- [ ] Clicking stop button stops screenshare, displays start again
- [ ] Clicking start wireless screensharing button opens modal asking to use different browser

Wired unavailable and wireless unavailable
- [ ] Clicking start wireless screensharing button opens modal asking to use different browser
- [ ] There is no mention of wired screensharing

Share Mode
------
- [ ] Spot-Remote enters share mode when submitting the join code while the host name matches the one specified share domain in config
- [ ] Spot-Remote enters share mode when submitting the join code with the "share" query param present
- [ ] Spot-Remote is automatically prompted with the screenshare picker after initial join code submit
- [ ] On wireless screenshare start, and Spot-TV not in a meeting, Spot-TV enters a random meeting with screensharing
- [ ] On wireless screenshare start, and Spot-TV in a meeting, SpotTV starts wireless screensharing in the current meeting
- [ ] Spot-Remote stopping screensharing exists the meeting if in a lonely call
- [ ] Spot-Remote stopping screensharing stays in the meeting if other participants are in the meeting
- [ ] Another Spot-Remote, not in share mode, stopping the screensharing leaves Spot-TV in the meeting
- [ ] Unsupported browsers cannot start wireless but do see mode select to become a full remote control
- [ ] At mode select, Spot-Remote cannot start a wireless screenshare if Spot-TV is already screensharing

Auto-updates - Backend flow only
------
- [ ] Automatically reloads the page at the configured time (default 2am). This can be faked in console via spot.remoteControlClient.disconnect().then(() => window.location.reload()) and spot.remoteControlServer.disconnect().then(() => window.location.reload()).
- [ ] Automatically reloads when a new client version is made available.

Zoom integration -- Backend flow only
------
- [ ] Can join a zoom meeting through the ad-hoc input
- [ ] Can wait for a meeting to start
- [ ] Can cancel out of waiting for a meeting to start
- [ ] Can audio mute
- [ ] Can video mute
- [ ] Can hang up
