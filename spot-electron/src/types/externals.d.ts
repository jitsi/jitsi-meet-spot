/**
 * Ambient module declarations for runtime dependencies that ship no TypeScript
 * types of their own (or, for `win-audio`, are an optional Windows-only dep that
 * is absent on other platforms).
 *
 * `win-audio` and `@jitsi/logger` are CommonJS modules whose exports Node's ESM
 * loader cannot detect as named exports, so they are declared with a default
 * export only: a named import would type-check but fail at runtime with
 * "does not provide an export named ...".
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

    const winAudio: {
        speaker: AudioDevice;
        mic: AudioDevice;
    };

    export default winAudio;
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

    const jitsiLogger: {
        getLogger(
            id?: string,
            transports?: unknown,
            options?: { disableCallerInfo?: boolean; }
        ): JitsiLogger;
        levels: Record<string, string | number>;
        addGlobalTransport(transport: unknown): void;
    };

    export default jitsiLogger;
}
