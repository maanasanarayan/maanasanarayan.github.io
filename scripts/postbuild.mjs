import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const wranglerPath = join(process.cwd(), 'dist/client/wrangler.json');
try {
  const content = JSON.parse(readFileSync(wranglerPath, 'utf-8'));
  content.main = '_worker.js';
  content.assets = {
    directory: '.',
    binding: 'ASSETS',
    run_worker_first: ['/*'],
  };
  writeFileSync(wranglerPath, JSON.stringify(content, null, 2));
  console.log(
    '✓ Successfully patched dist/client/wrangler.json with _worker.js and run_worker_first',
  );
} catch (err) {
  console.warn('Could not patch dist/client/wrangler.json:', err.message);
}
