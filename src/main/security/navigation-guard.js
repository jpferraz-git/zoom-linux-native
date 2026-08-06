'use strict';

const { shell } = require('electron');
const { isAllowedOrigin } = require('../config/allowed-origins');

/**
 * Attaches navigation guards to a BrowserWindow's webContents.
 *
 * Why: GEMINI.md §2 rule 4 — no free navigation. Every `will-navigate`
 * and new-window request is checked against the central allowlist
 * (`allowed-origins.js`). Domains outside the list open in the user's
 * default browser via `shell.openExternal`, never inside the Electron
 * app. This prevents the renderer (which loads third-party Zoom content)
 * from silently navigating to malicious pages.
 *
 * @param {import('electron').BrowserWindow} win — the window to guard.
 */
function attachNavigationGuards(win) {
  const contents = win.webContents;

  /**
   * Intercepts in-page navigations (e.g. `window.location = ...`).
   * If the target is outside the allowlist, the navigation is cancelled
   * and the URL is opened in the system browser instead.
   */
  contents.on('will-navigate', (event, url) => {
    try {
      const { hostname } = new URL(url);

      if (!isAllowedOrigin(hostname)) {
        event.preventDefault();
        shell.openExternal(url);
      }
    } catch {
      // Malformed URL — block silently.
      event.preventDefault();
    }
  });

  /**
   * Intercepts requests to open new windows (e.g. `window.open()`,
   * `target="_blank"` links).
   *
   * Allowed domains open in the same window (overriding the popup
   * attempt); everything else opens in the system browser.
   */
  contents.setWindowOpenHandler(({ url }) => {
    try {
      const { hostname } = new URL(url);

      if (isAllowedOrigin(hostname)) {
        // Load inside the current window instead of spawning a popup.
        contents.loadURL(url);
      } else {
        shell.openExternal(url);
      }
    } catch {
      // Malformed URL — ignore.
    }

    // Always deny the popup — we either redirected the main window or
    // opened the system browser above.
    return { action: 'deny' };
  });
}

module.exports = { attachNavigationGuards };
