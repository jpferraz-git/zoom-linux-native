'use strict';

const { isAllowedUrl } = require('./config/allowed-origins');
const { ZOOM_WEB_CLIENT_URL } = require('./config/constants');

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

function extractDeepLinkFromArgv(argv) {
  if (!Array.isArray(argv)) return null;

  for (const arg of argv) {
    if (typeof arg === 'string' && arg.startsWith('zoommtg://')) {
      return arg;
    }
  }

  return null;
}

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
