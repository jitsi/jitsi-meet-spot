# Glossary
Terms for features used within spot.

### Ad-hoc meeting
A meeting not scheduled on a calendar that Spot-TV has access to. The ad-hoc meeting is created by manually entering a meeting name within the Spot-Remote to create the meeting.

### Admin
The person setting up and maintaining Spots. This person knows about how to go through setup flow for Spot-TV and understands how the different parts of Spot interact.

### Calendar meeting
A meeting scheduled on a calendar that is connected to Spot-TV. The meeting URL cannot be changed by Spot-TV but is instead part of a calendar event.

### Controller, Spot Controller, Standalone App
The React-Native application for displaying the Spot-Remote. It is intended to be left connected to a Spot-TV and left located in a Spot-Room so users can interact with it to control the Spot-TV.

### Join code, Share key
The 6-character code a user needs to enter in order to get a Spot-Remote to become connected to Spot-TV. Once connected, the Spot-Remote can make Spot-TV join a meeting and has access to Spot-TV's in-meeting controls. 

### lib-jitsi-meet
The javascript library which contains XMPP, MUC, and WebRTC code used by Jitsi-Meet for its video conferencing. Spot re-uses the library for its own needs.

### Quiet
A library for ultrasound transmitting and decoding. The main library is lib-quiet, written in C, but the maintainer provides iOS, Android, and JS libraries to use lib-quiet. See Ultrasound.

### RCS, Remote Control Service
The objects which encapsulates setting up a connection between a Spot-Remote and a Spot-TV and encapsulates how they communicate with each other. Spot-TV and Spot-Remote have their own versions of the service, with Spot-Remote having more functionality around sending commands whereas Spot-TV has more functionality around processing commands and sending status updates.

### Remote Control Client
The name for the subclass of Remote Control Service used by Spot-Remote.

### Remote Control Server
The name for the subclass of Remote Control Service used by Spot-TV.

### Share Mode
Spot-Remote supports a special UX flow where the UI is reduced mainly to starting and stopping wireless screensharing. 

### Spot
A standalone web application intended for conference integration with a huddle room. One part of the application is Spot-TV, which runs on a computer and is left running on a screen. Spot-TV has no direct controls on it. Instead, another part of the application,the Spot-Remote, must be used to navigate to meetings with the Spot-TV.

### Spot-Electron
A desktop application intended to be used to show a Spot-TV. Spot-TV should support browsers but the desktop application provides functionality that needs operating system access.

### Spot-MUC
Spot has two main components: Spot-TV and Spot-Remote. The Spot-TV talks to Spot-Remotes about its status, such as in-meeting state and what view it is displaying. Spot-Remotes can send commands to Spot-TV to take actions, such as joining a meeting. To facilitate the communication, Spot-TV and Spot-Remotes join a multi-user conference (MUC) and send messages to each other in that MUC.

### Spot-Remote
A sub-application of Spot, allowing Spot-TV to be interacted with without a physical connection. Spot-Remotes includes computers not running spot, phones, tablets, and the mobile app. The difference between Spot-TV and a Spot-Remote is Spot-TV is not intended to have direct interaction with a user; the user interacts with Spot-TV via a Spot-Remote.

### Spot-Room
The physical location in which the Spot-TV is located. It is expected this be a small conference (huddle) room.

### Ultrasonic
Sound that is not readily perceivable by adults due to its high frequency. Can be used to send messages between devices without cables. This is a feature of Spot in which a Spot-Remote, likely an iPad set up as a dedicated Spot-Remote, can emit the join code using ultrasonic. Receivers, such as a web page implementing an ultrasonic receiver, can listen for the join code and take action. The goal is to allow a device to become a Spot-Remote without having to manually navigate to a URL and manually enter a join code.

### Waiting View
A UI state within the Spot-Remote where it is connected to a Spot-TV while the Spot-TV is displaying a calendar. At this point the Spot-TV is waiting for further action to be taken, such as a Spot-Remote entering a meeting.

### Wireless screensharing
Available on certain web browsers only. This feature allows a Spot-Remote to share a screen into a Jitsi-Meet meeting without being physically connected to the Spot-TV machine. This works by the Spot-Remote creating a direct connection to the Jitsi-Meet meeting participant, with Spot-TV acting as an intermediary to help establish that direct connection.

### Wired screensharing
Screen sharing can be done by leaving an input dongle attached to a Spot-TV. A device, such as a laptop, can connect to the dongle. Through the Spot-TV setup flow, the dongle is selected as a screensharing input device. When wired screensharing is selected during a meeting, the Jitsi-Meet meeting will use the video feed from the chosen dongle.
