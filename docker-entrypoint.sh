#!/bin/sh
set -e
# `obscura serve` binds CDP to 127.0.0.1 only; socat exposes it on 0.0.0.0 for Docker port mapping.
INTERNAL="${OBSCURA_INTERNAL_PORT:-9223}"
PUBLISH="${OBSCURA_PORT:-9222}"
bun run scripts/obscura-server.mjs --port "$INTERNAL" &
sleep 1
exec socat TCP-LISTEN:"$PUBLISH",fork,reuseaddr,bind=0.0.0.0 TCP:127.0.0.1:"$INTERNAL"
