declare module 'jitsi-meet-logger' {
    class Logger {
        info(message: string, ...params): void;
    }

    export function getLogger(id: string, transports: Array<Object> | undefined, config: Object): Logger;
}