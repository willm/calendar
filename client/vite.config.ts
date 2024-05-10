/// <reference types="vitest" />
import {defineConfig} from 'vite';

export default defineConfig({
  test: {
    coverage: {
      thresholds: {
        autoUpdate: true,
        branches: 76.66,
        functions: 52,
        lines: 30.42,
        statements: 30.42,
      },
    },
  },
});
