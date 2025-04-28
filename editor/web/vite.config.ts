import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'

export default defineConfig({
  plugins: [
    react(),
    wasm(),
    topLevelAwait()
  ],
  server: {
    allowedHosts: [
      '5173-ozodimgba-turbogameedit-i10qbqxbj0a.ws-eu118.gitpod.io',
    ],
    watch: {
      ignored: ['!**/node_modules/**'],
    },
    hmr: {
      overlay: true,
    },
  },
})