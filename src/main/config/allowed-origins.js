'use strict';

/**
 * Central allowlist of domains that may be navigated to inside the app.
 *
 * Why a single source: GEMINI.md §2 rule 4 mandates that navigation is
 * controlled by a central allowlist. Duplicating domain checks across
 * files is an explicit anti-pattern (§12). Every navigation guard and
 * window-open handler references this list, never a hardcoded string.
 *
 * Only Zoom-owned domains belong here. OAuth/SSO domains (Google,
 * Microsoft) may be added in Epic 5 if SSO login inside the app is
 * needed — but that decision must be documented here first.
 */

/** @type {string[]} Hostnames allowed to load inside the BrowserWindow. */
const ALLOWED_ORIGINS = [
  'zoom.us',
  'zoom.com',
];

/**
 * Checks whether a given hostname belongs to the allowlist.
 *
 * Matches the exact domain or any subdomain (e.g. `us04web.zoom.us`).
 *
 * @param {string} hostname — the hostname portion of a URL (e.g. `zoom.us`).
 * @returns {boolean} `true` if the hostname is allowed inside the app.
 */
function isAllowedOrigin(hostname) {
  return ALLOWED_ORIGINS.some(
    (allowed) => hostname === allowed || hostname.endsWith(`.${allowed}`)
  );
}

module.exports = { ALLOWED_ORIGINS, isAllowedOrigin };
