'use strict';

/**
 * Application-wide constants.
 *
 * Why centralised: avoids magic strings scattered across modules.
 * Every URL, dimension or app name is referenced from this single source
 * of truth. See GEMINI.md §5 (Constants/Enum object pattern).
 */

/** @type {string} Main URL loaded inside the BrowserWindow. */
const ZOOM_WEB_CLIENT_URL = 'https://zoom.us/wc';

/** @type {string} Display name used in window title and tray tooltip. */
const APP_NAME = 'Zoom Linux Native';

/**
 * Default and minimum window dimensions.
 *
 * minWidth rationale (Task 2.6): the Zoom Web Client uses responsive
 * breakpoints that collapse the chat panel below ~1050px. Setting
 * minWidth to 1100 ensures the chat is always visible. Tested against
 * zoom.us/wc layout as of 2026-08-09. If Zoom changes their breakpoints,
 * this value may need adjustment.
 *
 * @type {{ width: number, height: number, minWidth: number, minHeight: number }}
 */
const DEFAULT_WINDOW_SIZE = {
  width: 1280,
  height: 800,
  minWidth: 1100,
  minHeight: 700,
};

module.exports = {
  ZOOM_WEB_CLIENT_URL,
  APP_NAME,
  DEFAULT_WINDOW_SIZE,
};
