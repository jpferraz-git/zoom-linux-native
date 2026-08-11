'use strict';


const CUSTOM_CSS = `
/* ─── Zoom Linux Native — Local CSS Overrides ────────────────────────── */
`;


async function injectCSS(webContents) {
  return webContents.insertCSS(CUSTOM_CSS);
}

module.exports = { injectCSS };
