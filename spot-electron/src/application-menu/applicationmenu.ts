import { type MenuItemConstructorOptions, Menu, app } from 'electron';
import isDev from 'electron-is-dev';

const productName = app.getName();

/**
 * Generates the configuration for the menu items to display in the app toolbar.
 *
 * @returns {MenuItemConstructorOptions[]}
 */
function getMenuItems(): MenuItemConstructorOptions[] {
    return [
        {
            label: productName,
            submenu: [
                { role: 'toggleDevTools' },
                { role: 'quit' }
            ]
        }
    ];
}

const menu = isDev
    ? Menu.buildFromTemplate(getMenuItems())
    : null;

Menu.setApplicationMenu(menu);
