#!/usr/bin/env bash
# Parable Godot hand-feel spike — verifier.
# Headless checks only: detection, file presence, project sanity, import,
# script load + structural smoke test, contract checks, playability surrogate
# checks, runbook cross-check.
# It can NOT verify rendering or hand feel — that is Andrew's job via run.sh.
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"
FAILURES=0

fail() { echo "  FAIL: $1"; FAILURES=$((FAILURES + 1)); }
ok()   { echo "  ok:   $1"; }
section() { echo; echo "== $1 =="; }

section "1. Godot detection"
GODOT=""
for c in "$(command -v godot 2>/dev/null || true)" \
         /opt/homebrew/bin/godot \
         "/Applications/Godot.app/Contents/MacOS/Godot" \
         "$HOME/Applications/Godot.app/Contents/MacOS/Godot"; do
  if [[ -n "$c" && -x "$c" ]]; then GODOT="$c"; break; fi
done
if [[ -z "$GODOT" ]]; then
  fail "Godot not found. Install with: brew install --cask godot"
  echo; echo "VERIFY RESULT: $FAILURES failure(s) — cannot continue without Godot."
  exit 1
fi
VERSION="$("$GODOT" --version 2>/dev/null | head -1 || true)"
case "$VERSION" in
  4.*) ok "Godot $VERSION at $GODOT" ;;
  *)   fail "Godot at $GODOT reports '$VERSION' (need 4.x)"; exit 1 ;;
esac

section "2. File presence"
REQUIRED=(
  project.godot run.sh verify.sh README_FOR_ANDREW.md
  scenes/Main.tscn scenes/TempleInterior.tscn
  scenes/objects/Villager.tscn scenes/objects/Rock.tscn
  scenes/objects/Tree.tscn scenes/objects/Offering.tscn
  tests/verify_headless.gd tests/verify_contracts.gd tests/verify_playability_surrogates.gd
  scripts/world.gd scripts/island.gd scripts/hand_input.gd scripts/hand_visual.gd
  scripts/camera_rig.gd scripts/grabbable.gd scripts/villager_proxy.gd
  scripts/rock_proxy.gd scripts/tree_proxy.gd scripts/offering_proxy.gd
  scripts/throw_sampler.gd scripts/gesture_recognizer.gd scripts/gesture_trace.gd
  scripts/shrine.gd scripts/temple_door.gd scripts/temple_interior.gd
  scripts/god_identity.gd scripts/witness_director.gd scripts/diagnostics.gd
  scripts/symbol_forms.gd scripts/symbol_choice.gd scripts/miracle_fx.gd
)
for f in "${REQUIRED[@]}"; do
  if [[ -s "$f" ]]; then ok "$f"; else fail "missing or empty: $f"; fi
done

section "3. project.godot sanity"
grep -q 'run/main_scene="res://scenes/Main.tscn"' project.godot \
  && ok "main scene set" || fail "main scene not set to scenes/Main.tscn"
for action in grab_action pan_action interact_action camera_orbit camera_zoom_in camera_zoom_out gesture_mode cancel_action toggle_diagnostics; do
  grep -q "^${action}=" project.godot && ok "input action: $action" || fail "input action missing: $action"
done
grep -q 'GodIdentity=' project.godot && ok "GodIdentity autoload" || fail "GodIdentity autoload missing"

section "4. Headless import"
if "$GODOT" --headless --path . --import >/tmp/parable_import.log 2>&1; then
  ok "project imports cleanly"
else
  fail "headless import failed — tail of log:"
  tail -20 /tmp/parable_import.log
fi

section "5. Headless smoke test (loads every script, checks structure)"
if "$GODOT" --headless --path . --script res://tests/verify_headless.gd >/tmp/parable_smoke.log 2>&1; then
  ok "headless smoke test passed"
  grep -E "^(  ok|  FAIL|HEADLESS)" /tmp/parable_smoke.log | tail -8
else
  fail "headless smoke test FAILED — output:"
  cat /tmp/parable_smoke.log
fi

section "6. Contract verification"
if "$GODOT" --headless --path . --script res://tests/verify_contracts.gd >/tmp/parable_contracts.log 2>&1; then
  ok "contract verification passed"
  grep -E "^(  ok|  FAIL|CONTRACT)" /tmp/parable_contracts.log | tail -8
else
  fail "contract verification FAILED — output:"
  cat /tmp/parable_contracts.log
fi

section "7. Playability surrogate verification"
if "$GODOT" --headless --path . --script res://tests/verify_playability_surrogates.gd >/tmp/parable_surrogates.log 2>&1; then
  ok "playability surrogate verification passed"
  grep -E "^(  ok|  FAIL|PLAYABILITY)" /tmp/parable_surrogates.log | tail -10
else
  fail "playability surrogate verification FAILED — output:"
  cat /tmp/parable_surrogates.log
fi

section "8. Runbook cross-check"
for term in "./run.sh" "Right mouse button" "Left mouse button" "Middle mouse button" "Shift + left drag" "Option/Alt + left drag" "Q / E" "W / S" "R" "Esc" "F3" "Scroll wheel" "Space" "C" "H" "B" "Z" ; do
  grep -qi -- "$term" README_FOR_ANDREW.md && ok "runbook mentions: $term" || fail "runbook missing: $term"
done

echo
if [[ $FAILURES -eq 0 ]]; then
  echo "VERIFY RESULT: ALL CHECKS PASSED"
  echo "(Headless only. Run ./run.sh to actually see and feel the spike.)"
  exit 0
else
  echo "VERIFY RESULT: $FAILURES failure(s)"
  exit 1
fi
