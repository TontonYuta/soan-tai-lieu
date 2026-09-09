const fs = require('fs');
const path = require('path');
const os = require('os');
const { chromium } = require('playwright-core');

function getChromePath() {
  const home = os.homedir();
  const candidates = [
    path.join(home, '.cache', 'ms-playwright', 'chromium-1234', 'chrome-linux64', 'chrome'),
    path.join(home, '.cache', 'ms-playwright', 'chromium-1243', 'chrome-linux64', 'chrome'),
    path.join(home, '.local', 'bin', 'google-chrome'),
    path.join(home, '.local', 'bin', 'chrome'),
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium'
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  try {
    const pw = chromium.executablePath();
    if (pw && fs.existsSync(pw)) return pw;
  } catch {}
  return undefined;
}

async function main() {
  const rootDir = path.resolve(__dirname, '..');
  const svgPath = path.join(rootDir, 'icon.svg');
  if (!fs.existsSync(svgPath)) {
    console.error('icon.svg not found');
    process.exit(1);
  }

  const svgContent = fs.readFileSync(svgPath, 'utf-8');
  const buildDir = path.join(rootDir, 'build');
  const iconsDir = path.join(buildDir, 'icons');
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  const execPath = getChromePath();
  const browser = await chromium.launch({
    executablePath: execPath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage({
    viewport: { width: 512, height: 512 },
    deviceScaleFactor: 1
  });

  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            width: 512px;
            height: 512px;
            background: transparent;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          }
          svg {
            width: 512px;
            height: 512px;
            display: block;
          }
        </style>
      </head>
      <body>
        ${svgContent}
      </body>
    </html>
  `);

  const png512Path = path.join(iconsDir, '512x512.png');
  const iconPngPath = path.join(buildDir, 'icon.png');

  await page.screenshot({ path: png512Path, omitBackground: true });
  fs.copyFileSync(png512Path, iconPngPath);

  const sizes = [256, 128, 64, 48, 32, 16];
  for (const size of sizes) {
    const sizePage = await browser.newPage({
      viewport: { width: size, height: size },
      deviceScaleFactor: 1
    });
    await sizePage.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              width: ${size}px;
              height: ${size}px;
              background: transparent;
              display: flex;
              align-items: center;
              justify-content: center;
              overflow: hidden;
            }
            svg {
              width: ${size}px;
              height: ${size}px;
              display: block;
            }
          </style>
        </head>
        <body>
          ${svgContent}
        </body>
      </html>
    `);
    await sizePage.screenshot({
      path: path.join(iconsDir, `${size}x${size}.png`),
      omitBackground: true
    });
    await sizePage.close();
  }

  await browser.close();
  console.log('✅ Generated app icons in build/ and build/icons/');
}

main().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
