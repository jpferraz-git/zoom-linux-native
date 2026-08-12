'use strict';

const { app, BrowserWindow } = require('electron');
const { extractDeepLinkFromArgv, handleDeepLink } = require('./deep-link-handler');

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
