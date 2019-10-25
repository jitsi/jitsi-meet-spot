const { Menu } = require('electron');
const isDev = require('electron-is-dev');

const { productName } = require('../../package.json');

/**
 * Generates the configuration for the menu items to display in the app toolbar.
 *
 * @returns {Array}
 */
function getMenuItems() {
    const menuItems = [];

    menuItems.push({
        label: productName
    });

    if (isDev) {
        menuItems.push(
            {
                label: 'Development',
                submenu: [
                    { role: 'toggledevtools' },
                    { role: 'quit' }
                ]
            }
        );
    }

    return menuItems;
}

const menu = Menu.buildFromTemplate(getMenuItems());

Menu.setApplicationMenu(menu);
