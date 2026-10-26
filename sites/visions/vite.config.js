import { rmSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const projectRoot = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'exclude-unpublished-intake',
      apply: 'build',
      closeBundle() {
        // GitHub retains the source files; public/intake is staging only.
        rmSync(path.join(projectRoot, 'dist', 'intake'), { recursive: true, force: true })
      },
    },
  ],
})
