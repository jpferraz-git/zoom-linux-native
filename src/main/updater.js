'use strict';

const { autoUpdater } = require('electron-updater');
const { dialog } = require('electron');

/**
 * Initializes the auto updater.
 */
function setupUpdater() {
  autoUpdater.autoDownload = false; // Just notify for now, download manually via prompt
  
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
    console.error('Error in auto-updater.', err);
  });

  try {
    autoUpdater.checkForUpdatesAndNotify();
  } catch (error) {
    console.error('Failed to check for updates', error);
  }
}

module.exports = { setupUpdater };
