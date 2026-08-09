'use strict';

const { app, BrowserWindow } = require('electron');
const path = require('path');
const windowManager = require('./window-manager');

/**
 * Main process entry point.
 *
 * Why: this file ONLY orchestrates — it contains no business logic.
 * All window creation, security configuration and lifecycle management
 * must live in dedicated modules (window-manager, tray-manager, etc.).
 * This follows the pattern defined in GEMINI.md §3 (layered architecture)
 * and §12 (anti-pattern: business logic inside main/index.js).
 */

// ── Single Instance Lock (Task 1.4) ──────────────────────────────────────────
// Prevents multiple instances of the app from running simultaneously.
// If a second instance is launched, it will quit and focus the existing window.
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  // Another instance is already running — quit immediately.
  app.quit();
} else {
  app.on('second-instance', () => {
    // Someone tried to open a second instance — focus the existing window.
    const win = windowManager.getMainWindow();
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });

  app.whenReady().then(() => {
    windowManager.createMainWindow();

    app.on('activate', () => {
      // macOS: recreate the window if the dock icon is clicked and no windows are open.
      if (BrowserWindow.getAllWindows().length === 0) {
        windowManager.createMainWindow();
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
