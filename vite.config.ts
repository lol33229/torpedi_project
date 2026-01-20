import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5182',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''), // Убираем /api, так как эндпоинты идут без префикса
      },
      // Прокси для прямых путей (если нужно)
      '^/(register|login|user|catalog|hourlyByTactTime|hourlyByPower|hourlySeveral|lessThanPerHour|downtime|manage)': {
        target: 'http://localhost:5182',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'], // кешируем всё важное
      },
      manifest: {
        name: 'Система учета производства',
        short_name: 'ПромУчет',
        description: 'Приложение для управления производственными показателями',
        theme_color: '#2C2C2C',
        background_color: '#ffffff',
        display: 'standalone', // открывается как отдельное приложение без рамок браузера
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
})