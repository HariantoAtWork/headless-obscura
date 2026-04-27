import { accessSync, constants } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = join(__dirname, '..', '..')

/** Local install path used by `bun run obscura:install`. */
export const LOCAL_OBSCURA_BIN = join(PROJECT_ROOT, '.tools', 'obscura', 'obscura')

function isExecutable(path) {
  try {
    accessSync(path, constants.X_OK)
    return true
  } catch {
    return false
  }
}

export function obscuraInstallHint() {
  return [
    'Install Obscura: bun run obscura:install',
    'or set OBSCURA_BIN to the binary path',
    'or put `obscura` on PATH.',
  ].join(' ')
}

export function findObscuraBinary() {
  const fromEnv = process.env.OBSCURA_BIN
  if (fromEnv) {
    if (isExecutable(fromEnv)) return fromEnv
    throw new Error(`OBSCURA_BIN is set but not executable: ${fromEnv}`)
  }

  const which = spawnSync('which', ['obscura'], {
    encoding: 'utf8',
  })
  if (which.status === 0) {
    const p = which.stdout.trim().split('\n')[0]
    if (p && isExecutable(p)) return p
  }

  if (isExecutable(LOCAL_OBSCURA_BIN)) return LOCAL_OBSCURA_BIN

  throw new Error(`Obscura binary not found. ${obscuraInstallHint()}`)
}
