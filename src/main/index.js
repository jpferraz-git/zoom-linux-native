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
const { execSync } = require('child_process');

/**
 * Verifica de forma síncrona se a máquina possui placa de vídeo NVIDIA (Linux).
 * Se o processo falhar (ex: lspci não encontrado), assume false.
 */
function hasNvidiaGpu() {
  if (process.platform !== 'linux') return false;
  try {
    execSync('lspci -nn | grep -iE "vga|3d" | grep -i nvidia', { stdio: 'ignore' });
    return true;
  } catch (err) {
    return false;
  }
}

let enableFeatures = 'WebRTCPipeWireCapturer,WaylandWindowDecorations';

if (!hasNvidiaGpu()) {
  enableFeatures += ',VaapiVideoDecoder,VaapiVideoEncoder';
}

app.commandLine.appendSwitch('enable-features', enableFeatures);
app.commandLine.appendSwitch('ozone-platform-hint', 'auto');

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
