'use strict';

// Mock electron before requiring the module
jest.mock('electron', () => ({
  shell: {
    openExternal: jest.fn(),
  },
}));

const { shell } = require('electron');

// We need to test that the guard correctly uses isAllowedHostname
// Instead of testing the full BrowserWindow integration (which requires Electron),
// we test the navigation decision logic by simulating webContents events

describe('navigation-guard', () => {
  let attachNavigationGuards;
  let mockContents;
  let handlers;

  beforeEach(() => {
    jest.clearAllMocks();

    // Store event handlers when registered
    handlers = {};
    mockContents = {
      on: jest.fn((event, handler) => {
        handlers[event] = handler;
      }),
      setWindowOpenHandler: jest.fn((handler) => {
        handlers['window-open'] = handler;
      }),
      loadURL: jest.fn(),
    };

    const mockWin = {
      webContents: mockContents,
    };

    // Re-require to get fresh module
    jest.resetModules();
    jest.mock('electron', () => ({
      shell: { openExternal: jest.fn() },
    }));

    ({ attachNavigationGuards } = require('../../src/main/security/navigation-guard'));
    attachNavigationGuards(mockWin);
  });

  describe('will-navigate', () => {
    test('allows navigation to zoom.us', () => {
      const event = { preventDefault: jest.fn() };
      handlers['will-navigate'](event, 'https://zoom.us/wc/join/123');

      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    test('allows navigation to us02web.zoom.us', () => {
      const event = { preventDefault: jest.fn() };
      handlers['will-navigate'](event, 'https://us02web.zoom.us/wc/join/123');

      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    test('allows navigation to accounts.google.com (SSO)', () => {
      const event = { preventDefault: jest.fn() };
      handlers['will-navigate'](event, 'https://accounts.google.com/o/oauth2/auth');

      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    test('blocks navigation to unknown domain and opens externally', () => {
      const { shell: mockShell } = require('electron');
      const event = { preventDefault: jest.fn() };
      const url = 'https://evil.com/phishing';

      handlers['will-navigate'](event, url);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(mockShell.openExternal).toHaveBeenCalledWith(url);
    });

    test('blocks navigation for malformed URL', () => {
      const event = { preventDefault: jest.fn() };
      handlers['will-navigate'](event, 'not-a-url');

      expect(event.preventDefault).toHaveBeenCalled();
    });
  });

  describe('setWindowOpenHandler', () => {
    test('loads allowed domain in same window and denies popup', () => {
      const result = handlers['window-open']({ url: 'https://zoom.us/meeting' });

      expect(mockContents.loadURL).toHaveBeenCalledWith('https://zoom.us/meeting');
      expect(result).toEqual({ action: 'deny' });
    });

    test('opens external domain in system browser and denies popup', () => {
      const { shell: mockShell } = require('electron');
      const url = 'https://example.com/external';
      const result = handlers['window-open']({ url });

      expect(mockShell.openExternal).toHaveBeenCalledWith(url);
      expect(mockContents.loadURL).not.toHaveBeenCalled();
      expect(result).toEqual({ action: 'deny' });
    });

    test('always denies popup creation', () => {
      const result = handlers['window-open']({ url: 'https://zoom.us/something' });
      expect(result).toEqual({ action: 'deny' });
    });
  });
});
