'use strict';

/**
 * Local CSS overrides for the Zoom Web Client.
 *
 * Avaliação (2026-08-11): nenhum override CSS necessário no momento.
 * O problema do painel de chat colapsando foi resolvido via minWidth:1100
 * em config/constants.js (task 2.6), que é a solução de manutenção zero
 * (não depende de seletores/classes da Zoom que podem mudar).
 *
 * Se no futuro a Zoom mudar breakpoints ou surgir outro problema de
 * apresentação, adicionar regras CSS aqui. Usar apenas seletores
 * estáveis (IDs, atributos data-*) e documentar a data do teste.
 *
 * Regra: isso é ajuste de apresentação local (mesma categoria de
 * extensões como Dark Reader), nunca tocar em lógica/comportamento
 * da página (GEMINI.md §12, task 2.8 do plano).
 */
const CUSTOM_CSS = `
/* ─── Zoom Linux Native — Local CSS Overrides ────────────────────────── */
/* Currently empty: minWidth constraint handles chat panel visibility.   */
/* Add rules here only if presentation issues arise that can't be        */
/* solved by window constraints alone.                                   */
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
