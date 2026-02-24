import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: '.',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        pricing: resolve(__dirname, 'pricing.html'),
        'case-studies': resolve(__dirname, 'case-studies.html'),
        contact: resolve(__dirname, 'contact.html'),
        marketplace: resolve(__dirname, 'marketplace.html'),
        'build-app': resolve(__dirname, 'build-app.html'),
        'api-docs': resolve(__dirname, 'api-docs.html'),
      },
    },
  },
})
