import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import svgr from "vite-plugin-svgr";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), svgr({
    svgrOptions: { exportType: 'named', ref: true, svgo: false, titleProp: true },
    include: '**/*.svg',
  }),],
  server: {
    host: "127.0.0.1",
    port: 4173,
  },
  optimizeDeps: {
    include: [
      'socket.io-client',
    ],
  },
})
