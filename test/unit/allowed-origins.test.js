'use strict';

const { isAllowedHostname, isAllowedUrl } = require('../../src/main/config/allowed-origins');

describe('allowed-origins', () => {
  describe('isAllowedHostname', () => {
    test('accepts zoom.us', () => {
      expect(isAllowedHostname('zoom.us')).toBe(true);
    });

    test('accepts subdomain of zoom.us', () => {
      expect(isAllowedHostname('us02web.zoom.us')).toBe(true);
    });

    test('accepts zoom.com', () => {
      expect(isAllowedHostname('zoom.com')).toBe(true);
    });

    test('accepts zoomgov.com', () => {
      expect(isAllowedHostname('zoomgov.com')).toBe(true);
    });

    test('accepts accounts.google.com (OAuth SSO)', () => {
      expect(isAllowedHostname('accounts.google.com')).toBe(true);
    });

    test('accepts login.microsoftonline.com (OAuth SSO)', () => {
      expect(isAllowedHostname('login.microsoftonline.com')).toBe(true);
    });

    test('accepts login.live.com (OAuth SSO)', () => {
      expect(isAllowedHostname('login.live.com')).toBe(true);
    });

    test('accepts appleid.apple.com (OAuth SSO)', () => {
      expect(isAllowedHostname('appleid.apple.com')).toBe(true);
    });

    test('accepts facebook.com (OAuth SSO)', () => {
      expect(isAllowedHostname('facebook.com')).toBe(true);
    });

    test('accepts subdomain of facebook.com', () => {
      expect(isAllowedHostname('www.facebook.com')).toBe(true);
    });

    test('rejects random domain', () => {
      expect(isAllowedHostname('evil.com')).toBe(false);
    });

    test('rejects domain containing zoom but not matching', () => {
      expect(isAllowedHostname('notzoom.us.evil.com')).toBe(false);
    });

    test('rejects fakezoom.us', () => {
      expect(isAllowedHostname('fakezoom.us')).toBe(false);
    });

    test('rejects empty string', () => {
      expect(isAllowedHostname('')).toBe(false);
    });

    test('rejects null', () => {
      expect(isAllowedHostname(null)).toBe(false);
    });

    test('rejects undefined', () => {
      expect(isAllowedHostname(undefined)).toBe(false);
    });

    test('rejects number', () => {
      expect(isAllowedHostname(42)).toBe(false);
    });
  });

  describe('isAllowedUrl', () => {
    test('accepts https://zoom.us/wc', () => {
      expect(isAllowedUrl('https://zoom.us/wc')).toBe(true);
    });

    test('accepts https://us02web.zoom.us/wc/join/123', () => {
      expect(isAllowedUrl('https://us02web.zoom.us/wc/join/123')).toBe(true);
    });

    test('rejects http:// (non-HTTPS)', () => {
      expect(isAllowedUrl('http://zoom.us/wc')).toBe(false);
    });

    test('rejects non-allowed domain with HTTPS', () => {
      expect(isAllowedUrl('https://evil.com/fake')).toBe(false);
    });

    test('rejects malformed URL', () => {
      expect(isAllowedUrl('not-a-url')).toBe(false);
    });

    test('rejects empty string', () => {
      expect(isAllowedUrl('')).toBe(false);
    });
  });
});
