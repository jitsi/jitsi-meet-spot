const { app } = require('electron');

const { clientController } = require('../client-control');

clientController.on('exitApp', () => {
    app.quit();

    // Forceully exit with a 5s timeout.
    setTimeout(() => app.exit(0), 5000);
});
