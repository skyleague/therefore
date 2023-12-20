#!/usr/bin/env node
import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const project = path.join(__dirname, '../tsconfig.json')
const dev = fs.existsSync(project) && process.env.DEBUG != 'false'

if (dev && !process.env.NODE_OPTIONS?.includes('--import tsx/esm')) {
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

const { run } = dev ? await import('../src/index.ts') : await import('../.dist/index.js')
await run().catch(console.error)
