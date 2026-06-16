/**
 * Browser globals the app attaches to `window`.
 *
 * NOTE: ambient declarations for non-code asset imports (*.scss etc.) and for
 * untyped packages (@jitsi/logger, @jitsi/js-utils/*) live in `modules.d.ts` — a
 * *script* file — because `declare module` in this module file (it has
 * `export {}`) would be treated as augmentation and would not satisfy
 * side-effect imports / installed JS packages.
 */

declare global {
    interface Window {
        /** Runtime config injected by `config.js` (see `common/app-state/config`). */
        JitsiMeetSpotConfig?: Record<string, any>;

        /**
         * The Jitsi Meet external (iframe) API constructor, loaded at runtime.
         * The instance surface is large and used loosely, so it stays `any`.
         */
        JitsiMeetExternalAPI?: new (domain: string, options: Record<string, any>) => any;

        /** Screensharing source picker hook consumed by lib-jitsi-meet in Electron. */
        JitsiMeetScreenObtainer?: {
            openDesktopPicker(options: any, onSourceChoose: any): void;
        };

        /** Debug/E2E hooks exposed by the app under the `spot` namespace (see spot-webdriver). */
        spot?: Record<string, unknown>;
    }
}

export {};
