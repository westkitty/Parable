#!/usr/bin/env bash
# Parable Godot hand-feel spike — launcher.
# Detects Godot 4.x on macOS and runs the spike directly (no editor needed).
# Usage:
#   ./run.sh            launch the game window
#   ./run.sh --dry-run  show which Godot would be used and the exact command
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

find_godot() {
  local candidates=(
    "$(command -v godot 2>/dev/null || true)"
    "/opt/homebrew/bin/godot"
    "/Applications/Godot.app/Contents/MacOS/Godot"
    "$HOME/Applications/Godot.app/Contents/MacOS/Godot"
  )
  for c in "${candidates[@]}"; do
    if [[ -n "$c" && -x "$c" ]]; then
      echo "$c"
      return 0
    fi
  done
  return 1
}

GODOT="$(find_godot)" || {
  echo "ERROR: Godot was not found on this Mac." >&2
  echo "" >&2
  echo "To install it (one command):" >&2
  echo "    brew install --cask godot" >&2
  echo "" >&2
  echo "Or download Godot 4.x from https://godotengine.org/download/macos/" >&2
  echo "and put Godot.app in /Applications. Then run ./run.sh again." >&2
  exit 1
}

VERSION="$("$GODOT" --version 2>/dev/null | head -1 || true)"
case "$VERSION" in
  4.*) : ;;
  *)
    echo "ERROR: Found Godot at $GODOT but it reports version '$VERSION'." >&2
    echo "This spike needs Godot 4.x. Install with: brew install --cask godot" >&2
    exit 1
    ;;
esac

if [[ "${1:-}" == "--dry-run" ]]; then
  echo "godot binary : $GODOT"
  echo "version      : $VERSION"
  echo "command      : $GODOT --path $SCRIPT_DIR"
  exit 0
fi

echo "Launching Parable hand-feel spike (Godot $VERSION)..."
echo "Quit with Cmd-Q. Diagnostics toggle: F3."
exec "$GODOT" --path "$SCRIPT_DIR"
