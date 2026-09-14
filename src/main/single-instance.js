'use strict';

const { app } = require('electron');
const { extractDeepLinkFromArgv, handleDeepLink } = require('./deep-link-handler');

/**
 * Garante que apenas uma instância do app esteja rodando.
 *
 * Se uma segunda instância for aberta, ela repassa seus argumentos (incluindo
 * possíveis deep links zoommtg://) para a instância existente e encerra.
 * A instância original foca a janela principal e processa o deep link.
 *
 * @param {() => Electron.BrowserWindow | null} getMainWindow
 * @returns {boolean} true se esta é a primeira instância, false se é duplicata.
 */
function enforceSingleInstance(getMainWindow) {
  const gotTheLock = app.requestSingleInstanceLock();

  if (!gotTheLock) {
    app.quit();
    return false;
  }

  app.on('second-instance', (_event, argv) => {
    const win = getMainWindow();
    if (win) {
      if (win.isMinimized()) win.restore();
      win.show();
      win.focus();
    }

    const deepLinkUrl = extractDeepLinkFromArgv(argv);
    if (deepLinkUrl) {
      handleDeepLink(deepLinkUrl, getMainWindow);
    }
  });

  return true;
}

module.exports = { enforceSingleInstance };

