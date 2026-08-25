'use strict';

/** URL do Zoom Web Client carregada como página principal da BrowserWindow. */
const ZOOM_WEB_CLIENT_URL = 'https://zoom.us/wc';

/** Nome exibido na barra de título, tray e diálogos do app. */
const APP_NAME = 'Zoom Linux Native';

/**
 * Dimensões padrão e mínimas da janela principal.
 *
 * minWidth: 1100 garante que o painel de chat do Zoom Web Client não colapse
 * (breakpoint responsivo da página). Ver ARCHITECTURE.md §"Why minWidth: 1100".
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

