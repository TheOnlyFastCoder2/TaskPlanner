import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const setPath = (dir:string) => {
  return path.resolve(__dirname,dir)
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react({
    babel: {
      parserOpts: {
        plugins: ['decorators-legacy', 'classProperties']
      }
    }
  })],
  resolve: {
    alias: {
      "@": setPath("./src"),
      "styles": setPath("./src/styles"),
      "pages": setPath("./src/pages"),
      "api": setPath("./src/api"),
    }
  }
})