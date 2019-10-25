const { app } = require('electron');
const { clientController } = require('../client-control');

clientController.on('exitApp', () => {
    app.quit();
});
