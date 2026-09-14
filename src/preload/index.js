'use strict';

const { contextBridge, ipcRenderer } = require('electron');
const { CHANNELS } = require('../main/ipc/channels');

contextBridge.exposeInMainWorld('electronAPI', {
  reloadApp: () => ipcRenderer.invoke(CHANNELS.APP_RELOAD),
});

/**
 * Captura o evento webglcontextlost no nível do document (fase de captura)
 * e avisa o main process via IPC para que o error-monitor possa reagir
 * com um reload silencioso em vez do dialog genérico de crash.
 *
 * Por quê capture: true — o evento é disparado no <canvas> e pode não
 * borbulhar se o Zoom chamar stopPropagation. Capturando na fase de
 * descida, garantimos que pegamos o evento independente do comportamento
 * do código da Zoom.
 */
document.addEventListener(
  'webglcontextlost',
  (event) => {
    event.preventDefault();
    ipcRenderer.send(CHANNELS.WEBGL_CONTEXT_LOST);
  },
  { capture: true }
);
