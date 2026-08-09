'use strict';

const { BrowserWindow } = require('electron');
const path = require('path');
const { attachNavigationGuards } = require('./security/navigation-guard');
const { attachErrorMonitor } = require('./error-monitor');
const { injectCSS } = require('./css-injector');
const { ZOOM_WEB_CLIENT_URL, APP_NAME, DEFAULT_WINDOW_SIZE } = require('./config/constants');

/**
 * Singleton instance of the main window.
 * Kept as an internal closure — never exposed as a global.
 *
 * @type {BrowserWindow | null}
 */
let mainWindow = null;

/**
 * Creates the main application window with mandatory security settings.
 *
 * Why Factory pattern: centralises BrowserWindow creation with standardised secure
 * webPreferences, making it impossible to accidentally create an insecure window.
 * See GEMINI.md §5 (Design patterns) and §2 (Golden rules).
 *
 * Security settings applied:
 * - `contextIsolation: true` — mandatory isolation between main and renderer.
 * - `nodeIntegration: false` — content is third-party (Zoom); exposing Node.js would be RCE.
 * - `sandbox: true` — extra isolation layer for the renderer process.
 * - `preload` — the sole communication point between renderer and main, via contextBridge.
 *
 * Window sizing rationale (Task 2.6):
 * - `minWidth: 1100` — prevents the Zoom Web Client's responsive breakpoint from
 *   collapsing the chat panel. Empirically tested against zoom.us/wc layout as of
 *   2026-08-09. If Zoom changes their breakpoints, this value may need adjustment.
 *
 * @returns {BrowserWindow} The created main window.
 */
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: DEFAULT_WINDOW_SIZE.width,
    height: DEFAULT_WINDOW_SIZE.height,
    minWidth: DEFAULT_WINDOW_SIZE.minWidth,
    minHeight: DEFAULT_WINDOW_SIZE.minHeight,
    title: APP_NAME,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, '../preload/index.js'),
    },
  });

  // Task 1.3: Attach navigation guards to enforce domain allowlist.
  // External links (terms of use, privacy policy, etc.) open in the system browser.
  attachNavigationGuards(mainWindow);

  // Task 2.7: Attach error monitoring for crash recovery and media error logging.
  attachErrorMonitor(mainWindow.webContents, mainWindow);

  // Task 2.8: Inject custom CSS overrides after the page finishes loading.
  // Currently empty — serves as extension point for UX regression fixes.
  mainWindow.webContents.on('did-finish-load', () => {
    injectCSS(mainWindow.webContents).catch((err) => {
      console.warn('[window-manager] CSS injection failed:', err.message);
    });
  });

  // Task 1.1: Load the Zoom Web Client.
  mainWindow.loadURL(ZOOM_WEB_CLIENT_URL);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  return mainWindow;
}

/**
 * Returns the current main window instance, or null if it does not exist.
 *
 * @returns {BrowserWindow | null}
 */
function getMainWindow() {
  return mainWindow;
}

module.exports = { createMainWindow, getMainWindow };
