import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    root: './',
    poolOptions: {
      threads: {
        maxThreads: 1, //PARALLEL_INSTANCES > 1 ? 1 : 10, // als er op meerdere instances word getest draai dan op 1 thread
        minThreads: 1, //PARALLEL_INSTANCES > 1 ? 1 : 10,
      },
    },
    pool: 'threads',
    testTimeout: 999_999_999,
    hookTimeout: 999_999_999,
    exclude: ['node_modules/**', 'dist/**', 'src/scripts/templates/**/*'],
  },
  plugins: [
    // This is required to build the test files with SWC
    swc.vite({
      // Explicitly set the module type to avoid inheriting this value from a `.swcrc` config file
      module: { type: 'es6' },
    }),
  ],
});