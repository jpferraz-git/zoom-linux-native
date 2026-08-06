'use strict';

const { app, BrowserWindow } = require('electron');
const path = require('path');
const windowManager = require('./window-manager');

/**
 * Entry point do processo principal.
 *
 * Por quê: este arquivo SÓ orquestra — não contém lógica de negócio.
 * Toda criação de janela, configuração de segurança e gerenciamento de ciclo
 * de vida deve residir em módulos dedicados (window-manager, tray-manager, etc.).
 * Isso segue o padrão definido no GEMINI.md §3 (arquitetura em camadas) e §12
 * (anti-padrão: lógica de negócio dentro de main/index.js).
 */
app.whenReady().then(() => {
  windowManager.createMainWindow();

  app.on('activate', () => {
    // macOS: recriar janela se o dock icon for clicado e não houver janelas abertas.
    if (BrowserWindow.getAllWindows().length === 0) {
      windowManager.createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // No Linux/Windows, encerrar o processo quando todas as janelas forem fechadas.
  // No Épico 3 (tray), este comportamento será alterado para minimizar para tray.
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
