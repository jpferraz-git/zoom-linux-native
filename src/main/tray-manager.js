'use strict';

const { Tray, Menu, nativeImage, app } = require('electron');
const path = require('path');
const windowManager = require('./window-manager');
const { APP_NAME, ZOOM_WEB_CLIENT_URL } = require('./config/constants');

/**
 * Path to the tray icon image.
 * Uses the same icon from build/ that electron-builder uses for the app.
 * Falls back to a 16x16 empty image if the icon doesn't exist yet
 * (Task 3.5 will provide the real icon).
 *
 * @type {string}
 */
const TRAY_ICON_PATH = path.join(__dirname, '../../build/icon.png');

/**
 * Singleton Tray instance.
 * Must be kept in a module-level variable to prevent garbage collection
 * from destroying the tray icon (Electron gotcha on all platforms).
 *
 * @type {import('electron').Tray | null}
 */
let tray = null;

/**
 * Creates the system tray icon with a context menu.
 *
 * Why: a system tray icon is one of the key differentiators between
 * "just use a browser tab" and a proper desktop app. It lets the user
 * minimize to tray instead of quitting, access quick actions, and
 * always see that Zoom is running.
 *
 * Behaviour:
 * - Clicking the tray icon: shows/focuses the main window.
 * - Right-click / context menu: Open, Reload, Quit.
 * - Close button on window: hides to tray instead of quitting.
 *
 * @returns {import('electron').Tray} The created tray instance.
 */
function createTray() {
  let icon;

  try {
    icon = nativeImage.createFromPath(TRAY_ICON_PATH);

    // If the icon file doesn't exist or is empty, createFromPath returns
    // an empty image. Resize to a reasonable tray size.
    if (icon.isEmpty()) {
      // Create a minimal 16x16 placeholder until Task 3.5 provides a real icon.
      icon = nativeImage.createEmpty();
    }
  } catch {
    icon = nativeImage.createEmpty();
  }

  tray = new Tray(icon);
  tray.setToolTip(APP_NAME);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open',
      click: () => {
        showMainWindow();
      },
    },
    {
      label: 'Reload',
      click: () => {
        const win = windowManager.getMainWindow();
        if (win) {
          win.loadURL(ZOOM_WEB_CLIENT_URL);
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        // Setting this flag tells the window-all-closed handler to actually quit.
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);

  // On Linux, clicking the tray icon should show/focus the window.
  // Note: on some DEs with libappindicator, the 'click' event may not fire —
  // in that case the user must use the context menu's "Open" item.
  tray.on('click', () => {
    showMainWindow();
  });

  return tray;
}

/**
 * Shows and focuses the main window, creating it if needed.
 */
function showMainWindow() {
  const win = windowManager.getMainWindow();
  if (win) {
    win.show();
    win.focus();
  } else {
    windowManager.createMainWindow();
  }
}

/**
 * Returns the current tray instance, or null if it doesn't exist.
 *
 * @returns {import('electron').Tray | null}
 */
function getTray() {
  return tray;
}

module.exports = { createTray, getTray };
