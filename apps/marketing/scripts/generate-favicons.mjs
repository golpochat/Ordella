/**
 * Generates marketing favicon assets from the Ordella logo mark.
 * Run: node scripts/generate-favicons.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import toIco from 'to-ico';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

const BRAND = '#3A6DFF';
const DARK_BG = '#0F1A2A';

function markSvg({ background = 'none', size = 32 }) {
  const bg =
    background === 'none'
      ? ''
      : `<rect width="${size}" height="${size}" rx="${Math.round(size * 0.25)}" fill="${background}"/>`;
  const scale = size / 32;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  ${bg}
  <g transform="scale(${scale})">
    <rect width="32" height="32" rx="8" fill="${BRAND}"/>
    <path d="M16 7.5c-3.59 0-6.5 2.91-6.5 6.5 0 2.49 1.4 4.65 3.46 5.73V22.5h6.08v-2.77c2.06-1.08 3.46-3.24 3.46-5.73 0-3.59-2.91-6.5-6.5-6.5zm0 10.25a3.75 3.75 0 1 1 0-7.5 3.75 3.75 0 0 1 0 7.5z" fill="#FFFFFF"/>
  </g>
</svg>`;
}

function maskableSvg(size = 512) {
  const pad = Math.round(size * 0.1);
  const inner = size - pad * 2;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${BRAND}"/>
  <g transform="translate(${pad}, ${pad}) scale(${inner / 32})">
    <rect width="32" height="32" rx="8" fill="#FFFFFF" fill-opacity="0.15"/>
    <path d="M16 7.5c-3.59 0-6.5 2.91-6.5 6.5 0 2.49 1.4 4.65 3.46 5.73V22.5h6.08v-2.77c2.06-1.08 3.46-3.24 3.46-5.73 0-3.59-2.91-6.5-6.5-6.5zm0 10.25a3.75 3.75 0 1 1 0-7.5 3.75 3.75 0 0 1 0 7.5z" fill="#FFFFFF"/>
  </g>
</svg>`;
}

async function pngFromSvg(svg, size, outPath) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(outPath);
}

async function main() {
  await mkdir(publicDir, { recursive: true });

  const light16 = markSvg({ size: 16 });
  const light32 = markSvg({ size: 32 });
  const dark16 = markSvg({ size: 16, background: DARK_BG });
  const dark32 = markSvg({ size: 32, background: DARK_BG });

  await pngFromSvg(light16, 16, join(publicDir, 'favicon-16x16.png'));
  await pngFromSvg(light32, 32, join(publicDir, 'favicon-32x32.png'));
  await pngFromSvg(dark16, 16, join(publicDir, 'favicon-16x16-dark.png'));
  await pngFromSvg(dark32, 32, join(publicDir, 'favicon-32x32-dark.png'));

  await pngFromSvg(markSvg({ size: 180 }), 180, join(publicDir, 'apple-touch-icon.png'));
  await pngFromSvg(markSvg({ size: 192 }), 192, join(publicDir, 'android-chrome-192x192.png'));
  await pngFromSvg(markSvg({ size: 512 }), 512, join(publicDir, 'android-chrome-512x512.png'));
  await pngFromSvg(maskableSvg(512), 512, join(publicDir, 'icon-maskable-512x512.png'));

  const ico16 = await sharp(Buffer.from(light16)).resize(16, 16).png().toBuffer();
  const ico32 = await sharp(Buffer.from(light32)).resize(32, 32).png().toBuffer();
  await writeFile(join(publicDir, 'favicon.ico'), await toIco([ico16, ico32]));

  const pinnedTab = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <path fill="${BRAND}" d="M4 4h24a4 4 0 0 1 4 4v24a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4zm12 3.5c-3.59 0-6.5 2.91-6.5 6.5 0 2.49 1.4 4.65 3.46 5.73V22.5h6.08v-2.77c2.06-1.08 3.46-3.24 3.46-5.73 0-3.59-2.91-6.5-6.5-6.5zm0 10.25a3.75 3.75 0 1 1 0-7.5 3.75 3.75 0 0 1 0 7.5z"/>
</svg>`;
  await writeFile(join(publicDir, 'safari-pinned-tab.svg'), pinnedTab);

  const faviconSvg = markSvg({ size: 32 });
  await writeFile(join(publicDir, 'favicon.svg'), faviconSvg);

  console.log('Favicon assets written to apps/marketing/public/');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
