'use strict';

const { isAllowedHostname } = require('./config/allowed-origins');

/**
 * Set of permission types that are auto-approved for allowed origins.
 * Only media (camera/mic) and notifications are approved — everything
 * else is denied by default, even for zoom.us.
 */
const ZOOM_ALLOWED_PERMISSIONS = new Set([
  'media',
  'notifications',
]);

/**
 * Registers permission request and check handlers on the given session.
 *
 * Por quê: Electron's default behavior is to silently deny all permission
 * requests. For a video conferencing app, camera and microphone must be
 * explicitly approved — but only for the Zoom origin (GEMINI.md §2.5).
 * Any other origin or non-media permission is denied.
 *
 * @param {import('electron').Session} ses - The Electron session to configure.
 */
function setupPermissionHandlers(ses) {
  ses.setPermissionRequestHandler((webContents, permission, callback, details) => {
    const origin = details.requestingUrl || '';
    let hostname = '';

    try {
      hostname = new URL(origin).hostname;
    } catch {
      callback(false);
      return;
    }

    if (isAllowedHostname(hostname) && ZOOM_ALLOWED_PERMISSIONS.has(permission)) {
      callback(true);
      return;
    }

    callback(false);
  });

  ses.setPermissionCheckHandler((webContents, permission, requestingOrigin) => {
    let hostname = '';

    try {
      hostname = new URL(requestingOrigin).hostname;
    } catch {
      return false;
    }

    if (isAllowedHostname(hostname) && ZOOM_ALLOWED_PERMISSIONS.has(permission)) {
      return true;
    }

    return false;
  });
}

/**
 * Registers the display media (screen share) request handler.
 *
 * Por quê: usa `useSystemPicker: true` para delegar a seleção de tela/janela
 * ao portal nativo do sistema operacional (xdg-desktop-portal no Wayland,
 * picker nativo no X11). Isso evita usar `desktopCapturer.getSources()` que
 * está deprecated a partir do Electron 32 e não oferece UI de seleção ao
 * usuário. O portal nativo é exatamente o ponto onde o cliente Qt do Zoom
 * falha — ao usar o pipeline padrão do Chromium via portal, esse crash é
 * evitado completamente.
 *
 * @param {import('electron').Session} ses - The Electron session to configure.
 */
function setupDisplayMediaHandler(ses) {
  ses.setDisplayMediaRequestHandler((_request, callback) => {
    // Delegate screen/window selection to the OS-native portal.
    // On Wayland: triggers xdg-desktop-portal's ScreenCast dialog.
    // On X11: triggers Chromium's built-in X11 capture picker.
    callback({ video: true, audio: true });
  }, { useSystemPicker: true });
}

module.exports = { setupPermissionHandlers, setupDisplayMediaHandler };
