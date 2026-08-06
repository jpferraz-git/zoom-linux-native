'use strict';

const { contextBridge } = require('electron');

/**
 * Preload script — ponte segura entre o processo main e o renderer.
 *
 * Por quê: este é o ÚNICO ponto onde o renderer tem acesso controlado a
 * funcionalidades do sistema. Toda API exposta aqui deve ser mínima, tipada
 * e explícita. Nunca expor `ipcRenderer` diretamente — sempre encapsular
 * via métodos nomeados neste objeto.
 *
 * Atualmente expõe um objeto vazio como placeholder.
 * APIs reais serão adicionadas nas tasks 1.x, 3.x e 5.x conforme necessário.
 * Ver GEMINI.md §7 (Contrato de IPC) e §5 (Facade pattern).
 */
contextBridge.exposeInMainWorld('electronAPI', {
  // TODO(joaopedroferraz): adicionar APIs reais a partir do Épico 1
  // Exemplo: reloadApp: () => ipcRenderer.invoke(CHANNELS.APP_RELOAD)
});
