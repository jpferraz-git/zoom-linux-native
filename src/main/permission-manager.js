'use strict';

const { session, desktopCapturer } = require('electron');
const { isAllowedOrigin } = require('./config/allowed-origins');

/**
 * Permissions that Zoom legitimately needs to function.
 * Anything outside this set is denied by default.
 *
 * - `media`         — camera and microphone access (WebRTC calls).
 * - `notifications` — meeting invites, chat messages, raise-hand alerts.
 *
 * @type {Set<string>}
 */
const ZOOM_ALLOWED_PERMISSIONS = new Set([
  'media',
  'notifications',
]);

/**
 * Sets up the permission request handler for the default session.
 *
 * Why: Electron auto-approves all permissions by default — this is a security
 * risk when loading third-party content. We flip the default to deny-all and
 * explicitly whitelist only the permissions Zoom needs, only from Zoom-owned
 * origins.
 *
 * See GEMINI.md §2 (Golden rules) — deny by default, whitelist explicitly.
 *
 * @param {import('electron').Session} ses — the session to configure.
 */
function setupPermissionHandlers(ses) {
  // ── Permission Request Handler ──────────────────────────────────────────
  // Intercepts runtime permission prompts (camera, mic, notifications).
  ses.setPermissionRequestHandler((webContents, permission, callback, details) => {
    const origin = details.requestingUrl || '';
    let hostname = '';

    try {
      hostname = new URL(origin).hostname;
    } catch {
      // Malformed URL — deny.
      callback(false);
      return;
    }

    if (isAllowedOrigin(hostname) && ZOOM_ALLOWED_PERMISSIONS.has(permission)) {
      callback(true);
      return;
    }

    // Deny everything else by default.
    callback(false);
  });

  // ── Permission Check Handler ────────────────────────────────────────────
  // Synchronous check that Chromium calls before the request handler.
  // Must return `true` for the request handler to fire.
  ses.setPermissionCheckHandler((webContents, permission, requestingOrigin) => {
    let hostname = '';

    try {
      hostname = new URL(requestingOrigin).hostname;
    } catch {
      return false;
    }

    if (isAllowedOrigin(hostname) && ZOOM_ALLOWED_PERMISSIONS.has(permission)) {
      return true;
    }

    return false;
  });
}

/**
 * Sets up the display media request handler for screen sharing.
 *
 * Why: Without this handler, `navigator.mediaDevices.getDisplayMedia()` calls
 * from the Zoom Web Client silently fail in Electron.
 *
 * On Wayland: the `WebRTCPipeWireCapturer` flag (set in index.js) causes
 * Chromium to route the capture request through PipeWire, which triggers the
 * system's xdg-desktop-portal picker dialog. The `desktopCapturer.getSources()`
 * call returns whatever the portal grants.
 *
 * On X11: `desktopCapturer.getSources()` returns the list of available screens
 * directly, and we grant the first one.
 *
 * Note: `useSystemPicker: true` is macOS-only (Electron docs confirm this is
 * experimental and limited to macOS 15+). On Linux, the system picker is
 * activated by the PipeWire capturer flag, not by this option.
 *
 * @param {import('electron').Session} ses — the session to configure.
 */
function setupDisplayMediaHandler(ses) {
  ses.setDisplayMediaRequestHandler(async (request, callback) => {
    try {
      const sources = await desktopCapturer.getSources({ types: ['screen'] });

      if (sources.length === 0) {
        console.warn('[permission-manager] No screen sources available for sharing.');
        callback({});
        return;
      }

      // Grant the first available screen.
      // On Wayland/PipeWire, the portal already filtered the user's choice.
      callback({ video: sources[0] });
    } catch (err) {
      // User cancelled the picker, or PipeWire/portal error.
      console.error('[permission-manager] Screen share request failed:', err.message);
      callback({});
    }
  });
}

module.exports = { setupPermissionHandlers, setupDisplayMediaHandler };
