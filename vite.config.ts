import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
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
        scope: '/',
        start_url: '/',
        background_color: '#04AB6C',
        theme_color: '#04AB6C',
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: '/maskable-icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: '/index.html'
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
