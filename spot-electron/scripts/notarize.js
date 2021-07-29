/* eslint-disable no-console */

require('dotenv').config();
const { notarize } = require('electron-notarize');

exports.default = async function notarizing(context) {
    const { electronPlatformName, appOutDir } = context;

    if (electronPlatformName !== 'darwin') {
        return;
    }

    if (!(process.env.NOTARIZE_BUNDLE_ID && process.env.NOTARIZE_APPLE_ID && process.env.NOTARIZE_APPLE_ID_PASSWORD)) {
        console.info('No parameters found, skipping notarization...');

        return;
    }

    console.info('Notarizing Mac app...');

    const appName = context.packager.appInfo.productFilename;

    return await notarize({
        appBundleId: process.env.NOTARIZE_BUNDLE_ID,
        appPath: `${appOutDir}/${appName}.app`,
        appleId: process.env.NOTARIZE_APPLE_ID,
        appleIdPassword: process.env.NOTARIZE_APPLE_ID_PASSWORD
    });
};
