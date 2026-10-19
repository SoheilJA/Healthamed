import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from 'node:path'

const base = '/Healthamed/'

// https://vitejs.dev/config/
export default defineConfig({
  // GitHub Pages serves the site from /<repo-name>/ — absolute paths break there
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon.svg'],
      manifest: {
        name: 'هلثامد | سلامت دیجیتال',
        short_name: 'هلثامد',
        description: 'پلتفرم سلامت دیجیتال هلثامد - مشاوره پزشکی، نسخه الکترونیک و کارت اضطراری آفلاین',
        dir: 'rtl',
        lang: 'fa',
        display: 'standalone',
        orientation: 'portrait',
        scope: base,
        start_url: base,
        background_color: '#04AB6C',
        theme_color: '#04AB6C',
        icons: [
          { src: `${base}pwa-192x192.png`, sizes: '192x192', type: 'image/png' },
          { src: `${base}pwa-512x512.png`, sizes: '512x512', type: 'image/png' },
          { src: `${base}maskable-icon-512.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: `${base}index.html`
      }
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 5173,
    host: true
  },
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 1200
  }
})
