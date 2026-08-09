'use strict';

const { contextBridge, ipcRenderer } = require('electron');

/**
 * Preload script — secure bridge between the main process and the renderer.
 *
 * Why: this is the ONLY point where the renderer has controlled access to
 * system capabilities. Every API exposed here must be minimal, typed and
 * explicit. Never expose `ipcRenderer` directly — always wrap it through
 * named methods on this object.
 *
 * See GEMINI.md §7 (IPC Contract) and §5 (Facade pattern).
 *
 * Task 3.3 — Notifications:
 * The Zoom Web Client uses the standard Web Notifications API
 * (`new Notification()`), which Electron supports natively without any
 * preload bridge. The permission-manager (Task 2.2) already auto-approves
 * `notifications` permission for zoom.us origins. No additional code is
 * needed here for notifications to work.
 */
contextBridge.exposeInMainWorld('electronAPI', {
  /**
   * Requests the main process to reload the Zoom Web Client page.
   * Used by the error recovery dialog (Task 2.7) if wired up in the future.
   *
   * @returns {Promise<void>}
   */
  reloadApp: () => ipcRenderer.invoke('app:reload'),
});
