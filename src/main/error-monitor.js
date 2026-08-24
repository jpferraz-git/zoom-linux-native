'use strict';

const { dialog, ipcMain } = require('electron');
const { CHANNELS } = require('./ipc/channels');

const MEDIA_ERROR_PATTERN = /\b(media|screen.?shar|webrtc|video|destination.?sharing|capturer|pipewire|getdisplaymedia|webglcontextlost)\b/i;

/**
 * Conecta o monitor de erros ao webContents e à janela.
 *
 * Monitora três categorias de falha:
 * 1. render-process-gone — crash completo do renderer (dialog + reload/close).
 * 2. console-message de mídia — loga warnings/errors relacionados a vídeo/WebRTC.
 * 3. did-fail-load — falha de carregamento de página (exibe offline.html).
 *
 * Além disso, registra um handler IPC para webglcontextlost (disparado pelo
 * preload) que faz reload silencioso em vez do dialog genérico de crash —
 * a perda de contexto WebGL é recuperável e não exige intervenção do usuário.
 *
 * @param {Electron.WebContents} webContents
 * @param {Electron.BrowserWindow} window
 */
function attachErrorMonitor(webContents, window) {
  webContents.on('render-process-gone', (_event, details) => {
    const { reason, exitCode } = details;
    console.error(
      `[error-monitor] Renderer process gone. Reason: ${reason}, exit code: ${exitCode}`
    );

    if (window.isDestroyed()) return;

    dialog
      .showMessageBox(window, {
        type: 'error',
        title: 'Zoom Linux Native — Renderer Crashed',
        message: `The Zoom Web Client renderer has stopped unexpectedly.\n\nReason: ${reason}`,
        detail:
          'This is usually a temporary issue. Click "Reload" to restart the web client, or "Close" to exit the app.',
        buttons: ['Reload', 'Close'],
        defaultId: 0,
        cancelId: 1,
      })
      .then(({ response }) => {
        if (response === 0) {
          window.loadURL(webContents.getURL() || 'https://zoom.us/wc');
        } else {
          window.close();
        }
      });
  });

  webContents.on('console-message', (_event, level, message, line, sourceId) => {
    if (level >= 2 && MEDIA_ERROR_PATTERN.test(message)) {
      console.warn(
        `[error-monitor] Media-related console ${level === 3 ? 'error' : 'warning'}: ${message}` +
          (sourceId ? ` (source: ${sourceId}:${line})` : '')
      );
    }
  });

  /**
   * Handler IPC para webglcontextlost disparado pelo preload.
   *
   * Diferente do render-process-gone, a perda de contexto WebGL não mata o
   * renderer — é um sintoma de saturação de GPU (documentado como correlacionado
   * ao volume de participantes em reuniões grandes). Um reload silencioso
   * recupera o contexto sem exigir interação do usuário.
   */
  ipcMain.on(CHANNELS.WEBGL_CONTEXT_LOST, () => {
    console.warn(
      '[error-monitor] WebGL context lost detected — reloading page silently'
    );

    if (window.isDestroyed()) return;

    webContents.reloadIgnoringCache();
  });

  webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL, isMainFrame) => {
    console.error(
      `[error-monitor] Page load failed. URL: ${validatedURL}, ` +
        `error: ${errorDescription} (code: ${errorCode})`
    );


    if (isMainFrame && errorCode !== -3 /* ERR_ABORTED */) {
      const path = require('path');
      window.loadFile(path.join(__dirname, 'assets', 'offline.html'));
    }
  });
}

module.exports = { attachErrorMonitor };
