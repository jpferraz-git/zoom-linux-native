'use strict';

const fs = require('fs');
const path = require('path');
const { app } = require('electron');

/**
 * Path to the window state persistence file.
 * Stored in the app's userData directory (e.g. ~/.config/zoom-linux-native/).
 *
 * Why plain JSON: avoids adding a dependency (electron-store) for a single
 * key-value pair. The file stores only window bounds — no sensitive data.
 *
 * @type {string}
 */
const STATE_FILE = path.join(app.getPath('userData'), 'window-state.json');

/**
 * @typedef {Object} WindowState
 * @property {number} x
 * @property {number} y
 * @property {number} width
 * @property {number} height
 * @property {boolean} isMaximized
 */

/**
 * Loads the persisted window state from disk.
 *
 * Returns `null` if the file doesn't exist, is corrupted, or has invalid
 * values. The caller should fall back to default dimensions in that case.
 *
 * @returns {WindowState | null}
 */
function loadWindowState() {
  try {
    if (!fs.existsSync(STATE_FILE)) return null;

    const raw = fs.readFileSync(STATE_FILE, 'utf-8');
    const state = JSON.parse(raw);

    // Basic validation — reject clearly invalid bounds.
    if (
      typeof state.width !== 'number' ||
      typeof state.height !== 'number' ||
      state.width < 100 ||
      state.height < 100
    ) {
      return null;
    }

    return state;
  } catch {
    // File corrupted or unreadable — silently fall back to defaults.
    return null;
  }
}

/**
 * Saves the current window bounds and maximized state to disk.
 *
 * Should be called on window `close` (before the window is destroyed)
 * and debounced on `resize`/`move` events to avoid excessive disk I/O.
 *
 * @param {import('electron').BrowserWindow} win
 */
function saveWindowState(win) {
  try {
    const isMaximized = win.isMaximized();

    // When maximized, save the "restored" (non-maximized) bounds so that
    // un-maximizing restores to the last known normal size/position.
    const bounds = isMaximized ? win.getNormalBounds() : win.getBounds();

    const state = {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      isMaximized,
    };

    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[window-state] Failed to save window state:', err.message);
  }
}

module.exports = { loadWindowState, saveWindowState };
