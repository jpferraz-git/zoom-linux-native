'use strict';

const { dialog } = require('electron');

/**
 * Keywords that indicate media/screen-sharing related errors in the
 * Zoom Web Client's console output. Used to filter noise from the
 * `console-message` event.
 *
 * @type {RegExp}
 */
const MEDIA_ERROR_PATTERN = /\b(media|screen.?shar|webrtc|video|destination.?sharing|capturer|pipewire|getdisplaymedia)\b/i;

/**
 * Attaches error monitoring listeners to a BrowserWindow's webContents.
 *
 * Why: the Zoom Web Client has known intermittent failures (screen share
 * stops rendering, renderer crashes). Without monitoring, these are silent
 * and unrecoverable — the user stares at a frozen screen with no feedback.
 *
 * This module transforms silent failures into visible, recoverable events:
 * - Renderer crash → dialog with "Reload" / "Close" options.
 * - Media-related console errors → logged to main process stdout for diagnosis.
 * - Load failures → logged for troubleshooting.
 *
 * Important: this is mitigation, not a fix — the bugs originate in the Zoom
 * Web Client itself. This limitation is documented honestly in the README.
 *
 * @param {import('electron').WebContents} webContents
 * @param {import('electron').BrowserWindow} window
 */
function attachErrorMonitor(webContents, window) {
  // ── Renderer Crash Recovery ─────────────────────────────────────────────
  // Fires when the renderer process terminates unexpectedly (crash, OOM,
  // killed by OS). Shows a dialog offering one-click reload.
  webContents.on('render-process-gone', (_event, details) => {
    const { reason, exitCode } = details;
    console.error(
      `[error-monitor] Renderer process gone. Reason: ${reason}, exit code: ${exitCode}`
    );

    // Don't show dialog if the window itself is already destroyed.
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
          // Reload the Zoom Web Client.
          window.loadURL(webContents.getURL() || 'https://zoom.us/wc');
        } else {
          window.close();
        }
      });
  });

  // ── Media Error Logging ─────────────────────────────────────────────────
  // Filters renderer console output for media-related errors and warnings.
  // Level 2 = warning, level 3 = error (Chromium's console level enum).
  webContents.on('console-message', (_event, level, message, line, sourceId) => {
    if (level >= 2 && MEDIA_ERROR_PATTERN.test(message)) {
      console.warn(
        `[error-monitor] Media-related console ${level === 3 ? 'error' : 'warning'}: ${message}` +
          (sourceId ? ` (source: ${sourceId}:${line})` : '')
      );
    }
  });

  // ── Load Failure Logging ────────────────────────────────────────────────
  // Fires when the main frame fails to load (network error, DNS failure, etc.).
  webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    console.error(
      `[error-monitor] Page load failed. URL: ${validatedURL}, ` +
        `error: ${errorDescription} (code: ${errorCode})`
    );
  });
}

module.exports = { attachErrorMonitor };
