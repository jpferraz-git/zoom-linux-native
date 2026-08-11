'use strict';

const { app, BrowserWindow } = require('electron');
const { extractDeepLinkFromArgv, handleDeepLink } = require('./deep-link-handler');

/**
 * Enforces that only one instance of the app runs at a time.
 *
 * Se uma segunda instância é aberta (ex: via deep link zoommtg://),
 * a primeira instância recebe o evento `second-instance` com os argv
 * da segunda — permitindo tratar deep links sem abrir janela duplicada.
 *
 * @param {Function} getMainWindow - Function that returns the main BrowserWindow (or null).
 * @returns {boolean} true if this is the first (and only) instance.
 */
function enforceSingleInstance(getMainWindow) {
  const gotTheLock = app.requestSingleInstanceLock();

  if (!gotTheLock) {
    app.quit();
    return false;
  }

  app.on('second-instance', (_event, argv) => {
    // Focus existing window
    const windows = BrowserWindow.getAllWindows();
    if (windows.length > 0) {
      const win = windows[0];
      if (win.isMinimized()) win.restore();
      win.show();
      win.focus();
    }

    // Check if the second instance was launched with a deep link
    const deepLinkUrl = extractDeepLinkFromArgv(argv);
    if (deepLinkUrl) {
      handleDeepLink(deepLinkUrl, getMainWindow);
    }
  });

  return true;
}

module.exports = { enforceSingleInstance };
