'use strict';

const { isAllowedUrl } = require('./config/allowed-origins');
const { ZOOM_WEB_CLIENT_URL } = require('./config/constants');

/**
 * Parses a `zoommtg://` deep link and translates it to the corresponding
 * Zoom Web Client URL.
 *
 * Por quê: quando o usuário clica num link de reunião (e-mail, calendário),
 * o SO dispara o protocolo `zoommtg://` registrado pelo app. Este módulo
 * traduz esse link para a URL do web client que o BrowserWindow pode carregar.
 * A URL resultante DEVE passar pela allowlist central antes de ser navegada
 * (GEMINI.md §2.4) — este módulo não navega diretamente, apenas retorna a URL.
 *
 * Formatos conhecidos de zoommtg://:
 *   zoommtg://zoom.us/join?confno=1234567890&pwd=abc123
 *   zoommtg://zoom.us/join?action=join&confno=1234567890&pwd=abc123
 *   zoommtg://zoom.us/start?confno=1234567890
 *
 * @param {string} deepLinkUrl - The raw zoommtg:// URL received from the OS.
 * @returns {string|null} The translated https://zoom.us/wc/join/... URL, or null
 *   if the link is invalid or fails allowlist validation.
 */
function parseDeepLink(deepLinkUrl) {
  if (!deepLinkUrl || typeof deepLinkUrl !== 'string') return null;

  let parsed;
  try {
    parsed = new URL(deepLinkUrl);
  } catch {
    console.warn('[deep-link-handler] Failed to parse deep link URL:', deepLinkUrl);
    return null;
  }

  // Only handle zoommtg:// protocol
  if (parsed.protocol !== 'zoommtg:') return null;

  const confNo = parsed.searchParams.get('confno');
  if (!confNo) {
    console.warn('[deep-link-handler] Deep link missing confno parameter:', deepLinkUrl);
    return null;
  }

  // Build the web client URL
  const webClientUrl = new URL(`${ZOOM_WEB_CLIENT_URL}/join/${confNo}`);

  // Forward password if present
  const pwd = parsed.searchParams.get('pwd');
  if (pwd) {
    webClientUrl.searchParams.set('pwd', pwd);
  }

  const resultUrl = webClientUrl.toString();

  // Validate against the central allowlist before returning
  if (!isAllowedUrl(resultUrl)) {
    console.warn('[deep-link-handler] Translated URL rejected by allowlist:', resultUrl);
    return null;
  }

  return resultUrl;
}

/**
 * Extracts a zoommtg:// URL from process argv, if present.
 *
 * Por quê: no Linux, quando o app já está rodando e o SO dispara o protocolo,
 * o Electron recebe a URL via o evento `second-instance` com os argv da segunda
 * instância. Quando o app NÃO está rodando, a URL vem no process.argv da
 * primeira instância. Este helper extrai a URL de qualquer array de argv.
 *
 * @param {string[]} argv - The process.argv array (from first or second instance).
 * @returns {string|null} The zoommtg:// URL found in argv, or null.
 */
function extractDeepLinkFromArgv(argv) {
  if (!Array.isArray(argv)) return null;

  for (const arg of argv) {
    if (typeof arg === 'string' && arg.startsWith('zoommtg://')) {
      return arg;
    }
  }

  return null;
}

/**
 * Handles a deep link by parsing it and navigating the main window.
 *
 * @param {string} deepLinkUrl - The raw zoommtg:// URL.
 * @param {Function} getMainWindow - Function that returns the main BrowserWindow (or null).
 */
function handleDeepLink(deepLinkUrl, getMainWindow) {
  const webClientUrl = parseDeepLink(deepLinkUrl);

  if (!webClientUrl) {
    console.warn('[deep-link-handler] Ignoring invalid deep link:', deepLinkUrl);
    return;
  }

  const win = getMainWindow();
  if (!win) {
    console.warn('[deep-link-handler] No main window available to navigate.');
    return;
  }

  console.info(`[deep-link-handler] Navigating to meeting: ${webClientUrl}`);
  win.loadURL(webClientUrl);

  // Ensure window is visible and focused
  if (!win.isVisible()) win.show();
  if (win.isMinimized()) win.restore();
  win.focus();
}

module.exports = { parseDeepLink, extractDeepLinkFromArgv, handleDeepLink };
