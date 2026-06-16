/*
 * Expo app config. Dynamic so the app id and version can still be overridden at
 * build time via SPOT_APP_ID / SPOT_VERSION (preserving the mechanism the old
 * bare android/build.gradle used).
 */

const APP_ID = process.env.SPOT_APP_ID || 'org.jitsi.spot';
const VERSION = process.env.SPOT_VERSION || '2019.08.07';

/** @type {import('@expo/config').ExpoConfig} */
module.exports = {
    name: 'Spot',
    slug: 'spot-controller',
    version: VERSION,
    orientation: 'default',
    icon: './assets/icon.png',
    backgroundColor: '#000000',
    userInterfaceStyle: 'light',
    assetBundlePatterns: [ '**/*' ],
    ios: {
        bundleIdentifier: APP_ID,
        supportsTablet: true,
        infoPlist: {
            // The WebView loads arbitrary Spot deployments, which may not all be
            // HTTPS — matches the old Info.plist NSAllowsArbitraryLoads.
            NSAppTransportSecurity: {
                NSAllowsArbitraryLoads: true
            },
            NSBluetoothPeripheralUsageDescription: 'Detect nearby meeting devices'
        }
    },
    android: {
        package: APP_ID,
        adaptiveIcon: {
            foregroundImage: './assets/icon.png',
            backgroundColor: '#000000'
        },
        // Matches the old AndroidManifest android:allowBackup="false".
        allowBackup: false
    },
    plugins: [
        [
            'expo-build-properties',
            {
                // Matches the old AndroidManifest android:usesCleartextTraffic="true"
                // so non-HTTPS Spot deployments still load.
                android: {
                    usesCleartextTraffic: true
                }
            }
        ],
        [
            'expo-splash-screen',
            {
                backgroundColor: '#000000',
                image: './assets/icon.png',
                imageWidth: 150
            }
        ]
    ]
};
