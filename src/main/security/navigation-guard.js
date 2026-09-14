'use strict';

const { shell } = require('electron');
const { isAllowedHostname } = require('../config/allowed-origins');

function attachNavigationGuards(win) {
  const contents = win.webContents;

  contents.on('will-navigate', (event, url) => {
    try {
      const { hostname } = new URL(url);

      if (!isAllowedHostname(hostname)) {
        event.preventDefault();
        shell.openExternal(url);
      }
    } catch {
      event.preventDefault();
    }
  });

  contents.setWindowOpenHandler(({ url }) => {
    try {
      const { hostname } = new URL(url);

      if (isAllowedHostname(hostname)) {
        contents.loadURL(url);
      } else {
        shell.openExternal(url);
      }
    } catch (err) {
      console.warn('[navigation-guard] Failed to parse window-open URL:', err.message);
    }

    return { action: 'deny' };
  });
}

module.exports = { attachNavigationGuards };
