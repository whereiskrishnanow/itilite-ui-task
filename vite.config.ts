import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// BASE_PATH lets the GitHub Pages build live under /itilite-ui-task/ while dev stays at /.
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [react()],
})
