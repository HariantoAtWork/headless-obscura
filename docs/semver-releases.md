# SemVer releases (learn by shipping)

How **this** repo publishes to Docker Hub. Same ritual as the other `headless-*` images.

## Why SemVer exists

```text
MAJOR.MINOR.PATCH   →   e.g. 1.0.0
```

| Part | Bump when | Example |
| --- | --- | --- |
| **MAJOR** | Breaking for anyone already running the image | Change port / remove endpoint / rename required env |
| **MINOR** | New capability, old usage still works | Extra API that does not break old clients |
| **PATCH** | Fix or image-only tweak, same client contract | Entrypoint bugfix, dependency bump |

Think from the puller’s point of view. Spec: [semver.org](https://semver.org/).

## How *our* pipeline uses SemVer

You choose the version. GitHub Actions does **not**.

```text
git tag v1.0.1  ──push──►  Actions build  ──►  Docker Hub
                                              1.0.1
                                              1.0
                                              latest
```

| You create (git) | Hub gets |
| --- | --- |
| `v1.0.0` | `harianto/headless-obscura:1.0.0`, `:1.0`, `:latest` |

- Git tag has a leading **`v`**; Hub tags do **not**.
- Pushing `main` alone publishes **nothing**.
- This image publishes **`linux/amd64` only** (no arm64 Hub variant yet).
- Pin compose to `1.0.0` in production; treat `latest` as lab-only.

Workflow: [`.github/workflows/docker-publish.yml`](../.github/workflows/docker-publish.yml).

## Decide the next version

```bash
git fetch --tags
git tag -l 'v*' | sort -V | tail -5
git log v1.0.0..HEAD --oneline
```

| Since last tag you… | Next tag |
| --- | --- |
| Only fixed bugs / image internals | `v1.0.1` |
| Added compatible features | `v1.1.0` |
| Broke the contract | `v2.0.0` |
| Docs-only | **no tag** |

## Release checklist

```bash
git status
git fetch origin && git pull --ff-only origin main
NEXT=v1.0.1
git tag -a "$NEXT" -m "$NEXT"
git push origin "$NEXT"
docker pull harianto/headless-obscura:1.0.1
```

## Habits

- Tag a clean `main` commit; prefer `git tag -a`.
- Do not rewrite tags people already pulled — cut a new patch.
- Secrets: `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`.

## Sibling images

Same SemVer rules: `headless-oxider`, `headless-camoufox`, `headless-playwright`, `headless-tunnel`.

## Quick self-test

1. Crash fix only → `v1.0.1`
2. Compatible new feature → `v1.1.0`
3. Breaking API → `v2.0.0`
4. Docs-only → no tag
