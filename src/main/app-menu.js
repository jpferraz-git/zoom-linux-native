'use strict';

const { Menu, shell } = require('electron');
const { APP_NAME, ZOOM_WEB_CLIENT_URL } = require('./config/constants');

/**
 * GitHub repository URL for the "About" / "Help" menu item.
 * @type {string}
 */
const REPO_URL = 'https://github.com/jpferraz-git/zoom-linux-native';

/**
 * Creates and sets the native application menu bar.
 *
 * Why: a proper menu bar is a basic expectation of a desktop application.
 * Without one, users can't use standard keyboard shortcuts (Ctrl+C/V/Z,
 * Ctrl+R to reload) and have no way to access DevTools for debugging.
 *
 * Menu structure:
 * - File: Quit
 * - Edit: Undo, Redo, Cut, Copy, Paste, Select All (standard roles)
 * - View: Reload, Force Reload, Zoom In/Out, Reset Zoom, DevTools, Fullscreen
 * - Help: About / Repository link
 *
 * @param {import('electron').BrowserWindow} mainWindow
 */
function createAppMenu(mainWindow) {
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
            mainWindow.loadURL(ZOOM_WEB_CLIENT_URL);
          },
        },
        {
          label: 'Force Reload',
          accelerator: 'CmdOrCtrl+Shift+R',
          click: () => {
            mainWindow.webContents.reloadIgnoringCache();
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
                  mainWindow.webContents.toggleDevTools();
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
