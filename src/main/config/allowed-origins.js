'use strict';

/** @type {string[]} Hostnames allowed to load inside the BrowserWindow. */
const ALLOWED_ORIGINS = [
  'zoom.us',
  'zoom.com',
];

/**
 * Checks whether a given hostname belongs to the allowlist.
 * @param {string} hostname
 * @returns {boolean}
 */
function isAllowedOrigin(hostname) {
  return ALLOWED_ORIGINS.some(
    (allowed) => hostname === allowed || hostname.endsWith(`.${allowed}`)
  );
}

module.exports = { ALLOWED_ORIGINS, isAllowedOrigin };
