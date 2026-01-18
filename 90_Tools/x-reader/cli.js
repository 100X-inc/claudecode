#!/usr/bin/env node
/**
 * x-reader CLI
 * Read X (Twitter) posts from anywhere
 * Usage: x-reader <url>
 */

import { readPost } from './lib/reader.js';

const url = process.argv[2];

if (!url) {
  console.log('Usage: x-reader <x-post-url>');
  console.log('Example: x-reader https://x.com/username/status/123456789');
  process.exit(1);
}

try {
  console.log('Reading post:', url);
  const postData = await readPost(url);

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

  console.log('JSON:', JSON.stringify(postData, null, 2));
} catch (err) {
  console.error('Error:', err.message);
  process.exit(1);
}
