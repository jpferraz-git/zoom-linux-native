'use strict';

const { desktopCapturer } = require('electron');
const { isAllowedOrigin } = require('./config/allowed-origins');

const ZOOM_ALLOWED_PERMISSIONS = new Set([
  'media',
  'notifications',
]);


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

    if (isAllowedOrigin(hostname) && ZOOM_ALLOWED_PERMISSIONS.has(permission)) {
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

    if (isAllowedOrigin(hostname) && ZOOM_ALLOWED_PERMISSIONS.has(permission)) {
      return true;
    }

    return false;
  });
}


function setupDisplayMediaHandler(ses) {
  ses.setDisplayMediaRequestHandler(async (request, callback) => {
    try {
      const sources = await desktopCapturer.getSources({ types: ['screen'] });

      if (sources.length === 0) {
        console.warn('[permission-manager] No screen sources available for sharing.');
        callback({});
        return;
      }

      callback({ video: sources[0] });
    } catch (err) {
      console.error('[permission-manager] Screen share request failed:', err.message);
      callback({});
    }
  });
}

module.exports = { setupPermissionHandlers, setupDisplayMediaHandler };
