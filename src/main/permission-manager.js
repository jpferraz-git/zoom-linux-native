'use strict';

const { isAllowedUrl } = require('./config/allowed-origins');

const ZOOM_ALLOWED_PERMISSIONS = new Set([
  'media',
  'notifications',
]);

function setupPermissionHandlers(ses) {
  ses.setPermissionRequestHandler((webContents, permission, callback, details) => {
    const origin = details.requestingUrl || '';
    if (isAllowedUrl(origin) && ZOOM_ALLOWED_PERMISSIONS.has(permission)) {
      callback(true);
      return;
    }

    callback(false);
  });

  ses.setPermissionCheckHandler((webContents, permission, requestingOrigin) => {
    if (isAllowedUrl(requestingOrigin) && ZOOM_ALLOWED_PERMISSIONS.has(permission)) {
      return true;
    }

    return false;
  });
}

function setupDisplayMediaHandler(ses) {
  ses.setDisplayMediaRequestHandler((_request, callback) => {
    // Delegate screen/window selection to the OS-native portal.
    // On Wayland: triggers xdg-desktop-portal's ScreenCast dialog.
    // On X11: triggers Chromium's built-in X11 capture picker.
    callback({ video: true, audio: true });
  }, { useSystemPicker: true });
}

module.exports = { setupPermissionHandlers, setupDisplayMediaHandler };
