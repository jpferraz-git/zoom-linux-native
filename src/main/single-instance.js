'use strict';

const { app, BrowserWindow } = require('electron');

/**
 * Enforces a single-instance lock for the application.
 * @returns {boolean} `true` if this is the first (primary) instance.
 */
function enforceSingleInstance() {
  const gotTheLock = app.requestSingleInstanceLock();

  if (!gotTheLock) {
    app.quit();
    return false;
  }

  app.on('second-instance', () => {
    const windows = BrowserWindow.getAllWindows();

    if (windows.length > 0) {
      const win = windows[0];

      if (win.isMinimized()) {
        win.restore();
      }

      win.focus();
    }
  });

  return true;
}

module.exports = { enforceSingleInstance };
