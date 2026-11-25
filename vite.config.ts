import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // L'app est publiée sur GitHub Pages dans le sous-dossier /MezTravel/
  base: '/MezTravel/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Le lecteur PDF doit aussi fonctionner sans internet.
      workbox: {
        globPatterns: ['**/*.{js,mjs,css,html,wasm,bcmap,ttf,pfb}'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
      },
      includeAssets: ['icons/apple-touch-icon.png', 'icons/favicon.png'],
      manifest: {
        name: 'MezTravel',
        short_name: 'MezTravel',
        description: 'Travel planner',
        theme_color: '#c8102e',
        background_color: '#c8102e',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
})
