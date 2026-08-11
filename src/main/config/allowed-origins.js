const ALLOWED_HOST_PATTERNS = [
  /^([a-z0-9-]+\.)*zoom\.us$/i,
  /^([a-z0-9-]+\.)*zoomgov\.com$/i,
];

function isAllowedOrigin(urlString) {
  try {
    const { hostname, protocol } = new URL(urlString);
    if (protocol !== 'https:') return false;
    return ALLOWED_HOST_PATTERNS.some((pattern) => pattern.test(hostname));
  } catch {
    return false;
  }
}

module.exports = { isAllowedOrigin };