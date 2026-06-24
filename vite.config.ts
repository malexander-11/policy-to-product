import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  // Production builds are served from the GitHub Pages project sub-path
  // (https://malexander-11.github.io/policy-to-product/); `npm run dev` stays at root.
  base: command === 'build' ? '/policy-to-product/' : '/',
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
}))
