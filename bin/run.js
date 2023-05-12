#!/usr/bin/env node
import { execFile } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const project = path.join(__dirname, '../tsconfig.json')
const dev = fs.existsSync(project) && process.env.DEBUG != 'false'

if (!process.env.NODE_OPTIONS?.includes('--loader ts-node/esm')) {
    await new Promise((resolve, reject) => {
        const res = execFile(
            process.argv[0],
            [...process.argv.slice(1)],
            {
                cwd: process.cwd(),
                env: { ...process.env, NODE_OPTIONS: `--loader ts-node/esm/transpile-only ${process.env.NODE_OPTIONS ?? ''}` },
                stdio: 'inherit',
            },
            (err, stdout, stderr) => {
                if (err) {
                    reject(process.exit(err.code))
                } else {
                    resolve({ stdout, stderr })
                }
            }
        )
        res.stdout.pipe(process.stdout)
        res.stderr.pipe(process.stderr)
    })
    process.exit(0)
}

const { run } = dev ? await import('../src/index.js') : await import('../dist/index.js')
await run().catch(console.error)
