'use strict';

const { autoUpdater } = require('electron-updater');
const { dialog } = require('electron');

/**
 * Configura o auto-updater via GitHub Releases.
 *
 * O download não é automático — o usuário recebe um dialog perguntando se
 * deseja baixar, e outro quando o download termina perguntando se quer
 * reiniciar. Isso evita surpresas durante reuniões em andamento.
 */
function setupUpdater() {
  autoUpdater.autoDownload = false;
  
  autoUpdater.on('update-available', (info) => {
    dialog.showMessageBox({
      type: 'info',
      title: 'Update Available',
      message: `A new version (${info.version}) is available. Do you want to download it now?`,
      buttons: ['Yes', 'No']
    }).then((result) => {
      if (result.response === 0) {
        autoUpdater.downloadUpdate();
      }
    });
  });

  autoUpdater.on('update-downloaded', () => {
    dialog.showMessageBox({
      type: 'info',
      title: 'Update Ready',
      message: 'The update has been downloaded. Restart the application to apply the updates.',
      buttons: ['Restart', 'Later']
    }).then((result) => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
  });

  autoUpdater.on('error', (err) => {
    console.error('[updater] Auto-updater error:', err.message);
  });

  try {
    autoUpdater.checkForUpdatesAndNotify();
  } catch (err) {
    console.error('[updater] Failed to check for updates:', err.message);
  }
}

module.exports = { setupUpdater };

