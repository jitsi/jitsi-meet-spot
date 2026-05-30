/**
 * Ambient module declarations for assets and runtime deps without bundled types.
 */

declare module '*.svg' {
    import type { FC } from 'react';
    import type { SvgProps } from 'react-native-svg';

    const content: FC<SvgProps>;

    export default content;
}

declare module 'react-native-keep-awake' {
    import type { ComponentType } from 'react';

    const KeepAwake: ComponentType;

    export default KeepAwake;
}

declare module 'jitsi-meet-logger' {
    interface JitsiLogger {
        trace(...args: unknown[]): void;
        debug(...args: unknown[]): void;
        info(...args: unknown[]): void;
        log(...args: unknown[]): void;
        warn(...args: unknown[]): void;
        error(...args: unknown[]): void;
    }

    export function getLogger(
        id?: string,
        transports?: unknown,
        options?: { disableCallerInfo?: boolean; }
    ): JitsiLogger;
}
