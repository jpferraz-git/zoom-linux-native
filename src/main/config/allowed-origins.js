'use strict';

/**
 * Central allowlist of domains the app is allowed to navigate to internally.
 *
 * Por quê: toda navegação no app precisa passar por esta lista única (GEMINI.md §2.4).
 * Domínios fora dela são abertos no navegador do sistema via shell.openExternal().
 * Inclui domínios de OAuth/SSO porque o web client da Zoom redireciona para eles
 * durante login com Google, Microsoft, Apple e Facebook.
 */
const ALLOWED_HOST_PATTERNS = [
  /^([a-z0-9-]+\.)*zoom\.us$/i,
  /^([a-z0-9-]+\.)*zoom\.com$/i,
  /^([a-z0-9-]+\.)*zoomgov\.com$/i,
  /^accounts\.google\.com$/i,
  /^login\.microsoftonline\.com$/i,
  /^login\.live\.com$/i,
  /^appleid\.apple\.com$/i,
  /^([a-z0-9-]+\.)*facebook\.com$/i,
];

/**
 * Checks if a bare hostname matches the allowlist.
 * @param {string} hostname - Bare hostname (e.g. "zoom.us", "accounts.google.com")
 * @returns {boolean}
 */
function isAllowedHostname(hostname) {
  if (typeof hostname !== 'string' || hostname.length === 0) return false;
  return ALLOWED_HOST_PATTERNS.some((pattern) => pattern.test(hostname));
}

/**
 * Checks if a full URL string is allowed (HTTPS + hostname in allowlist).
 * @param {string} urlString - Full URL (e.g. "https://zoom.us/wc/join/123")
 * @returns {boolean}
 */
function isAllowedUrl(urlString) {
  try {
    const { hostname, protocol } = new URL(urlString);
    if (protocol !== 'https:') return false;
    return isAllowedHostname(hostname);
  } catch {
    return false;
  }
}

module.exports = { isAllowedHostname, isAllowedUrl };