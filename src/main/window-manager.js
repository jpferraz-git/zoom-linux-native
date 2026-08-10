'use strict';

const { BrowserWindow, app } = require('electron');
const path = require('path');
const { attachNavigationGuards } = require('./security/navigation-guard');
const { attachErrorMonitor } = require('./error-monitor');
const { injectCSS } = require('./css-injector');
const { ZOOM_WEB_CLIENT_URL, APP_NAME, DEFAULT_WINDOW_SIZE } = require('./config/constants');
const { loadWindowState, saveWindowState } = require('./window-state');

/**
 * @type {BrowserWindow | null}
 */
let mainWindow = null;
let saveStateTimer = null;

/**
 * Creates the main application window.
 * @returns {BrowserWindow} The created main window.
 */
function createMainWindow() {
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

  if (savedState?.x != null && savedState?.y != null) {
    windowOptions.x = savedState.x;
    windowOptions.y = savedState.y;
  }

  mainWindow = new BrowserWindow(windowOptions);

  if (savedState?.isMaximized) {
    mainWindow.maximize();
  }

  attachNavigationGuards(mainWindow);
  attachErrorMonitor(mainWindow.webContents, mainWindow);

  mainWindow.webContents.on('did-finish-load', () => {
    injectCSS(mainWindow.webContents).catch((err) => {
      console.warn('[window-manager] CSS injection failed:', err.message);
    });
  });

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

  mainWindow.on('close', (event) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      saveWindowState(mainWindow);
    }

    if (app.isQuitting) return;

    event.preventDefault();
    mainWindow.hide();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.loadURL(ZOOM_WEB_CLIENT_URL);

  return mainWindow;
}

/**
 * @returns {BrowserWindow | null}
 */
function getMainWindow() {
  return mainWindow;
}

module.exports = { createMainWindow, getMainWindow };
