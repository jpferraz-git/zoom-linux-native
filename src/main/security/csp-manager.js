'use strict';

/**
 * Attaches a Content-Security-Policy header to all responses.
 * @param {import('electron').Session} session
 */
function setupCSP(session) {
  session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self' https://zoom.us https://*.zoom.us https://zoom.com wss://*.zoom.us;",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://zoom.us https://*.zoom.us https://zoom.com;",
          "style-src 'self' 'unsafe-inline' https://zoom.us https://*.zoom.us https://zoom.com;",
          "img-src 'self' data: https://zoom.us https://*.zoom.us https://zoom.com;",
          "font-src 'self' data: https://zoom.us https://*.zoom.us;",
          "connect-src 'self' https://zoom.us https://*.zoom.us wss://*.zoom.us;",
          "media-src 'self' blob: https://zoom.us https://*.zoom.us;",
          "object-src 'none';",
          "base-uri 'none';",
          "form-action 'self' https://zoom.us https://*.zoom.us;"
        ].join(' ')
      }
    });
  });
}

module.exports = { setupCSP };
