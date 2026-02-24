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
      },
    },
  },
})
