'use strict';

const { ipcMain } = require('electron');
const { CHANNELS } = require('../channels');
const { ZOOM_WEB_CLIENT_URL } = require('../../config/constants');

/**
 * Registra handlers IPC do domínio "app" no main process.
 *
 * Atualmente expõe apenas o canal APP_RELOAD, que recarrega o Zoom Web Client
 * na janela principal. Chamado uma vez em index.js durante a inicialização.
 *
 * @param {() => Electron.BrowserWindow | null} getMainWindow
 */
function registerAppHandlers(getMainWindow) {
  ipcMain.handle(CHANNELS.APP_RELOAD, () => {
    const win = getMainWindow();
    if (win && !win.isDestroyed()) {
      win.loadURL(ZOOM_WEB_CLIENT_URL);
    }
  });
}

module.exports = { registerAppHandlers };
