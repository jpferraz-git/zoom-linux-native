'use strict';

const { BrowserWindow } = require('electron');
const path = require('path');

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
 * @returns {BrowserWindow} The created main window.
 */
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'Zoom Linux Native',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, '../preload/index.js'),
    },
  });

  // Placeholder: loads a blank page until Epic 1 implements the Zoom Web Client loading.
  // TODO(joaopedroferraz): replace with zoom.us/wc in task 1.1
  mainWindow.loadURL('about:blank');

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
