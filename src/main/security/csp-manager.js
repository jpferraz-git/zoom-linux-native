'use strict';

/**
 * Configura Content Security Policy para respostas HTTP da Zoom.
 *
 * A CSP é injetada apenas em respostas de domínios Zoom (zoom.us, zoom.com),
 * via filtro de URL no onHeadersReceived. Respostas de file:// (ex:
 * offline.html) e outros protocolos não são afetadas — o que evita que
 * inline CSS/JS de páginas locais seja bloqueado pela política.
 *
 * @param {Electron.Session} session
 */
function setupCSP(session) {
  const filter = {
    urls: ['https://*.zoom.us/*', 'https://zoom.us/*', 'https://*.zoom.com/*', 'https://zoom.com/*'],
  };

  session.webRequest.onHeadersReceived(filter, (details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self' https://zoom.us https://*.zoom.us https://zoom.com wss://*.zoom.us;",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://zoom.us https://*.zoom.us https://zoom.com;",
          "worker-src 'self' blob: https://zoom.us https://*.zoom.us https://zoom.com;",
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