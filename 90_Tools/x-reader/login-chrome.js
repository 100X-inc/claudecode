/**
 * X (Twitter) Login using system Chrome
 * Uses your existing Chrome installation (more trusted by X)
 * Usage: node login-chrome.js
 */

import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROFILE_DIR = path.join(__dirname, 'x-profile');

// Common Chrome paths on Windows
const CHROME_PATHS = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
];

function findChrome() {
  for (const p of CHROME_PATHS) {
    if (existsSync(p)) return p;
  }
  return null;
}

async function login() {
  const chromePath = findChrome();

  if (!chromePath) {
    console.error('Chrome not found. Install Chrome or use login.js instead.');
    process.exit(1);
  }

  console.log('Using Chrome at:', chromePath);
  console.log('Profile will be saved to:', PROFILE_DIR);

  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: chromePath,
    viewport: { width: 1280, height: 800 },
    locale: 'ja-JP',
    channel: 'chrome',
    args: [
      '--disable-blink-features=AutomationControlled',
    ],
    ignoreDefaultArgs: ['--enable-automation'],
  });

  const page = await context.newPage();
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  });

  await page.goto('https://x.com/login');

  console.log('\n=== Instructions ===');
  console.log('1. Log in to X in the browser window');
  console.log('2. After login completes, close the browser');
  console.log('3. Your session will be saved automatically');
  console.log('====================\n');

  await new Promise(resolve => {
    context.on('close', resolve);
  });

  console.log('Session saved! You can now use read-post.js');
}

login().catch(console.error);
