# Faking the wired screensharing dongle

Spot supports wired screensharing by allowing a camera source to be used in jitsi-meet as a screensharing source. Normally wired screensharing is done by purchasing a dongle that acts a camera input and has an input put for another device to connect so that other device's display can be passed through. On the WebRTC side, the way to use the dongle is to get the video stream from the dongle, as it is detected as a regular videoinput.

This behavior can be simulated with software. For example, fake camera software can be installed and set up to show a static screen. This static screen simulates the dongle with no device connected to it. Then within the software switch to another camera input or another screen to simulate plugging into the dongle.

To set up an environment for faking:
1. Have the fake camera software running.
1. Set the fake camera software to display a static screen.
1. Proceed into spot-tv setup.
1. Proceed until reaching the wired screenshare setup.
1. Select the fake camera as a video input device.
1. Complete setup.
1. Within the fake camera software, switch to another camera feed.
