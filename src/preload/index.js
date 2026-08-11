'use strict';

const { contextBridge, ipcRenderer } = require('electron');

/**
 * Preload bridge — Facade pattern (GEMINI.md §5).
 *
 * Exposes a minimal, high-level API to the renderer via contextBridge.
 * Never exposes ipcRenderer directly. Channel names must match the
 * constants in src/main/ipc/channels.js (CHANNELS object).
 */
contextBridge.exposeInMainWorld('electronAPI', {
  /** Reloads the Zoom Web Client. Channel: CHANNELS.APP_RELOAD ('app:reload') */
  reloadApp: () => ipcRenderer.invoke('app:reload'),
});

