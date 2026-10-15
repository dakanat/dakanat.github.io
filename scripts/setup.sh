#!/usr/bin/env bash
# Prepares a fresh checkout or worktree: Node 22 (mise.toml) and the pnpm dependencies.
# Orca runs it from orca.yaml when it creates a worktree; it is also fine to run by hand,
# and to re-run. Kept to bash 3.2 so it works with macOS's /bin/bash.
set -euo pipefail

cd "$(dirname "$0")/.."

# Hooks may run without the login shell's PATH (e.g. Orca started from the macOS Dock),
# so also look where mise and Homebrew usually install.
PATH="$PATH:$HOME/.local/bin:/opt/homebrew/bin:/usr/local/bin"

# Use mise when it is available so Node matches mise.toml; otherwise use the node on PATH.
run() {
  if command -v mise >/dev/null 2>&1; then
    mise exec -- "$@"
  else
    "$@"
  fi
}

if command -v mise >/dev/null 2>&1; then
  mise install
else
  echo "mise not found; using $(command -v node || echo 'no node') from PATH" >&2
fi

node_major=$(run node -p 'process.versions.node.split(".")[0]')
if [ "$node_major" != 22 ]; then
  echo "warning: using Node $node_major, but this repo targets Node 22 (mise.toml)" >&2
fi

# corepack runs the pnpm version pinned in package.json without `corepack enable`, which
# would write into node's bin directory. Node 25+ no longer ships corepack, so fall back to
# a pnpm on PATH.
export COREPACK_ENABLE_DOWNLOAD_PROMPT=0
if run corepack --version >/dev/null 2>&1; then
  run corepack pnpm install --frozen-lockfile --config.confirm-modules-purge=false
else
  run pnpm install --frozen-lockfile --config.confirm-modules-purge=false
fi
