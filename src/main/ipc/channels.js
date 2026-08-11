'use strict';

/**
 * Centralized IPC channel name constants.
 *
 * Por quê: nunca usar strings mágicas espalhadas pelo código para nomes
 * de canais IPC (GEMINI.md §5, §7). Todos os canais são definidos aqui
 * e referenciados por constante nos handlers e no preload.
 *
 * Formato: 'dominio:acao' (ex: 'app:reload', 'window:minimize-to-tray').
 */
const CHANNELS = Object.freeze({
  APP_RELOAD: 'app:reload',
});

module.exports = { CHANNELS };
