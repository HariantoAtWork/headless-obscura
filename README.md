# headless-obscura

Obscura headless browser in Docker. Hub image: [`harianto/headless-obscura`](https://hub.docker.com/r/harianto/headless-obscura) (**amd64**).

## Run

```bash
cp .env.example .env
./dc.sh build
docker compose up -d
```

## Publish (SemVer → Docker Hub)

Push a git tag such as `v1.0.1`. GitHub Actions builds and pushes Hub tags `1.0.1`, `1.0`, and `latest`.

Learn the habit: [docs/semver-releases.md](docs/semver-releases.md).
