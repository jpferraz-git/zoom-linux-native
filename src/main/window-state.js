'use strict';

const fs = require('fs');
const path = require('path');
const { app } = require('electron');

const STATE_FILE = path.join(app.getPath('userData'), 'window-state.json');

/**
 * Restaura posição e tamanho da janela salvos em disco.
 *
 * Retorna null se o arquivo não existir, estiver corrompido, ou contiver
 * dimensões inválidas (< 100px) — o caller usa defaults nesse caso.
 *
 * @returns {{ x: number, y: number, width: number, height: number, isMaximized: boolean } | null}
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
 * Salva posição e tamanho da janela em disco (JSON).
 *
 * Usa getNormalBounds() quando maximizada para preservar a geometria
 * pré-maximize, permitindo restaurar corretamente na próxima abertura.
 *
 * @param {Electron.BrowserWindow} win
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
