const { app, Menu } = require('electron');
const isDev = require('electron-is-dev');

const productName = app.name;

/**
 * Generates the configuration for the menu items to display in the app toolbar.
 *
 * @returns {Array}
 */
function getMenuItems() {
    return [
        {
            label: productName,
            submenu: [
                { role: 'toggledevtools' },
                { role: 'quit' }
            ]
        }
    ];
}

const menu = isDev
    ? Menu.buildFromTemplate(getMenuItems())
    : null;

Menu.setApplicationMenu(menu);
