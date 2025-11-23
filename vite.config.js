import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Sesuaikan path dasar untuk GitHub Pages
const repoName = '/migunesia-queue-fe/' // Ganti dengan nama repositori Anda!

// https://vitejs.dev/config/
export default defineConfig({
  base: repoName,
  plugins: [react()],
})