#!/usr/bin/env node
/**
 * Install Obscura locally for this project.
 *
 * Usage:
 *   bun run scripts/obscura-install.mjs
 *
 * The binary is written to `.tools/obscura/obscura`, which is intentionally
 * local tooling and should not be committed.
 */
import { chmod, mkdir, writeFile } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import { dirname } from 'node:path'
import { LOCAL_OBSCURA_BIN } from './utils/obscuraBinary.mjs'

const RELEASE_BASE_URL = 'https://github.com/h4ckf0r0day/obscura/releases/latest/download'

function releaseAssetName() {
  if (process.platform === 'darwin' && process.arch === 'arm64') {
    return 'obscura-aarch64-macos.tar.gz'
  }
  if (process.platform === 'darwin' && process.arch === 'x64') {
    return 'obscura-x86_64-macos.tar.gz'
  }
  if (process.platform === 'linux' && process.arch === 'x64') {
    return 'obscura-x86_64-linux.tar.gz'
  }

  throw new Error(`Unsupported Obscura install platform: ${process.platform}/${process.arch}`)
}

async function download(url) {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Download failed (${res.status}) from ${url}`)
  }
  return Buffer.from(await res.arrayBuffer())
}

async function main() {
  const asset = releaseAssetName()
  const url = `${RELEASE_BASE_URL}/${asset}`
  const installDir = dirname(LOCAL_OBSCURA_BIN)
  const archivePath = `${installDir}/${asset}`

  await mkdir(installDir, { recursive: true })
  console.log(`Downloading Obscura: ${url}`)
  await writeFile(archivePath, await download(url))

  const extracted = spawnSync('tar', ['-xzf', archivePath, '-C', installDir], {
    encoding: 'utf8',
  })
  if (extracted.status !== 0) {
    throw new Error(`Could not extract ${archivePath}.\n${extracted.stderr || extracted.stdout}`)
  }

  await chmod(LOCAL_OBSCURA_BIN, 0o755)
  console.log(`Installed Obscura: ${LOCAL_OBSCURA_BIN}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
