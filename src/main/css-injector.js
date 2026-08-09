'use strict';

/**
 * Custom CSS rules injected into the Zoom Web Client page.
 *
 * Why: the Zoom Web Client's responsive layout has known UX regressions when
 * running inside a desktop wrapper (e.g. chat panel collapsing at certain
 * widths). This module injects a minimal local stylesheet to mitigate those
 * regressions — same approach as browser extensions like Dark Reader.
 *
 * Important legal/ethical note:
 * This is a **local presentation adjustment** running in the user's own
 * browser context. It does NOT modify, redistribute, or reverse-engineer
 * Zoom's code. If any future rule needs to touch page logic/behaviour
 * (not just CSS), stop and re-evaluate — that would cross the boundary
 * from "wrapper presentation fix" to "third-party code modification".
 *
 * Currently empty — serves as an extension point. Add rules below as
 * specific UX regressions are identified and tested.
 *
 * @type {string}
 */
const CUSTOM_CSS = `
/* ─── Zoom Linux Native — Local CSS Overrides ──────────────────────────
 *
 * Rules added here are injected via webContents.insertCSS() after the
 * Zoom Web Client finishes loading. Each rule must include a comment
 * explaining what regression it addresses and the date it was tested.
 *
 * Add rules only if Task 2.6 (minWidth) is insufficient to prevent
 * the issue. Keep rules minimal and presentation-only.
 * ──────────────────────────────────────────────────────────────────── */
`;

/**
 * Injects custom CSS into a webContents instance after the page loads.
 *
 * Should be called once per window, typically on the `did-finish-load` event.
 * If the CSS string is empty (no rules), the injection is a no-op — the
 * insertCSS call still succeeds but has no visual effect.
 *
 * @param {import('electron').WebContents} webContents
 * @returns {Promise<string>} The CSS key returned by Electron (can be used
 *   to remove the CSS later if needed).
 */
async function injectCSS(webContents) {
  return webContents.insertCSS(CUSTOM_CSS);
}

module.exports = { injectCSS };
