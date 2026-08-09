'use strict';

const { app, BrowserWindow, session } = require('electron');
const { enforceSingleInstance } = require('./single-instance');
const windowManager = require('./window-manager');
const { setupPermissionHandlers, setupDisplayMediaHandler } = require('./permission-manager');
const { createTray } = require('./tray-manager');
const { createAppMenu } = require('./app-menu');

/**
 * Main process entry point.
 *
 * Why: this file ONLY orchestrates — it contains no business logic.
 * All window creation, security configuration and lifecycle management
 * must live in dedicated modules (window-manager, tray-manager, etc.).
 * This follows the pattern defined in GEMINI.md §3 (layered architecture)
 * and §12 (anti-pattern: business logic inside main/index.js).
 */

// ── Task 2.1: Chromium flags for Wayland/Ozone/PipeWire ──────────────────
// These MUST be set before app.whenReady() — Chromium reads them during early
// initialisation, before any window is created.
//
// - WebRTCPipeWireCapturer: enables screen capture via PipeWire (the core of
//   this project). On Wayland, this causes getDisplayMedia to route through
//   xdg-desktop-portal, triggering the system's native screen picker.
// - WaylandWindowDecorations: requests server-side decorations (CSD) when
//   running under a Wayland compositor that supports them.
// - ozone-platform-hint=auto: lets Chromium auto-detect Wayland vs X11.
//   Avoids forcing --ozone-platform=wayland, which would break on X11-only
//   distros. See GEMINI.md Task 2.1 for rationale.
app.commandLine.appendSwitch(
  'enable-features',
  'WebRTCPipeWireCapturer,WaylandWindowDecorations'
);
app.commandLine.appendSwitch('ozone-platform-hint', 'auto');

// ── Single Instance Lock (Task 1.4) ──────────────────────────────────────
// Must run before app.whenReady() — acquires the lock early.
const isFirstInstance = enforceSingleInstance();

if (!isFirstInstance) {
  // Another instance is already running — enforceSingleInstance() already
  // called app.quit(). Nothing else to do.
} else {
  // Initialise the isQuitting flag used by the tray/window close logic.
  // This flag is set to true by:
  //   - The tray "Quit" menu item
  //   - The File → Quit menu item
  //   - The 'before-quit' event
  // When true, the window-manager's close handler allows the window to
  // actually close (instead of hiding to tray).
  app.isQuitting = false;

  app.on('before-quit', () => {
    app.isQuitting = true;
  });

  app.whenReady().then(() => {
    // ── Task 2.2 + 2.3: Permission & media handlers ────────────────────
    // Must be set up before the window loads zoom.us/wc, so that media
    // permission requests from the Zoom Web Client are handled correctly
    // from the first frame.
    setupPermissionHandlers(session.defaultSession);
    setupDisplayMediaHandler(session.defaultSession);

    const mainWindow = windowManager.createMainWindow();

    // ── Task 3.1: System tray icon ─────────────────────────────────────
    createTray();

    // ── Task 3.4: Native application menu ──────────────────────────────
    createAppMenu(mainWindow);

    app.on('activate', () => {
      // macOS: recreate the window if the dock icon is clicked and no windows are open.
      if (BrowserWindow.getAllWindows().length === 0) {
        windowManager.createMainWindow();
      }
    });
  });

  app.on('window-all-closed', () => {
    // With tray enabled (Epic 3), we no longer quit when all windows close.
    // The app stays alive in the tray. Only app.quit() (from tray menu or
    // File → Quit) will terminate the process.
    // On macOS, this is the standard behaviour anyway.
    if (process.platform !== 'darwin' && app.isQuitting) {
      app.quit();
    }
  });
}
