'use strict';

const { app, BrowserWindow } = require('electron');
const { enforceSingleInstance } = require('./single-instance');
const windowManager = require('./window-manager');
const { attachNavigationGuards } = require('./security/navigation-guard');

/**
 * Main process entry point.
 *
 * Why: this file ONLY orchestrates — it contains no business logic.
 * All window creation, security configuration and lifecycle management
 * must live in dedicated modules (window-manager, tray-manager, etc.).
 * This follows the pattern defined in GEMINI.md §3 (layered architecture)
 * and §12 (anti-pattern: business logic inside main/index.js).
 */

// Single-instance lock must be acquired before anything else.
// If another instance is already running, this call quits the process.
if (!enforceSingleInstance()) {
  // app.quit() was already called inside enforceSingleInstance().
  // Nothing else to do — the process will exit.
} else {
  app.whenReady().then(() => {
    const win = windowManager.createMainWindow();
    attachNavigationGuards(win);

    app.on('activate', () => {
      // macOS: recreate the window if the dock icon is clicked and no windows are open.
      if (BrowserWindow.getAllWindows().length === 0) {
        const newWin = windowManager.createMainWindow();
        attachNavigationGuards(newWin);
      }
    });
  });

  app.on('window-all-closed', () => {
    // On Linux/Windows, quit the process when all windows are closed.
    // In Epic 3 (tray), this behaviour will change to minimize to tray instead.
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
}
