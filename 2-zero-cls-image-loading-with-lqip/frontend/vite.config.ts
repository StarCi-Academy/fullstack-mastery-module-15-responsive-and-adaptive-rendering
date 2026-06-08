import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: Number(process.env.FE_PORT ?? "3500"),
    host: "127.0.0.1",
  },
  preview: {
    port: Number(process.env.FE_PORT ?? "3500"),
    host: "127.0.0.1",
  },
})
