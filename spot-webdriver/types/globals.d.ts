/**
 * Ambient declarations for the E2E harness.
 */

declare global {
    interface Window {
        /**
         * The Spot app exposes its services and Redux store on `window.spot` for
         * the E2E harness to poll. These are deeply-dynamic app internals and are
         * intentionally left untyped.
         */
        spot: Record<string, any>;
    }
}

export {};
