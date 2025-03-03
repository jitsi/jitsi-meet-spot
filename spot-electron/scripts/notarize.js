/* eslint-disable no-console */

require('dotenv').config();
const { notarize } = require('@electron/notarize');

exports.default = async function notarizing(context) {
    const { electronPlatformName, appOutDir } = context;

    if (electronPlatformName !== 'darwin') {
        return;
    }

    if (!(process.env.NOTARIZE_TEAM_ID && process.env.NOTARIZE_APPLE_ID && process.env.NOTARIZE_APPLE_ID_PASSWORD)) {
        console.info('No parameters found, skipping notarization...');

        return;
    }

    console.info('Notarizing Mac app...');

    const appName = context.packager.appInfo.productFilename;
    const appPath = `${appOutDir}/${appName}.app`;

    return await notarize({
        appPath,
        appleId: process.env.NOTARIZE_APPLE_ID,
        appleIdPassword: process.env.NOTARIZE_APPLE_ID_PASSWORD,
        teamId: process.env.NOTARIZE_TEAM_ID
    });
};
