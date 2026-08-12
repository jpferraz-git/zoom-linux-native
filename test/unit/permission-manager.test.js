'use strict';

// Mock electron before requiring the module
jest.mock('electron', () => ({}));

const { setupPermissionHandlers } = require('../../src/main/permission-manager');

describe('permission-manager', () => {
  let permissionRequestHandler;
  let permissionCheckHandler;

  beforeEach(() => {
    const mockSession = {
      setPermissionRequestHandler: jest.fn((handler) => {
        permissionRequestHandler = handler;
      }),
      setPermissionCheckHandler: jest.fn((handler) => {
        permissionCheckHandler = handler;
      }),
      setDisplayMediaRequestHandler: jest.fn(),
    };

    setupPermissionHandlers(mockSession);
  });

  describe('setPermissionRequestHandler', () => {
    test('approves media permission for zoom.us', () => {
      const callback = jest.fn();
      permissionRequestHandler(
        {}, // webContents (unused in handler)
        'media',
        callback,
        { requestingUrl: 'https://zoom.us/wc/join/123' }
      );

      expect(callback).toHaveBeenCalledWith(true);
    });

    test('approves notifications permission for zoom.us', () => {
      const callback = jest.fn();
      permissionRequestHandler(
        {},
        'notifications',
        callback,
        { requestingUrl: 'https://zoom.us/wc' }
      );

      expect(callback).toHaveBeenCalledWith(true);
    });

    test('approves media permission for subdomain of zoom.us', () => {
      const callback = jest.fn();
      permissionRequestHandler(
        {},
        'media',
        callback,
        { requestingUrl: 'https://us02web.zoom.us/wc/join/123' }
      );

      expect(callback).toHaveBeenCalledWith(true);
    });

    test('denies media permission for unknown origin', () => {
      const callback = jest.fn();
      permissionRequestHandler(
        {},
        'media',
        callback,
        { requestingUrl: 'https://evil.com/fake' }
      );

      expect(callback).toHaveBeenCalledWith(false);
    });

    test('denies media permission for non-https zoom origin', () => {
      const callback = jest.fn();
      permissionRequestHandler(
        {},
        'media',
        callback,
        { requestingUrl: 'http://zoom.us/wc/join/123' }
      );

      expect(callback).toHaveBeenCalledWith(false);
    });

    test('denies geolocation permission even for zoom.us', () => {
      const callback = jest.fn();
      permissionRequestHandler(
        {},
        'geolocation',
        callback,
        { requestingUrl: 'https://zoom.us/wc' }
      );

      expect(callback).toHaveBeenCalledWith(false);
    });

    test('denies for empty requestingUrl', () => {
      const callback = jest.fn();
      permissionRequestHandler(
        {},
        'media',
        callback,
        { requestingUrl: '' }
      );

      expect(callback).toHaveBeenCalledWith(false);
    });

    test('denies for malformed requestingUrl', () => {
      const callback = jest.fn();
      permissionRequestHandler(
        {},
        'media',
        callback,
        { requestingUrl: 'not-a-url' }
      );

      expect(callback).toHaveBeenCalledWith(false);
    });
  });

  describe('setPermissionCheckHandler', () => {
    test('returns true for media check from zoom.us', () => {
      const result = permissionCheckHandler(
        {},
        'media',
        'https://zoom.us'
      );

      expect(result).toBe(true);
    });

    test('returns false for media check from unknown origin', () => {
      const result = permissionCheckHandler(
        {},
        'media',
        'https://evil.com'
      );

      expect(result).toBe(false);
    });

    test('returns false for media check from non-https zoom origin', () => {
      const result = permissionCheckHandler(
        {},
        'media',
        'http://zoom.us'
      );

      expect(result).toBe(false);
    });

    test('returns false for non-media permission from zoom.us', () => {
      const result = permissionCheckHandler(
        {},
        'clipboard-read',
        'https://zoom.us'
      );

      expect(result).toBe(false);
    });
  });
});
