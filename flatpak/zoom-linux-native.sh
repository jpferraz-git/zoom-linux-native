#!/bin/bash
# Shell wrapper for Flatpak — launches the Electron binary with
# the correct Chromium flags for Wayland screen sharing via PipeWire.

export TMPDIR="$XDG_RUNTIME_DIR/app/${FLATPAK_ID:-dev.joaopedroferraz.zoomlinuxnative}"
mkdir -p "$TMPDIR"

# Zypak is provided by the Electron BaseApp and wraps the Chromium
# sandbox to work inside Flatpak's own sandbox (bubblewrap).
exec zypak-wrapper /app/lib/zoom-linux-native/zoom-linux-native \
  --ozone-platform-hint=auto \
  --enable-features=WebRTCPipeWireCapturer,WaylandWindowDecorations \
  "$@"
