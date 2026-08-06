'use strict';

const { contextBridge } = require('electron');

/**
 * Preload script — secure bridge between the main process and the renderer.
 *
 * Why: this is the ONLY point where the renderer has controlled access to
 * system capabilities. Every API exposed here must be minimal, typed and
 * explicit. Never expose `ipcRenderer` directly — always wrap it through
 * named methods on this object.
 *
 * Currently exposes an empty object as a placeholder.
 * Real APIs will be added in tasks 1.x, 3.x and 5.x as needed.
 * See GEMINI.md §7 (IPC Contract) and §5 (Facade pattern).
 */
contextBridge.exposeInMainWorld('electronAPI', {
  // TODO(joaopedroferraz): add real APIs starting from Epic 1
  // Example: reloadApp: () => ipcRenderer.invoke(CHANNELS.APP_RELOAD)
});
