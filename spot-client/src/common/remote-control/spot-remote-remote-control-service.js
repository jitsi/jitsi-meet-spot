import { globalDebugger } from 'common/debugging';

import { RemoteControlService } from './remote-control-service';

/**
 * Communication service for the Spot-Remote to talk to Spot-TV.
 *
 * @extends RemoteControlService
 */
export class SpotRemoteRemoteControlService extends RemoteControlService {}

const remoteControlService = new SpotRemoteRemoteControlService();

globalDebugger.register('spotRemoteRemoteControlService', remoteControlService);

export default remoteControlService;
