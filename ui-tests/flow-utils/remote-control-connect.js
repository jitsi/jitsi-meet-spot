/**
 * A function to re-use the flow of a remote control connecting to a Spot.
 *
 * @param {User} spotUser - The {@code} instance for controlling the browser
 * responsible for interacting with the Spot web page.
 * @param {User} remoteControlUser - The {@code} instance for controlling the
 * browser responsible for interacting with the remote control web page.
 * @returns {void}
 */
function remoteControlConnect(spotUser, remoteControlUser) {
    const calendarPage = spotUser.getCalendarPage();

    calendarPage.visit();

    const joinCode = calendarPage.getJoinCode();

    const joinCodePage = remoteControlUser.getJoinCodePage();

    joinCodePage.visit();
    joinCodePage.submitCode(joinCode);

    const remoteControlPage = remoteControlUser.getRemoteControlPage();

    remoteControlPage.waitForVisible();
}

module.exports = remoteControlConnect;
