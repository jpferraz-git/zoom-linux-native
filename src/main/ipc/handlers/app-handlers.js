'use strict';

const { ipcMain } = require('electron');
const { CHANNELS } = require('../channels');
const { ZOOM_WEB_CLIENT_URL } = require('../../config/constants');

function registerAppHandlers(getMainWindow) {
  ipcMain.handle(CHANNELS.APP_RELOAD, () => {
    const win = getMainWindow();
    if (win && !win.isDestroyed()) {
      win.loadURL(ZOOM_WEB_CLIENT_URL);
    }
  });
}

module.exports = { registerAppHandlers };
