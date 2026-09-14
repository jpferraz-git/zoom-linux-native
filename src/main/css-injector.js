'use strict';

/**
 * CSS local injetado na página do Zoom Web Client via webContents.insertCSS.
 *
 * Intencionalmente vazio por ora — a restrição de minWidth no window-manager.js
 * resolve o problema do painel de chat. Regras CSS devem ser adicionadas aqui
 * apenas para problemas de apresentação que não podem ser resolvidos por
 * constraints de janela. Ver ARCHITECTURE.md §"Why inject CSS instead of
 * modifying the page?".
 */
const CUSTOM_CSS = `
/* ─── Zoom Linux Native — Local CSS Overrides ────────────────────────── */
/* Currently empty: minWidth constraint handles chat panel visibility.   */
/* Add rules here only if presentation issues arise that can't be        */
/* solved by window constraints alone.                                   */
`;

/**
 * Injeta CSS local no webContents carregado.
 *
 * Usa webContents.insertCSS, o mesmo mecanismo que extensões de navegador
 * (ex: Dark Reader) usam — afeta apenas apresentação, nunca DOM ou JS.
 *
 * @param {Electron.WebContents} webContents
 * @returns {Promise<string>} Chave da folha de estilo injetada.
 */
async function injectCSS(webContents) {
  return webContents.insertCSS(CUSTOM_CSS);
}

module.exports = { injectCSS };

