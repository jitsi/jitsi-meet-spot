import type { IAutoUpdateState } from 'common/auto-update/reducer';
import type { IBackendState } from 'common/backend/reducer';
import type { ILoggerState } from 'common/logger/reducer';
import type { ISpotRemoteState } from 'spot-remote/app-state/reducer';
import type { ISpotTvBackendState } from 'spot-tv/backend/reducer';

import type { IBootstrapState } from './bootstrap/reducer';
import type { ICalendarState } from './calendars/reducer';
import type { IConfigState } from './config/reducer';
import type { IDeviceIdState } from './device-id/reducer';
import type { IFeedbackState } from './feedback/reducer';
import type { IModalState } from './modal/reducer';
import type { INotificationsState } from './notifications/reducer';
import type { IRemoteControlServiceState } from './remote-control-service/reducer';
import type { IRouteState } from './route/reducer';
import type { ISetupState } from './setup/reducer';
import type { ISpotTvState } from './spot-tv/reducer';
import type { IWiredScreenshareState } from './wired-screenshare/reducer';

/**
 * The shape of the Spot Redux store.
 *
 * The first group of slices is combined statically in {@link ./index.ts}; the
 * second group is registered at import time via `ReducerRegistry.register(...)`
 * (the bare feature imports in `src/index.tsx` / `src/app.tsx` activate those
 * registrations before the store is created).
 *
 * This type is intentionally **additive**: it is not yet wired into
 * `createStore` (the registry combines reducers as a loose `Reducer`), and the
 * many `state: any` selectors / `mapStateToProps` are migrated to `RootState`
 * incrementally. See PENDING.md §2 "Tighten `any` at boundaries".
 */
export interface RootState {
    // Core slices, statically combined in `./index.ts`.
    bootstrap: IBootstrapState;
    calendars: ICalendarState;
    config: IConfigState;
    deviceId: IDeviceIdState;
    feedback: IFeedbackState;
    modal: IModalState;
    notifications: INotificationsState;
    remoteControlService: IRemoteControlServiceState;
    route: IRouteState;
    setup: ISetupState;
    spotTv: ISpotTvState;
    wiredScreenshare: IWiredScreenshareState;

    // Feature slices, registered at import time via `ReducerRegistry.register(...)`.
    'common/auto-update': IAutoUpdateState;
    backend: IBackendState;
    logger: ILoggerState;
    spotRemote: ISpotRemoteState;
    'spot-tv/backend': ISpotTvBackendState;
}
