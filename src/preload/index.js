'use strict';

const { contextBridge, ipcRenderer } = require('electron');

/**
 * Preload script — secure bridge between the main process and the renderer.
 */
contextBridge.exposeInMainWorld('electronAPI', {
  /**
   * Requests the main process to reload the Zoom Web Client page.
   * @returns {Promise<void>}
   */
  reloadApp: () => ipcRenderer.invoke('app:reload'),
});
