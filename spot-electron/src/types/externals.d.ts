/**
 * Ambient module declarations for runtime dependencies that ship no TypeScript
 * types of their own (or, for `win-audio`, are an optional Windows-only dep that
 * is absent on other platforms).
 */

declare module 'node-osascript' {
    type ExecuteCallback = (error: Error | null, result?: unknown) => void;

    interface NodeOsascript {
        execute(script: string, callback: ExecuteCallback): void;
        execute(script: string, variables: Record<string, unknown>, callback: ExecuteCallback): void;
    }

    const osascript: NodeOsascript;

    export default osascript;
}

declare module 'win-audio' {
    interface AudioDevice {
        get(): number;
        set(value: number): void;
    }

    export const speaker: AudioDevice;
    export const mic: AudioDevice;
}

declare module '@jitsi/logger' {
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

    export const levels: Record<string, string | number>;

    export function addGlobalTransport(transport: unknown): void;
}
