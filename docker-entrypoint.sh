#!/bin/sh
set -e
# Prefer Obscura's own --host when HOST / OBSCURA_HOST is set (e.g. 0.0.0.0).
# Otherwise Obscura binds 127.0.0.1 only; socat publishes CDP on 0.0.0.0 for Docker ports.
HOST="${HOST:-${OBSCURA_HOST:-}}"
PUBLISH="${OBSCURA_PORT:-9222}"

if [ -n "$HOST" ]; then
  exec bun run scripts/obscura-server.mjs --port "$PUBLISH" --host "$HOST"
fi

INTERNAL="${OBSCURA_INTERNAL_PORT:-9223}"
bun run scripts/obscura-server.mjs --port "$INTERNAL" &
sleep 1
exec socat TCP-LISTEN:"$PUBLISH",fork,reuseaddr,bind=0.0.0.0 TCP:127.0.0.1:"$INTERNAL"
