#!/usr/bin/env bash
# Prepares a fresh checkout or worktree: Node (.node-version) and the pnpm dependencies.
# Orca runs it from orca.yaml when it creates a worktree; it is also fine to run by hand,
# and to re-run. Kept to bash 3.2 so it works with macOS's /bin/bash.
set -euo pipefail

cd "$(dirname "$0")/.."

# Hooks may run without the login shell's PATH (e.g. Orca started from the macOS Dock),
# so also look where mise and Homebrew usually install.
PATH="$PATH:$HOME/.local/bin:/opt/homebrew/bin:/usr/local/bin"

have_mise=false
command -v mise >/dev/null 2>&1 && have_mise=true

# Use mise when it is available so Node matches .node-version (see mise.toml);
# otherwise use the node on PATH.
run() {
  if $have_mise; then
    mise exec -- "$@"
  else
    "$@"
  fi
}

trust_hint="If mise ignored mise.toml, trust it with \`mise trust\` and run this script again."
if $have_mise; then
  if ! mise install; then
    echo "error: mise install failed. $trust_hint" >&2
    exit 1
  fi
else
  echo "mise not found; using $(command -v node || echo 'no node') from PATH" >&2
fi

# Compare majors only, so .node-version may also hold e.g. "v26" or "26.1.0".
target=$(tr -d '[:space:]' < .node-version)
target_major=${target#v}
target_major=${target_major%%.*}
node_major=$(run node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo none)
if [ "$node_major" != "$target_major" ]; then
  # With mise, a mismatch means mise.toml was not applied, so stop. Without mise, the
  # Node on PATH may still work, so only warn.
  if $have_mise; then
    echo "error: Node $node_major is in use, but this repo targets Node $target_major (.node-version). $trust_hint" >&2
    exit 1
  fi
  echo "warning: using Node $node_major, but this repo targets Node $target_major (.node-version); install mise to match it." >&2
fi

# The exact pnpm version is packageManager in package.json. mise provides a pnpm that
# switches itself to it. Without mise, prefer corepack, which runs that exact version
# (without `corepack enable`, which would write into node's bin directory); Node 25+ no
# longer ships it, so fall back to a pnpm on PATH.
install_args=(install --frozen-lockfile --config.confirm-modules-purge=false)
if $have_mise; then
  run pnpm "${install_args[@]}"
elif command -v corepack >/dev/null 2>&1; then
  COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm "${install_args[@]}"
elif command -v pnpm >/dev/null 2>&1; then
  pnpm "${install_args[@]}"
else
  echo "error: no pnpm found. Install mise (https://mise.jdx.dev) or pnpm itself." >&2
  exit 1
fi
