import { coverageConfigDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        globalSetup: ['./test/__test__/global.ts'],
        setupFiles: ['./test/__test__/setup.ts'],
        coverage: {
            exclude: ['**/*.schema.js', '**/*.schema.ts', '**/*.client.ts', '**/*.type.ts', ...coverageConfigDefaults.exclude],
            reportsDirectory: './.coverage',
        },
        fakeTimers: {
            now: new Date(2022, 1, 10).getTime(),
        },
        pool: 'threads',
    },
})
