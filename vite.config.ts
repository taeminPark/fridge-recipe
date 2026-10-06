import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
  // 개발 컨테이너(WSL) 밖 브라우저에서 접속하고, 파일 변경을 확실히 감지하기 위해
  server: { host: true, port: 5173, watch: { usePolling: true } },
})
