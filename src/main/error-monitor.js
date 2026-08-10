'use strict';

const { dialog } = require('electron');

const MEDIA_ERROR_PATTERN = /\b(media|screen.?shar|webrtc|video|destination.?sharing|capturer|pipewire|getdisplaymedia)\b/i;

/**
 * Attaches error monitoring listeners to a BrowserWindow's webContents.
 * @param {import('electron').WebContents} webContents
 * @param {import('electron').BrowserWindow} window
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

  webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    console.error(
      `[error-monitor] Page load failed. URL: ${validatedURL}, ` +
        `error: ${errorDescription} (code: ${errorCode})`
    );
  });
}

module.exports = { attachErrorMonitor };
