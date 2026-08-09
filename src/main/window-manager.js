'use strict';

const { app, BrowserWindow } = require('electron');
const path = require('path');
const { attachNavigationGuards } = require('./security/navigation-guard');
const { attachErrorMonitor } = require('./error-monitor');
const { injectCSS } = require('./css-injector');
const { ZOOM_WEB_CLIENT_URL, APP_NAME, DEFAULT_WINDOW_SIZE } = require('./config/constants');
const { loadWindowState, saveWindowState } = require('./window-state');

/**
 * Singleton instance of the main window.
 * Kept as an internal closure — never exposed as a global.
 *
 * @type {BrowserWindow | null}
 */
let mainWindow = null;

/**
 * Debounce timer for saving window state on resize/move.
 * Prevents excessive disk I/O during rapid window manipulation.
 *
 * @type {NodeJS.Timeout | null}
 */
let saveStateTimer = null;

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
 * Window state persistence (Task 3.2):
 * - Position and size are restored from a JSON file in userData on startup.
 * - State is saved on resize, move, and close events (debounced to avoid disk thrash).
 *
 * @returns {BrowserWindow} The created main window.
 */
function createMainWindow() {
  // ── Task 3.2: Restore persisted window bounds ──────────────────────────
  const savedState = loadWindowState();

  const windowOptions = {
    width: savedState?.width || DEFAULT_WINDOW_SIZE.width,
    height: savedState?.height || DEFAULT_WINDOW_SIZE.height,
    minWidth: DEFAULT_WINDOW_SIZE.minWidth,
    minHeight: DEFAULT_WINDOW_SIZE.minHeight,
    title: APP_NAME,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, '../preload/index.js'),
    },
  };

  // Restore position only if we have valid saved coordinates.
  if (savedState?.x != null && savedState?.y != null) {
    windowOptions.x = savedState.x;
    windowOptions.y = savedState.y;
  }

  mainWindow = new BrowserWindow(windowOptions);

  // Restore maximized state after creating the window.
  if (savedState?.isMaximized) {
    mainWindow.maximize();
  }

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

  // ── Task 3.2: Persist window state on resize/move (debounced) ──────────
  const debouncedSave = () => {
    if (saveStateTimer) clearTimeout(saveStateTimer);
    saveStateTimer = setTimeout(() => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        saveWindowState(mainWindow);
      }
    }, 500);
  };

  mainWindow.on('resize', debouncedSave);
  mainWindow.on('move', debouncedSave);

  // ── Task 3.1: Minimize to tray instead of quitting ─────────────────────
  // The 'close' event is intercepted: if the user clicks the X button, the
  // window hides to the tray. Only app.quit() (from the tray menu or
  // File → Quit) actually destroys the window.
  mainWindow.on('close', (event) => {
    // Save state before anything else.
    if (mainWindow && !mainWindow.isDestroyed()) {
      saveWindowState(mainWindow);
    }

    // If the app is being quit (from tray "Quit" or Ctrl+Q), allow the close.
    if (app.isQuitting) return;

    // Otherwise, hide to tray instead of closing.
    event.preventDefault();
    mainWindow.hide();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Task 1.1: Load the Zoom Web Client.
  mainWindow.loadURL(ZOOM_WEB_CLIENT_URL);

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
