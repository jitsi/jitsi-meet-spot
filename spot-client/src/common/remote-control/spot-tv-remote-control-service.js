import { globalDebugger } from 'common/debugging';

import { RemoteControlService } from './remote-control-service';

/**
 * Communication service for the Spot-TV to talk to Spot-Remote.
 *
 * @extends RemoteControlService
 */
export class SpotTvRemoteControlService extends RemoteControlService {}

const remoteControlService = new SpotTvRemoteControlService();

globalDebugger.register('SpotTvRemoteControlService', remoteControlService);

export default remoteControlService;
