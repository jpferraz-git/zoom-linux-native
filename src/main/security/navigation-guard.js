'use strict';

const { shell } = require('electron');
const { isAllowedOrigin } = require('../config/allowed-origins');

/**
 * Attaches navigation guards to a BrowserWindow's webContents.
 * @param {import('electron').BrowserWindow} win
 */
function attachNavigationGuards(win) {
  const contents = win.webContents;

  contents.on('will-navigate', (event, url) => {
    try {
      const { hostname } = new URL(url);

      if (!isAllowedOrigin(hostname)) {
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

      if (isAllowedOrigin(hostname)) {
        contents.loadURL(url);
      } else {
        shell.openExternal(url);
      }
    } catch {
      // Ignore
    }

    return { action: 'deny' };
  });
}

module.exports = { attachNavigationGuards };
