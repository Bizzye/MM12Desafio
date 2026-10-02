// Gera ícones (legado + adaptativo) e splash screens do app Android a partir do
// ícone "cube-outline" do Ionicons, com a paleta do projeto.
// Uso: node scripts/generate-android-assets.mjs  (requer `npx playwright install chromium`)
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { chromium } from '@playwright/test';

const RES = 'android/app/src/main/res';
const BACKGROUND = '#053742';
const ACCENT = '#2ecc71';

const glyph = readFileSync('node_modules/ionicons/dist/svg/cube-outline.svg', 'utf8').replace(
  '<svg ',
  `<svg style="color:${ACCENT};width:100%;height:100%" `,
);

/** Página com o glifo centralizado ocupando `scale` do lado menor. */
function html({ width, height, scale, background, radius = '0' }) {
  const size = Math.round(Math.min(width, height) * scale);
  return `<!doctype html><html><body style="margin:0">
    <div style="width:${width}px;height:${height}px;display:grid;place-items:center;background:${background};border-radius:${radius}">
      <div style="width:${size}px;height:${size}px">${glyph}</div>
    </div></body></html>`;
}

const LAUNCHER = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 };

const browser = await chromium.launch();
const page = await browser.newPage();

async function render(path, width, height, options) {
  await page.setViewportSize({ width, height });
  await page.setContent(html({ width, height, ...options }));
  await page.screenshot({ path, omitBackground: true });
}

for (const [density, size] of Object.entries(LAUNCHER)) {
  const dir = join(RES, `mipmap-${density}`);
  await render(join(dir, 'ic_launcher.png'), size, size, { scale: 0.6, background: BACKGROUND, radius: '22%' });
  await render(join(dir, 'ic_launcher_round.png'), size, size, { scale: 0.58, background: BACKGROUND, radius: '50%' });
  // Adaptativo: 108dp de tela, com zona segura de 66dp — o glifo fica dentro dela.
  const foreground = Math.round(size * 2.25);
  await render(join(dir, 'ic_launcher_foreground.png'), foreground, foreground, {
    scale: 0.4,
    background: 'transparent',
  });
}

for (const dir of readdirSync(RES).filter((name) => name.startsWith('drawable'))) {
  const file = join(RES, dir, 'splash.png');
  let png;
  try {
    png = readFileSync(file);
  } catch {
    continue;
  }
  const width = png.readUInt32BE(16);
  const height = png.readUInt32BE(20);
  await render(file, width, height, { scale: 0.28, background: BACKGROUND });
}

await browser.close();
console.log('Ícones e splash screens gerados em', RES);
