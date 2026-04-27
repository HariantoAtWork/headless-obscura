#!/usr/bin/env node
/**
 * Start an Obscura CDP server for vacancy scraping experiments.
 *
 * Prerequisite: run `bun run obscura:install`, put Obscura on PATH, or set OBSCURA_BIN.
 * Usage:
 *   bun run scripts/obscura-server.mjs [--port 9222] [--no-stealth] [--workers 1]
 *
 * Any extra flags are passed through to `obscura serve`.
 */
import { spawn } from 'node:child_process'
import { findObscuraBinary, obscuraInstallHint } from './utils/obscuraBinary.mjs'

function parseArgs(argv) {
  const out = {
    port: process.env.OBSCURA_PORT || '9222',
    stealth: process.env.OBSCURA_STEALTH !== '0',
    workers: process.env.OBSCURA_WORKERS || '',
    extra: [],
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === '--port') {
      const value = argv[index + 1]
      if (!value) throw new Error('Missing value for --port')
      out.port = value
      index += 1
      continue
    }
    if (arg === '--no-stealth') {
      out.stealth = false
      continue
    }
    if (arg === '--workers') {
      const value = argv[index + 1]
      if (!value) throw new Error('Missing value for --workers')
      out.workers = value
      index += 1
      continue
    }
    out.extra.push(arg)
  }

  return out
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  const bin = findObscuraBinary()
  const serveArgs = ['serve', '--port', args.port]

  if (args.stealth) serveArgs.push('--stealth')
  if (args.workers) serveArgs.push('--workers', args.workers)
  serveArgs.push(...args.extra)

  console.log(`Starting Obscura: ${bin} ${serveArgs.join(' ')}`)
  const child = spawn(bin, serveArgs, {
    stdio: 'inherit',
    env: { ...process.env },
  })

  child.on('error', (err) => {
    console.error(`Could not start Obscura (${bin}).`)
    console.error(obscuraInstallHint())
    console.error(err)
    process.exit(1)
  })

  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal)
      return
    }
    process.exit(code ?? 0)
  })
}

main()
