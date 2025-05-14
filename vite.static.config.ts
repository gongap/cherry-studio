import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';

export default defineConfig({
  root: 'src/renderer', // Set the root to your renderer directory
  plugins: [react()],
  resolve: {
    alias: {
      '@shared/IpcChannel': resolve(__dirname, 'src/renderer/src/mocks/IpcChannel.ts'), // Alias to the mock file
      '@renderer': resolve(__dirname, 'src/renderer/src'), // Alias for renderer source files
      '@shared': resolve(__dirname, 'packages/shared'), // General alias for shared files
      '@shared/config/nutstore': resolve(__dirname, 'packages/shared/config/nutstore.ts'), // Explicitly map nutstore config to its mock file
      // Add other aliases if needed, referring to your tsconfig.json paths
    },
  },
  build: {
    outDir: resolve(__dirname, 'out/static'), // Use resolve to clearly point to project root/out/static
    emptyOutDir: true, // 构建前清空输出目录
    target: 'esnext', // Set target to esnext to support top-level await
  },
}); 