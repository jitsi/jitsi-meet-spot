const { Menu } = require('electron');
const process = require('process');

const { productName } = require('../../package.json');

const menuTemplate = [
    ...process.platform === 'darwin' ? [ {
        label: productName,
        submenu: [
            { role: 'about' },
            { type: 'separator' },
            { type: 'separator' },
            { role: 'hide' },
            { role: 'hideothers' },
            { role: 'unhide' },
            { type: 'separator' },
            { role: 'quit' }
        ]
    } ] : []
];

const menu = Menu.buildFromTemplate(menuTemplate);

Menu.setApplicationMenu(menu);
