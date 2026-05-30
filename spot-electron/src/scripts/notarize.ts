import { notarize } from '@electron/notarize';
import dotenv from 'dotenv';

dotenv.config();

/** The subset of the electron-builder afterSign context this hook uses. */
interface NotarizeContext {
    appOutDir: string;
    electronPlatformName: string;
    packager: {
        appInfo: {
            productFilename: string;
        };
    };
}

/**
 * electron-builder `afterSign` hook that notarizes the macOS build when the
 * required credentials are present in the environment.
 *
 * @param context - The electron-builder after-sign context.
 * @returns {Promise<void>}
 */
export default async function notarizing(context: NotarizeContext): Promise<void> {
    const { electronPlatformName, appOutDir } = context;

    if (electronPlatformName !== 'darwin') {
        return;
    }

    const teamId = process.env.NOTARIZE_TEAM_ID;
    const appleId = process.env.NOTARIZE_APPLE_ID;
    const appleIdPassword = process.env.NOTARIZE_APPLE_ID_PASSWORD;

    if (!(teamId && appleId && appleIdPassword)) {
        console.info('No parameters found, skipping notarization...');

        return;
    }

    const appName = context.packager.appInfo.productFilename;
    const appPath = `${appOutDir}/${appName}.app`;

    console.info(`Notarizing Mac app: ${appPath}`);

    await notarize({
        appPath,
        appleId,
        appleIdPassword,
        teamId
    });
}
