#!/usr/bin/env node
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const project = path.join(__dirname, '../tsconfig.json')
const dev = fs.existsSync(project) && process.env.DEBUG !== 'false'

/**
 * In contrast to most of the SkyLeague packages, we always need to hook in tsx for Therefore.
 * The reason for this, is that it dynamically loads *.schema.ts files from the project it runs in.
 */
if (!process.env.NODE_OPTIONS?.includes('--import tsx/esm')) {
    await new Promise((resolve, reject) => {
        const subprocess = spawn(process.argv[0], [...process.argv.slice(1)], {
            cwd: process.cwd(),
            env: { ...process.env, NODE_OPTIONS: `--import tsx/esm --enable-source-maps ${process.env.NODE_OPTIONS ?? ''}` },
            stdio: 'inherit',
        })

        subprocess.on('exit', (code) => {
            if (code === 0) {
                resolve()
            } else {
                reject(process.exit(code))
            }
        })

        subprocess.on('error', (err) => {
            reject(err)
        })
    })
    process.exit(0)
}

const { run } = dev ? await import('../src/cli.ts') : await import('../.dist/src/cli.js')
await run().catch(console.error)
