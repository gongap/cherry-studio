import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';

export default defineConfig({
  root: 'src/renderer', // Set the root to your renderer directory
  plugins: [react()],
  resolve: {
    alias: {
      '@renderer': resolve(__dirname, 'src/renderer/src'), // Alias for renderer source files
      '@shared': resolve(__dirname, 'packages/shared'), // CORRECTED Alias for shared files
      '@shared/config/nutstore': resolve(__dirname, 'packages/shared/config/nutstore.ts'), // CORRECTED Explicitly map nutstore config to a mock file
      // Add other aliases if needed, referring to your tsconfig.json paths
    },
  },
  build: {
    outDir: resolve(__dirname, 'out/static'), // 使用 resolve 明确指向项目根目录下的 out/static
    emptyOutDir: true, // 构建前清空输出目录
    target: 'esnext', // Set target to esnext to support top-level await
  },
}); 