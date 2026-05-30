import { addGlobalTransport } from '@jitsi/logger';

import transport from './SpotClientLogTransport.js';

addGlobalTransport(transport);
