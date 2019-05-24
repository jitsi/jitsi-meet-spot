import { globalDebugger } from 'common/debugging';

import { BaseRemoteControlService } from './BaseRemoteControlService';

/**
 * Communication service for the Spot-Remote to talk to Spot-TV.
 *
 * @extends BaseRemoteControlService
 */
export class SpotRemoteRemoteControlService extends BaseRemoteControlService {}

const spotRemoteRemoteControlService = new SpotRemoteRemoteControlService();

globalDebugger.register(
    'spotRemoteRemoteControlService', spotRemoteRemoteControlService);

export default spotRemoteRemoteControlService;
