/**
 * Captures marketing screenshots from local studio HTML (Bella Kitchen demo UIs).
 *
 * Usage:
 *   npm run capture:screenshots --workspace=@ordella/marketing
 *
 * Optional: set CAPTURE_LIVE=1 and configure apps/marketing/screenshots.capture.json
 * to capture from running product apps instead of studio HTML.
 */

import { mkdir } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const studioDir = path.join(__dirname, 'screenshot-studio');
const outDir = path.join(root, 'public', 'screenshots');

const STUDIO_SHOTS = [
  { id: 'admin-dashboard', file: 'admin-dashboard.html', width: 1200, height: 750 },
  { id: 'admin-products', file: 'admin-products.html', width: 1200, height: 750 },
  { id: 'admin-branding', file: 'admin-branding.html', width: 1200, height: 750 },
  { id: 'admin-billing', file: 'admin-billing.html', width: 1200, height: 750 },
  { id: 'pos-orders', file: 'pos-orders.html', width: 1200, height: 750 },
  { id: 'kds-kitchen', file: 'kds-kitchen.html', width: 1200, height: 750 },
  { id: 'architecture-overview', file: 'architecture-overview.html', width: 1200, height: 750 },
  { id: 'storefront-menu', file: 'storefront-menu.html', width: 390, height: 780 },
  { id: 'driver-delivery', file: 'driver-delivery.html', width: 390, height: 780 },
  { id: 'customer-orders', file: 'customer-orders.html', width: 390, height: 780 },
];

async function captureStudio(playwright) {
  const { chromium } = playwright;
  await mkdir(outDir, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 2 });

  for (const shot of STUDIO_SHOTS) {
    const filePath = path.join(studioDir, shot.file);
    const url = `file:///${filePath.replace(/\\/g, '/')}`;
    await page.setViewportSize({ width: shot.width, height: shot.height });
    await page.goto(url, { waitUntil: 'networkidle' });
    const outPath = path.join(outDir, `${shot.id}.png`);
    await page.locator('body > div').first().screenshot({ path: outPath, type: 'png' });
    await sharp(outPath)
      .png({ compressionLevel: 9, palette: true })
      .toFile(outPath + '.opt');
    const { rename } = await import('fs/promises');
    await rename(outPath + '.opt', outPath);
    console.log(`✓ ${shot.id}.png`);
  }

  await browser.close();
}

async function main() {
  let playwright;
  try {
    playwright = await import('playwright');
  } catch {
    console.error(
      'Playwright is required. Install with:\n  npm install -D playwright --workspace=@ordella/marketing\n  npx playwright install chromium',
    );
    process.exit(1);
  }

  if (process.env.CAPTURE_LIVE === '1') {
    console.warn('CAPTURE_LIVE is not configured yet; using screenshot studio HTML.');
  }

  await captureStudio(playwright);
  console.log(`\nScreenshots saved to ${outDir}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
