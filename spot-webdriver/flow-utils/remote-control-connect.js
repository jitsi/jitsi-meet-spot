/**
 * A function to re-use the flow of a remote control connecting to a Spot.
 *
 * @param {SpotTV} spotTV - The {@code} instance for controlling the browser
 * responsible for interacting with the Spot web page.
 * @param {SpotRemote} spotRemote - The {@code} instance for controlling the
 * browser responsible for interacting with the remote control web page.
 * @returns {void}
 */
function remoteControlConnect(spotTV, spotRemote) {
    const calendarPage = spotTV.getCalendarPage();

    calendarPage.visit();

    const joinCode = calendarPage.getJoinCode();

    const joinCodePage = spotRemote.getJoinCodePage();

    joinCodePage.visit();
    joinCodePage.submitCode(joinCode);

    const remoteControlPage = spotRemote.getRemoteControlPage();

    remoteControlPage.waitForVisible();
}

module.exports = remoteControlConnect;
