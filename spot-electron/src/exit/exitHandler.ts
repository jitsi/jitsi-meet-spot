import { app } from 'electron';

import { clientController } from '../client-control/index.js';

clientController.on('exitApp', () => {
    app.quit();

    // Forcefully exit with a 5s timeout.
    setTimeout(() => app.exit(0), 5000);
});
