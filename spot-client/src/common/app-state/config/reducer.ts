/**
 * A {@code Reducer} to update the current Redux state for the known global
 * configuration. This is a stub as the configuration is set through a global.
 *
 * @param state - The current Redux state for the 'setup' feature.
 * @returns
 */
// The config slice mirrors the runtime `window.JitsiMeetSpotConfig` bag (see
// `default-config.ts`), which is loosely typed; tightened incrementally later.
export interface IConfigState {
    [key: string]: any;
}

const config = (state: IConfigState = {}): IConfigState => state;

export default config;
