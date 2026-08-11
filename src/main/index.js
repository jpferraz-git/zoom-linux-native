'use strict';

const { app, BrowserWindow, session } = require('electron');
const path = require('path');
const { enforceSingleInstance } = require('./single-instance');
const windowManager = require('./window-manager');
const { setupPermissionHandlers, setupDisplayMediaHandler } = require('./permission-manager');
const { createTray } = require('./tray-manager');
const { createAppMenu } = require('./app-menu');
const { setupCSP } = require('./security/csp-manager');
const { setupUpdater } = require('./updater');
const { extractDeepLinkFromArgv, handleDeepLink } = require('./deep-link-handler');
const { registerAppHandlers } = require('./ipc/handlers/app-handlers');

/**
 * Habilita a captura de tela via PipeWire em sessões Wayland.
 *
 * Por quê: o cliente nativo Qt do Zoom para Linux tem um bug conhecido de
 * crash (SIGABRT) ao iniciar/parar compartilhamento de tela em Wayland +
 * PipeWire. Como este app roda o Zoom Web Client dentro do Chromium/Electron,
 * podemos usar o pipeline padrão WebRTC + PipeWire do próprio Chromium, que é
 * mais estável.
 *
 * 'ozone-platform-hint=auto' deixa o Chromium detectar Wayland vs X11
 * sozinho, em vez de forçar --ozone-platform=wayland (o que quebraria o
 * app em distros que ainda rodam só X11).
 */
app.commandLine.appendSwitch(
  'enable-features',
  'WebRTCPipeWireCapturer,WaylandWindowDecorations'
);
app.commandLine.appendSwitch('ozone-platform-hint', 'auto');

/**
 * Registra o app como handler do protocolo zoommtg://.
 *
 * Por quê: sem isso, links de reunião (e-mail, calendário) abrem no navegador
 * do sistema em vez do app. Em modo dev (process.defaultApp), o Electron precisa
 * do caminho do script como argumento; em produção, o registro é direto.
 */
if (process.defaultApp) {
  app.setAsDefaultProtocolClient('zoommtg', process.execPath, [path.resolve(process.argv[1])]);
} else {
  app.setAsDefaultProtocolClient('zoommtg');
}

const isFirstInstance = enforceSingleInstance(() => windowManager.getMainWindow());

if (!isFirstInstance) {
  // Second instance — quit silently (single-instance.js handles forwarding)
} else {
  app.isQuitting = false;

  app.on('before-quit', () => {
    app.isQuitting = true;
  });

  // macOS-style open-url event (also works on some Linux DEs)
  app.on('open-url', (event, url) => {
    event.preventDefault();
    handleDeepLink(url, () => windowManager.getMainWindow());
  });

  app.whenReady().then(() => {
    setupPermissionHandlers(session.defaultSession);
    setupDisplayMediaHandler(session.defaultSession);
    setupCSP(session.defaultSession);

    setupUpdater();

    const mainWindow = windowManager.createMainWindow();

    createTray();
    createAppMenu(mainWindow);
    registerAppHandlers(() => windowManager.getMainWindow());

    // Handle deep link from initial launch argv (app wasn't running)
    const initialDeepLink = extractDeepLinkFromArgv(process.argv);
    if (initialDeepLink) {
      handleDeepLink(initialDeepLink, () => windowManager.getMainWindow());
    }

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        windowManager.createMainWindow();
      }
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin' && app.isQuitting) {
      app.quit();
    }
  });
}
