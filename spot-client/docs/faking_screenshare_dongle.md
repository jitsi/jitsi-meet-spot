# Faking the wired screensharing dongle

Spot-TV supports wired screensharing by allowing a camera source to be used in Jitsi-Meet as a screensharing source. Normally wired screensharing is done by purchasing a dongle that acts a camera input and has an input for another device to connect to it so that other device's display can be passed through. On the WebRTC side, the way to use the dongle is to get the video stream from the dongle, as it is detected as a regular videoinput.


## Faking with software
This behavior can be simulated with software. For example, fake camera software can be installed and set up to show a static screen. This static screen simulates the dongle with no device connected to it. Then within the software switch to another camera input or another screen to simulate plugging a device into the dongle.

To set up an environment for faking:
1. Have the fake camera software running.
1. Set the fake camera software to display a static screen.
1. Proceed into Spot-TV setup.
1. Proceed until reaching device selection.
1. Select the fake camera as a screensharing source.
1. Complete setup.
1. Within the fake camera software, switch to another camera feed.

## Faking with hardware
A static screen can also be faked reliably by covering up the camera.
1. Proceed into Spot-TV setup.
1. Proceed until reaching device selection.
1. Cover the camera to be used as a screensharing source.
1. Select the camera as a screensharing source.
1. Complete setup.
1. When wanting to trigger automatic wired screensharing, uncover the camera.
