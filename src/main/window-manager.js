'use strict';

const { BrowserWindow } = require('electron');
const path = require('path');

/**
 * Instância singleton da janela principal.
 * Mantida como closure interna — nunca exposta como global.
 *
 * @type {BrowserWindow | null}
 */
let mainWindow = null;

/**
 * Cria a janela principal do aplicativo com configurações de segurança obrigatórias.
 *
 * Por quê Factory pattern: centraliza a criação da BrowserWindow com webPreferences
 * seguras padronizadas, tornando impossível criar uma janela insegura por esquecimento.
 * Ver GEMINI.md §5 (Design patterns) e §2 (Regras de ouro).
 *
 * Configurações de segurança aplicadas:
 * - `contextIsolation: true` — isolamento obrigatório entre main e renderer.
 * - `nodeIntegration: false` — o conteúdo é de terceiros (Zoom); expor Node.js seria RCE.
 * - `sandbox: true` — camada extra de isolamento do processo renderer.
 * - `preload` — único ponto de comunicação renderer ↔ main, via contextBridge.
 *
 * @returns {BrowserWindow} A janela principal criada.
 */
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'Zoom Linux Native',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, '../preload/index.js'),
    },
  });

  // Placeholder: carrega tela em branco até o Épico 1 implementar o carregamento do Zoom.
  // TODO(joaopedroferraz): substituir por zoom.us/wc na task 1.1
  mainWindow.loadURL('about:blank');

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  return mainWindow;
}

/**
 * Retorna a instância atual da janela principal, ou null se não existir.
 *
 * @returns {BrowserWindow | null}
 */
function getMainWindow() {
  return mainWindow;
}

module.exports = { createMainWindow, getMainWindow };
