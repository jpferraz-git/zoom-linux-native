'use strict';


const CUSTOM_CSS = `
/* ─── Zoom Linux Native — Local CSS Overrides ────────────────────────── */
`;


/**
 * Injects local CSS overrides into the Zoom Web Client page.
 *
 * Por quê: usa webContents.insertCSS() para ajustes de apresentação local —
 * mesma categoria de extensões como Dark Reader. Nunca toca no DOM ou na
 * lógica da página (GEMINI.md §12, task 2.8 do plano).
 *
 * @param {import('electron').WebContents} webContents
 * @returns {Promise<string>} Key that can be used to remove the CSS later.
 */
async function injectCSS(webContents) {
  return webContents.insertCSS(CUSTOM_CSS);
}

module.exports = { injectCSS };
