/**
 * X Reader - Core Library
 * Shared logic for reading X posts with persistent profile
 */

import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import os from 'os';

// Fixed profile directory in user home
export const PROFILE_DIR = path.join(os.homedir(), '.x-reader-profile');

// Common Chrome paths on Windows
const CHROME_PATHS = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
];

export function findChrome() {
  for (const p of CHROME_PATHS) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

export function hasProfile() {
  return fs.existsSync(PROFILE_DIR);
}

export async function readPost(url) {
  if (!hasProfile()) {
    throw new Error('No saved profile found. Run "x-login" first to log in.');
  }

  const chromePath = findChrome();
  const launchOptions = {
    headless: true,
    viewport: { width: 1280, height: 800 },
    locale: 'ja-JP',
    args: ['--disable-blink-features=AutomationControlled'],
    ignoreDefaultArgs: ['--enable-automation'],
  };

  if (chromePath) {
    launchOptions.executablePath = chromePath;
    launchOptions.channel = 'chrome';
  }

  const context = await chromium.launchPersistentContext(PROFILE_DIR, launchOptions);

  try {
    const page = await context.newPage();
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    });

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('article [data-testid="tweetText"]', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);

    const postData = await page.evaluate(() => {
      const result = {
        author: null,
        handle: null,
        content: null,
        timestamp: null,
        stats: {},
      };

      const authorEl = document.querySelector('article [data-testid="User-Name"] a span');
      if (authorEl) result.author = authorEl.textContent;

      const handleEl = document.querySelector('article [data-testid="User-Name"] a[href^="/"]');
      if (handleEl) {
        const href = handleEl.getAttribute('href');
        if (href) result.handle = '@' + href.replace('/', '');
      }

      const tweetTextEl = document.querySelector('article [data-testid="tweetText"]');
      if (tweetTextEl) result.content = tweetTextEl.textContent;

      const timeEl = document.querySelector('article time');
      if (timeEl) result.timestamp = timeEl.getAttribute('datetime');

      const statsGroup = document.querySelector('article [role="group"]');
      if (statsGroup) {
        const buttons = statsGroup.querySelectorAll('button');
        buttons.forEach(btn => {
          const label = btn.getAttribute('aria-label') || '';
          if (label.includes('repl')) result.stats.replies = label;
          if (label.includes('repost') || label.includes('Retweet')) result.stats.reposts = label;
          if (label.includes('like')) result.stats.likes = label;
          if (label.includes('view')) result.stats.views = label;
        });
      }

      return result;
    });

    return postData;
  } finally {
    await context.close();
  }
}

export async function openLoginBrowser() {
  console.log('Profile will be saved to:', PROFILE_DIR);

  const chromePath = findChrome();
  const launchOptions = {
    headless: false,
    viewport: { width: 1280, height: 800 },
    locale: 'ja-JP',
    args: ['--disable-blink-features=AutomationControlled'],
    ignoreDefaultArgs: ['--enable-automation'],
  };

  if (chromePath) {
    launchOptions.executablePath = chromePath;
    launchOptions.channel = 'chrome';
  }

  const context = await chromium.launchPersistentContext(PROFILE_DIR, launchOptions);

  const page = await context.newPage();
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  });

  await page.goto('https://x.com/login');

  return new Promise(resolve => {
    context.on('close', () => {
      console.log('Session saved!');
      resolve();
    });
  });
}
