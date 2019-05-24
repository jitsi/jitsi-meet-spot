import { globalDebugger } from 'common/debugging';

import { BaseRemoteControlService } from './BaseRemoteControlService';

/**
 * Communication service for the Spot-TV to talk to Spot-Remote.
 *
 * @extends BaseRemoteControlService
 */
export class SpotTvRemoteControlService extends BaseRemoteControlService {}

const remoteControlService = new SpotTvRemoteControlService();

globalDebugger.register('spotTvRemoteControlService', remoteControlService);

export default remoteControlService;
