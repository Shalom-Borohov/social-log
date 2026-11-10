import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vitest/config'
import packageJson from './package.json' with { type: 'json' }

export default defineConfig(({ mode }) => ({
  base: '/social-log/',
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
    __APP_BUILT_AT__: JSON.stringify(new Date().toISOString()),
  },
  resolve: mode === 'test' ? { conditions: ['browser'] } : {},
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'מפגשים',
        short_name: 'מפגשים',
        lang: 'he',
        dir: 'rtl',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '.',
        scope: '.',
        theme_color: '#eef2f9',
        background_color: '#eef2f9',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['test/setup.ts'],
    include: ['test/**/*.test.{ts,tsx}'],
    server: {
      deps: { inline: ['@ionic/react', '@ionic/core', 'ionicons', '@stencil/react-output-target', '@lit/react'] },
    },
  },
}))
