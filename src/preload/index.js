'use strict';

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  reloadApp: () => ipcRenderer.invoke('app:reload'),
});
