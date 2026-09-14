'use strict';

const { Menu, shell } = require('electron');
const { APP_NAME, ZOOM_WEB_CLIENT_URL } = require('./config/constants');

const REPO_URL = 'https://github.com/jpferraz-git/zoom-linux-native';

/**
 * @param {() => Electron.BrowserWindow | null} getMainWindow
 */
function createAppMenu(getMainWindow) {
  const isDev = !require('electron').app.isPackaged;

  const template = [
    {
      label: '&File',
      submenu: [
        { role: 'quit', label: `Quit ${APP_NAME}` },
      ],
    },
    {
      label: '&Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: '&View',
      submenu: [
        {
          label: 'Reload Zoom',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            const win = getMainWindow();
            if (win && !win.isDestroyed()) {
              win.loadURL(ZOOM_WEB_CLIENT_URL);
            }
          },
        },
        {
          label: 'Force Reload',
          accelerator: 'CmdOrCtrl+Shift+R',
          click: () => {
            const win = getMainWindow();
            if (win && !win.isDestroyed()) {
              win.webContents.reloadIgnoringCache();
            }
          },
        },
        { type: 'separator' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { role: 'resetZoom' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
        ...(isDev
          ? [
            { type: 'separator' },
            {
              label: 'Toggle DevTools',
              accelerator: 'F12',
              click: () => {
                const win = getMainWindow();
                if (win && !win.isDestroyed()) {
                  win.webContents.toggleDevTools();
                }
              },
            },
          ]
          : []),
      ],
    },
    {
      label: '&Help',
      submenu: [
        {
          label: 'About Zoom Linux Native',
          click: () => {
            shell.openExternal(REPO_URL);
          },
        },
        {
          label: 'Report an Issue',
          click: () => {
            shell.openExternal(`${REPO_URL}/issues`);
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

module.exports = { createAppMenu };

