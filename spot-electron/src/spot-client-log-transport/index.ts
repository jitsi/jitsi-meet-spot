import JitsiLogger from '@jitsi/logger';

import transport from './SpotClientLogTransport.js';

JitsiLogger.addGlobalTransport(transport);
