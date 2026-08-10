'use strict';

/** @type {string} */
const ZOOM_WEB_CLIENT_URL = 'https://zoom.us/wc';

/** @type {string} */
const APP_NAME = 'Zoom Linux Native';

/** @type {{ width: number, height: number, minWidth: number, minHeight: number }} */
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
