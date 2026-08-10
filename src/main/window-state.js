'use strict';

const fs = require('fs');
const path = require('path');
const { app } = require('electron');

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
 * @returns {WindowState | null}
 */
function loadWindowState() {
  try {
    if (!fs.existsSync(STATE_FILE)) return null;

    const raw = fs.readFileSync(STATE_FILE, 'utf-8');
    const state = JSON.parse(raw);

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
    return null;
  }
}

/**
 * Saves the current window bounds and maximized state to disk.
 * @param {import('electron').BrowserWindow} win
 */
function saveWindowState(win) {
  try {
    const isMaximized = win.isMaximized();
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
