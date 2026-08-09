'use strict';

const { app, BrowserWindow, session } = require('electron');
const { enforceSingleInstance } = require('./single-instance');
const windowManager = require('./window-manager');
const { setupPermissionHandlers, setupDisplayMediaHandler } = require('./permission-manager');

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
  app.whenReady().then(() => {
    // ── Task 2.2 + 2.3: Permission & media handlers ────────────────────
    // Must be set up before the window loads zoom.us/wc, so that media
    // permission requests from the Zoom Web Client are handled correctly
    // from the first frame.
    setupPermissionHandlers(session.defaultSession);
    setupDisplayMediaHandler(session.defaultSession);

    windowManager.createMainWindow();

    app.on('activate', () => {
      // macOS: recreate the window if the dock icon is clicked and no windows are open.
      if (BrowserWindow.getAllWindows().length === 0) {
        windowManager.createMainWindow();
      }
    });
  });

  app.on('window-all-closed', () => {
    // On Linux/Windows, quit the process when all windows are closed.
    // In Epic 3 (tray), this behaviour will change to minimize to tray instead.
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
}
