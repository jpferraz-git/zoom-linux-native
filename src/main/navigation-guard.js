'use strict';

const { shell } = require('electron');

/**
 * Allowlist of domains that are allowed to navigate within the app.
 * Any navigation to a domain NOT in this list is blocked and opened
 * in the user's default external browser instead.
 *
 * Why an allowlist: the renderer loads third-party content (Zoom).
 * We must control which origins can run inside our Electron process.
 * See GEMINI.md §2 (Golden rules) — never allow arbitrary navigation.
 *
 * @type {string[]}
 */
const ALLOWED_DOMAINS = [
  'zoom.us',
  'zoom.com',
  // OAuth SSO providers — Zoom redirects here during Google/Microsoft login flows.
  'accounts.google.com',
  'login.microsoftonline.com',
  'login.live.com',
  'appleid.apple.com',
  'facebook.com',
];

/**
 * Checks whether a URL belongs to one of the allowed domains.
 *
 * @param {string} urlString - The URL to check.
 * @returns {boolean} True if the domain is in the allowlist.
 */
function isAllowedDomain(urlString) {
  try {
    const { hostname } = new URL(urlString);
    return ALLOWED_DOMAINS.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
    );
  } catch {
    // Malformed URL — block by default.
    return false;
  }
}

/**
 * Attaches navigation guards to a BrowserWindow's webContents.
 *
 * Covers two vectors:
 * 1. `setWindowOpenHandler` — intercepts `window.open()` / `target="_blank"` links.
 * 2. `will-navigate` — intercepts in-page navigation (e.g. `<a href="...">`).
 *
 * Behaviour:
 * - Allowed domain → navigate inside the app (or open the new-window request).
 * - Blocked domain → open in the system's default browser, deny internal navigation.
 *
 * @param {import('electron').WebContents} webContents
 */
function attachNavigationGuards(webContents) {
  // Vector 1: window.open() and target="_blank" links.
  webContents.setWindowOpenHandler(({ url }) => {
    if (isAllowedDomain(url)) {
      // Allow Zoom-related popups (e.g. OAuth consent screens) to open inside the app.
      return { action: 'allow' };
    }

    // External link — open in system browser, block internal window creation.
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Vector 2: in-page navigation (anchor clicks, JS redirects).
  webContents.on('will-navigate', (event, url) => {
    if (!isAllowedDomain(url)) {
      event.preventDefault();
      shell.openExternal(url);
    }
    // If the domain IS allowed, the default behaviour (navigate) proceeds.
  });
}

module.exports = { attachNavigationGuards, isAllowedDomain };
