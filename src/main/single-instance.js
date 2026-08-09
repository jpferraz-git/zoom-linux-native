'use strict';

const { app, BrowserWindow } = require('electron');

/**
 * Enforces a single-instance lock for the application.
 *
 * Why: prevents the user from accidentally opening multiple copies of the
 * app, which would fight over the same Zoom session (cookies, media
 * devices). When a second instance is launched, this module focuses the
 * existing window instead.
 *
 * Must be called as early as possible in the main process — before
 * `app.whenReady()` — so the lock is acquired before any window is
 * created. See GEMINI.md §5 (Singleton controlado).
 *
 * @returns {boolean} `true` if this is the first (primary) instance;
 *                    `false` if a previous instance already holds the lock
 *                    (in which case the app will quit automatically).
 */
function enforceSingleInstance() {
  const gotTheLock = app.requestSingleInstanceLock();

  if (!gotTheLock) {
    // Another instance is already running — quit immediately.
    app.quit();
    return false;
  }

  // When the user tries to open a second instance, focus the existing window.
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
