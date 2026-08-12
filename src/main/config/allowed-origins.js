'use strict';

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

function isAllowedHostname(hostname) {
  if (typeof hostname !== 'string' || hostname.length === 0) return false;
  return ALLOWED_HOST_PATTERNS.some((pattern) => pattern.test(hostname));
}

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