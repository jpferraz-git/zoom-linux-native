'use strict';

/**
 * Custom CSS rules injected into the Zoom Web Client page.
 * @type {string}
 */
const CUSTOM_CSS = `
/* ─── Zoom Linux Native — Local CSS Overrides ────────────────────────── */
`;

/**
 * Injects custom CSS into a webContents instance after the page loads.
 * @param {import('electron').WebContents} webContents
 * @returns {Promise<string>}
 */
async function injectCSS(webContents) {
  return webContents.insertCSS(CUSTOM_CSS);
}

module.exports = { injectCSS };
