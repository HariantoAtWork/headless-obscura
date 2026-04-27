# Obscura release builds are glibc-linked and need a recent glibc (e.g. __isoc23_* from 2.38+).
# Vanilla Alpine only provides musl; `gcompat` is not sufficient for this binary. We use Alpine with
# bundled glibc from frolvlad/alpine-glibc, then copy the musl-linked Bun binary from oven/bun:alpine.
#
# Obscura currently publishes linux x86_64 only — build with: docker build --platform linux/amd64 ...
FROM oven/bun:1-alpine AS bun

FROM frolvlad/alpine-glibc:alpine-3.22_glibc-2.42

RUN apk add --no-cache tar curl ca-certificates libstdc++ libgcc socat

COPY --from=bun /usr/local/bin/bun /usr/local/bin/bun
RUN ln -sf /usr/local/bin/bun /usr/local/bin/bunx

WORKDIR /app

COPY package.json ./
COPY scripts ./scripts

RUN bun run obscura:install

ENV PATH="/usr/local/bin:${PATH}"
ENV OBSCURA_PORT=9222
EXPOSE 9222

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]
