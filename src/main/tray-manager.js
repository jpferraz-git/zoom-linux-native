'use strict';

const { Tray, Menu, nativeImage, app } = require('electron');
const path = require('path');
const windowManager = require('./window-manager');
const { APP_NAME, ZOOM_WEB_CLIENT_URL } = require('./config/constants');

const TRAY_ICON_PATH = path.join(__dirname, '../../build/icon.png');

let tray = null;

/**
 * Cria o ícone de bandeja (system tray) com menu de contexto.
 *
 * O menu oferece Open (mostra/foca a janela), Reload (recarrega o web client)
 * e Quit (encerra o app). Click no ícone também mostra/foca a janela.
 *
 * @returns {Electron.Tray}
 */
function createTray() {
  let icon;

  try {
    icon = nativeImage.createFromPath(TRAY_ICON_PATH);
    if (icon.isEmpty()) {
      icon = nativeImage.createEmpty();
    }
  } catch {
    icon = nativeImage.createEmpty();
  }

  tray = new Tray(icon);
  tray.setToolTip(APP_NAME);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open',
      click: () => {
        showMainWindow();
      },
    },
    {
      label: 'Reload',
      click: () => {
        const win = windowManager.getMainWindow();
        if (win) {
          win.loadURL(ZOOM_WEB_CLIENT_URL);
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    showMainWindow();
  });

  return tray;
}

function showMainWindow() {
  const win = windowManager.getMainWindow();
  if (win) {
    win.show();
    win.focus();
  } else {
    windowManager.createMainWindow();
  }
}

module.exports = { createTray };

