# Zoom Linux Native

> An unofficial Electron shell around the Zoom Web Client, built as a resilience layer
> for the post-X11 era on Linux.

**Not affiliated with, endorsed by, or sponsored by Zoom Video Communications, Inc.**
This project loads the official `zoom.us/wc` web client inside a controlled desktop
window — it does not modify, reverse-engineer, or redistribute any of Zoom's
proprietary code.

---

## The problem this project exists to solve

Zoom's official Linux desktop client (built with Qt) has a long-standing, still
unresolved bug: it crashes when starting or stopping screen sharing on **Wayland +
PipeWire** sessions. The most common workaround the community has landed on is
forcing an X11/XWayland session instead of Wayland.

That workaround already has an expiration date, and for the largest Linux desktop
environment, the expiration already happened. **GNOME 50**, released March 18, 2026,
completely removed the X11 session backend from Mutter, GNOME Shell, and GDM. That's
not a future risk — it's already shipping in **Ubuntu 26.04 LTS** and
**Fedora Workstation 44**, both released in April 2026: there is no "GNOME on Xorg"
option left at the login screen on a clean install of either. The only escape hatch is
staying on an older LTS (Ubuntu 24.04 keeps GNOME-on-X11 until its 2029 end of life)
or switching to a different desktop environment entirely.

**KDE Plasma** is a few months behind but on the same track: the Plasma X11 session
will be removed starting with **Plasma 6.8**, expected around October 2026, with
residual support for the X11 session continuing only until "early 2027" according to
the KDE project. When X11 stops being available by default on a given desktop
environment, the fallback that currently keeps the native Zoom client usable on Linux
disappears with it.

This project exists so that access to Zoom on Linux doesn't depend on X11 sticking
around. Instead of relying on Zoom's native Qt integration with Wayland/PipeWire
(where the bug lives), it runs the Zoom Web Client inside Electron's Chromium engine,
which already has a mature, well-tested WebRTC + PipeWire screen-capture pipeline —
the same one every Chromium-based browser uses for any website that shares your
screen.

## Why not just open zoom.us/wc in a browser tab, then?

You can, and for many people that's a perfectly reasonable answer. This project adds
value on top of "just use the browser" in two ways:

1. **Desktop integration** a plain browser tab doesn't give you: a system tray icon,
   native notifications, a dedicated persistent window, and window management that
   behaves like an installed app instead of a tab you can accidentally close.
2. **Active mitigation of known Web Client UX regressions**, instead of shipping them
   as-is. The Zoom Web Client has real, documented gaps compared to the native
   client — most notably a chat panel that can collapse in narrow windows due to the
   page's responsive breakpoints, and intermittent screen-share viewing issues. This
   project's window sizing and error-handling layer specifically targets those
   regressions (see [Known limitations](#known-limitations-and-trade-offs) below) —
   it is not meant to be a naive 1:1 wrapper of the raw page.

## How it works, at a glance

```
┌─────────────────────────────┐
│   Main process (Node.js)    │  Owns window creation, tray, permissions,
│                              │  navigation guard, OS integration.
└──────────────┬───────────────┘
               │ contextBridge (single, typed channel)
┌──────────────▼───────────────┐
│      Preload script          │  Security boundary. Exposes a minimal,
│                              │  explicit API — never raw ipcRenderer.
└──────────────┬───────────────┘
               │
┌──────────────▼───────────────┐
│   Renderer (zoom.us/wc)      │  Official Zoom Web Client, untouched.
└─────────────────────────────┘
```

Screen sharing flows through the OS-native `xdg-desktop-portal`/PipeWire pipeline via
Electron's `setDisplayMediaRequestHandler({ useSystemPicker: true })`, rather than a
custom capture implementation — the same approach Discord, Slack, and other Electron
apps use for stable Wayland screen sharing.

Full conceptual walkthrough (display servers, compositors, WebRTC, Electron's process
model) lives in [`GUIA_CONCEITUAL.md`](./GUIA_CONCEITUAL.md). Architecture rules and
non-negotiable security constraints live in [`GEMINI.md`](./GEMINI.md). The build
roadmap lives in [`PLANO_DE_TASKS.md`](./PLANO_DE_TASKS.md).

## Getting started

### Prerequisites

- Node.js 18+ and npm
- Linux, with `xdg-desktop-portal` installed and a backend matching your desktop
  environment (`xdg-desktop-portal-gnome`, `xdg-desktop-portal-kde`, or
  `xdg-desktop-portal-wlr` for wlroots-based compositors like Sway). Without this,
  screen sharing under Wayland won't have a picker to hand off to.

### Run in development

```bash
npm install
npm start
```

If you're specifically testing Wayland behavior, you can force the Ozone platform
hint explicitly:

```bash
npm run start:wayland
```

### Build installers

```bash
npm run build:linux   # AppImage + .deb + .rpm
```

Artifacts land in `dist/`.

## Known limitations and trade-offs

This project is upfront about what it does *not* fix, because that honesty is part of
what makes it trustworthy as more than a demo:

| Capability | Native client (with X11 workaround) | This app |
|---|---|---|
| Screen share stability on Wayland | Unstable / crash-prone | Stable (Chromium's WebRTC + PipeWire pipeline) |
| Virtual backgrounds / Studio Effects | Supported | Not supported (Web Client limitation) |
| Chat panel visibility | Always visible | Visible, enforced via minimum window width |
| Screen-share viewing reliability | Generally reliable | Occasional known Web Client bugs; mitigated with error detection + one-click reload, not eliminated |
| Dependency on X11 being available | Required for the crash workaround | None |

*(This table is filled in with real, dated test results as the project matures — see
the `/testar-sessao-linux` workflow in `.agent/workflows/`. Treat placeholder rows as
provisional until backed by actual test logs.)*

## Contributing

This is currently a solo learning/portfolio project built with AI-agent assistance
(Google Antigravity). See `GEMINI.md` for the architecture contract and
`.agent/workflows/` for the repeatable workflows used during development. Issues and
PRs are welcome once the initial MVP epics in `PLANO_DE_TASKS.md` are complete.

## License

MIT — see [`LICENSE`](./LICENSE). This license covers this project's own code only;
it does not grant any rights to Zoom's trademarks, branding, or proprietary software.