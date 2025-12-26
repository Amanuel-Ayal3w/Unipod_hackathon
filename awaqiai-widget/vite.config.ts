import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react()
  ],
  define: {
    'process.env': {}
  },
  server: {
    open: true
  },
  css: {
    modules: {
      scopeBehaviour: 'local',
      generateScopedName: 'bw-[local]'
    }
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/init.ts'),
      name: 'BlueyeWidget',
      fileName: (format) => `blueyeai-widget.${format}.js`,
      formats: ['umd']
    },
    rollupOptions: {
      output: {
        name: 'BlueyeWidget',
        format: 'umd',
        sourcemap: true,
        compact: true,
        inlineDynamicImports: true
      }
    },
    cssCodeSplit: true,
    assetsInlineLimit: 0
  }
})
