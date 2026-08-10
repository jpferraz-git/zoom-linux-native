'use strict';

const { app, BrowserWindow, session } = require('electron');
const { enforceSingleInstance } = require('./single-instance');
const windowManager = require('./window-manager');
const { setupPermissionHandlers, setupDisplayMediaHandler } = require('./permission-manager');
const { createTray } = require('./tray-manager');
const { createAppMenu } = require('./app-menu');

app.commandLine.appendSwitch(
  'enable-features',
  'WebRTCPipeWireCapturer,WaylandWindowDecorations'
);
app.commandLine.appendSwitch('ozone-platform-hint', 'auto');

const isFirstInstance = enforceSingleInstance();

if (!isFirstInstance) {
  // App will quit
} else {
  app.isQuitting = false;

  app.on('before-quit', () => {
    app.isQuitting = true;
  });

  app.whenReady().then(() => {
    setupPermissionHandlers(session.defaultSession);
    setupDisplayMediaHandler(session.defaultSession);

    const mainWindow = windowManager.createMainWindow();

    createTray();
    createAppMenu(mainWindow);

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        windowManager.createMainWindow();
      }
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin' && app.isQuitting) {
      app.quit();
    }
  });
}
