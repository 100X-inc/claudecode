/**
 * X (Twitter) Login Script
 * Run this once to log in and save your session.
 * Usage: node login.js
 */

import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROFILE_DIR = path.join(__dirname, 'x-profile');

async function login() {
  console.log('Opening browser for X login...');
  console.log('Profile will be saved to:', PROFILE_DIR);

  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    viewport: { width: 1280, height: 800 },
    locale: 'ja-JP',
    // Anti-detection settings
    args: [
      '--disable-blink-features=AutomationControlled',
      '--disable-features=IsolateOrigins,site-per-process',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
    ],
    ignoreDefaultArgs: ['--enable-automation'],
    // Realistic user agent
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  });

  // Remove webdriver property
  const page = await context.newPage();
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    // Override permissions
    const originalQuery = window.navigator.permissions.query;
    window.navigator.permissions.query = (parameters) =>
      parameters.name === 'notifications'
        ? Promise.resolve({ state: Notification.permission })
        : originalQuery(parameters);
  });

  await page.goto('https://x.com/login');

  console.log('\n=== Instructions ===');
  console.log('1. Log in to X in the browser window');
  console.log('2. After login completes, close the browser');
  console.log('3. Your session will be saved automatically');
  console.log('====================\n');

  // Wait for browser to close
  await new Promise(resolve => {
    context.on('close', resolve);
  });

  console.log('Session saved! You can now use read-post.js');
}

login().catch(console.error);
