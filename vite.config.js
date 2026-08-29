import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 3000,
    strictPort: true, // 3000 포트가 사용 중이면 다음 포트로 넘어가지 않고 종료
  },
})