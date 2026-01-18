/**
 * X (Twitter) Post Reader
 * Reads a post using the saved persistent profile.
 * Usage: node read-post.js <url>
 */

import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

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
    if (fs.existsSync(p)) return p;
  }
  return null;
}

async function readPost(url) {
  // Check if profile exists
  if (!fs.existsSync(PROFILE_DIR)) {
    console.error('Error: No saved profile found.');
    console.error('Run "node login.js" first to log in and save your session.');
    process.exit(1);
  }

  console.log('Reading post:', url);

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

    // Wait for tweet content to appear
    await page.waitForSelector('article [data-testid="tweetText"]', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);

    // Extract post content
    const postData = await page.evaluate(() => {
      const result = {
        author: null,
        handle: null,
        content: null,
        timestamp: null,
        stats: {},
      };

      // Author name
      const authorEl = document.querySelector('article [data-testid="User-Name"] a span');
      if (authorEl) result.author = authorEl.textContent;

      // Handle
      const handleEl = document.querySelector('article [data-testid="User-Name"] a[href^="/"]');
      if (handleEl) {
        const href = handleEl.getAttribute('href');
        if (href) result.handle = '@' + href.replace('/', '');
      }

      // Post content
      const tweetTextEl = document.querySelector('article [data-testid="tweetText"]');
      if (tweetTextEl) result.content = tweetTextEl.textContent;

      // Timestamp
      const timeEl = document.querySelector('article time');
      if (timeEl) {
        result.timestamp = timeEl.getAttribute('datetime');
      }

      // Stats (replies, retweets, likes)
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

    // Output results
    console.log('\n=== Post Content ===');
    console.log(`Author: ${postData.author || 'N/A'}`);
    console.log(`Handle: ${postData.handle || 'N/A'}`);
    console.log(`Time: ${postData.timestamp || 'N/A'}`);
    console.log(`\nContent:\n${postData.content || '(No text content)'}`);

    if (Object.keys(postData.stats).length > 0) {
      console.log('\nStats:');
      for (const [key, value] of Object.entries(postData.stats)) {
        console.log(`  ${key}: ${value}`);
      }
    }
    console.log('====================\n');

    // Also output as JSON for programmatic use
    console.log('JSON:', JSON.stringify(postData, null, 2));

  } finally {
    await context.close();
  }
}

// Parse command line arguments
const url = process.argv[2];

if (!url) {
  console.log('Usage: node read-post.js <x-post-url>');
  console.log('Example: node read-post.js https://x.com/username/status/123456789');
  process.exit(1);
}

readPost(url).catch(err => {
  console.error('Error reading post:', err.message);
  process.exit(1);
});
