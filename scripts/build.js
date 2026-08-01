import { execSync } from 'child_process';
import { existsSync, mkdirSync, copyFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

console.log('🔨 Starting Slock build...');

try {
  // Ensure dist directories exist
  if (!existsSync(resolve(rootDir, 'dist/main'))) {
    mkdirSync(resolve(rootDir, 'dist/main'), { recursive: true });
  }
  if (!existsSync(resolve(rootDir, 'dist/renderer'))) {
    mkdirSync(resolve(rootDir, 'dist/renderer'), { recursive: true });
  }

  console.log('📦 Compiling Main Process TypeScript...');
  execSync('npx tsc -p tsconfig.main.json', { cwd: rootDir, stdio: 'inherit' });

  console.log('📋 Copying preload.cjs to dist/main...');
  copyFileSync(
    resolve(rootDir, 'src/main/preload.cjs'),
    resolve(rootDir, 'dist/main/preload.cjs')
  );

  console.log('🎨 Compiling Renderer with Vite...');
  execSync('npx vite build', { cwd: rootDir, stdio: 'inherit' });

  console.log('✅ Slock Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}
