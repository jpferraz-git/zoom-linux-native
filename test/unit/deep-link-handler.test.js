'use strict';

const { parseDeepLink, extractDeepLinkFromArgv } = require('../../src/main/deep-link-handler');

describe('deep-link-handler', () => {
  describe('parseDeepLink', () => {
    test('translates valid zoommtg:// with confno and pwd', () => {
      const result = parseDeepLink('zoommtg://zoom.us/join?confno=1234567890&pwd=abc123');
      expect(result).toBe('https://zoom.us/wc/join/1234567890?pwd=abc123');
    });

    test('translates valid zoommtg:// with confno only (no password)', () => {
      const result = parseDeepLink('zoommtg://zoom.us/join?confno=9876543210');
      expect(result).toBe('https://zoom.us/wc/join/9876543210');
    });

    test('translates with action=join parameter', () => {
      const result = parseDeepLink('zoommtg://zoom.us/join?action=join&confno=111222333&pwd=xyz');
      expect(result).toBe('https://zoom.us/wc/join/111222333?pwd=xyz');
    });

    test('returns null for missing confno', () => {
      expect(parseDeepLink('zoommtg://zoom.us/join?pwd=abc')).toBeNull();
    });

    test('returns null for non-zoommtg protocol', () => {
      expect(parseDeepLink('https://zoom.us/join?confno=123')).toBeNull();
    });

    test('returns null for empty string', () => {
      expect(parseDeepLink('')).toBeNull();
    });

    test('returns null for null', () => {
      expect(parseDeepLink(null)).toBeNull();
    });

    test('returns null for undefined', () => {
      expect(parseDeepLink(undefined)).toBeNull();
    });

    test('returns null for malformed URL', () => {
      expect(parseDeepLink('not-a-url-at-all')).toBeNull();
    });
  });

  describe('extractDeepLinkFromArgv', () => {
    test('extracts zoommtg:// URL from argv', () => {
      const argv = [
        '/usr/bin/electron',
        '.',
        'zoommtg://zoom.us/join?confno=123&pwd=abc',
      ];
      expect(extractDeepLinkFromArgv(argv)).toBe('zoommtg://zoom.us/join?confno=123&pwd=abc');
    });

    test('returns null when no zoommtg:// URL in argv', () => {
      const argv = ['/usr/bin/electron', '.'];
      expect(extractDeepLinkFromArgv(argv)).toBeNull();
    });

    test('returns null for empty argv', () => {
      expect(extractDeepLinkFromArgv([])).toBeNull();
    });

    test('returns null for null argv', () => {
      expect(extractDeepLinkFromArgv(null)).toBeNull();
    });

    test('returns first zoommtg:// if multiple present', () => {
      const argv = [
        'zoommtg://zoom.us/join?confno=111',
        'zoommtg://zoom.us/join?confno=222',
      ];
      expect(extractDeepLinkFromArgv(argv)).toBe('zoommtg://zoom.us/join?confno=111');
    });
  });
});
