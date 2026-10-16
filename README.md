# headless-obscura

[Obscura](https://github.com/h4ckf0r0day/obscura) stealth Chromium as a **Chrome DevTools Protocol (CDP)** server in Docker — not the REST `/fetch` twin used by Playwright/Oxider.

Docker Hub: [`harianto/headless-obscura`](https://hub.docker.com/r/harianto/headless-obscura) (**linux/amd64 only**) · host port **9222**.

Clients connect with Playwright, Puppeteer, or any CDP tool to `http://127.0.0.1:9222`.

## Use

### 1. Start (Hub image)

```bash
docker pull harianto/headless-obscura:1.0.0
cp .env.example .env
docker compose up -d
# CDP is up when the container is healthy / logs show obscura serve
curl -s http://127.0.0.1:9222/json/version | jq .
```

Compose sets `platform: linux/amd64`, `shm_size: 1gb`, and `HOST=0.0.0.0` so CDP is reachable from outside the container.

### 2. Or build locally

```bash
cp .env.example .env
./dc.sh build
docker compose up -d
```

### 3. Connect (Playwright)

```js
import { chromium } from 'playwright'

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222')
const context = browser.contexts()[0] ?? (await browser.newContext())
const page = context.pages()[0] ?? (await context.newPage())
await page.goto('https://example.com')
console.log(await page.title())
await browser.close()
```

Puppeteer-style: `puppeteer.connect({ browserURL: 'http://127.0.0.1:9222' })`.

Chrome UI: open `chrome://inspect` → configure `127.0.0.1:9222` (or use `/json/version` + DevTools frontend URL).

## Env

| Variable | Default | Meaning |
| --- | --- | --- |
| `DOCKERHUB_USERNAME` | `harianto` | Hub namespace for `image:` |
| `OBSCURA_HOST_PORT` | `9222` | Host port published by compose |
| `HOST` | `0.0.0.0` | Passed to `obscura serve --host` |
| `OBSCURA_PORT` | `9222` | Public CDP port in the container |
| `OBSCURA_INTERNAL_PORT` | `9223` | Used only when `HOST` is unset (socat path) |

Stealth is **on** by default in the entrypoint (`OBSCURA_STEALTH=0` or `--no-stealth` to disable when running the script directly).

## Publish

**GitHub → Docker Hub (SemVer):** `git tag v1.0.1 && git push origin v1.0.1` (amd64). Guide: [docs/semver-releases.md](docs/semver-releases.md).

Related ports: Camoufox **9377**, Playwright **9380**, Oxider **9381**, Tunnel **9382**.
