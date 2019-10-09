const { Menu } = require('electron');
const isDev = require('electron-is-dev');
const process = require('process');

const { productName } = require('../../package.json');

/**
 * Generates the configuration for the menu items to display in the app toolbar.
 *
 * @returns {Array}
 */
function getMenuItems() {
    const isDarwin = process.platform === 'darwin';
    const menuItems = [];

    menuItems.push({
        label: productName,
        submenu: [
            { role: 'about' },
            { type: 'separator' },
            ...isDarwin ? [
                { role: 'hide' },
                { role: 'hideothers' },
                { role: 'unhide' },
                { type: 'separator' }
            ] : [],
            { role: 'togglefullscreen' },
            { type: 'separator' },
            { role: 'quit' }
        ]
    });

    if (isDev) {
        menuItems.push({
            label: 'Development',
            submenu: [
                { role: 'toggledevtools' }
            ]
        });
    }

    return menuItems;
}

const menu = Menu.buildFromTemplate(getMenuItems());

Menu.setApplicationMenu(menu);
