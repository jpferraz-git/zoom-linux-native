'use strict';

const CUSTOM_CSS = `
/* ─── Zoom Linux Native — Local CSS Overrides ────────────────────────── */
/* Currently empty: minWidth constraint handles chat panel visibility.   */
/* Add rules here only if presentation issues arise that can't be        */
/* solved by window constraints alone.                                   */
`;



async function injectCSS(webContents) {
  return webContents.insertCSS(CUSTOM_CSS);
}

module.exports = { injectCSS };
