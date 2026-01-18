#!/usr/bin/env node
/**
 * x-login CLI
 * Log in to X and save session for x-reader
 * Usage: x-login
 */

import { openLoginBrowser, PROFILE_DIR } from './lib/reader.js';

console.log('Opening browser for X login...');
console.log('Profile directory:', PROFILE_DIR);
console.log('\n=== Instructions ===');
console.log('1. Log in to X in the browser window');
console.log('2. After login completes, close the browser');
console.log('3. Your session will be saved automatically');
console.log('====================\n');

try {
  await openLoginBrowser();
  console.log('You can now use "x-reader <url>" from anywhere!');
} catch (err) {
  console.error('Error:', err.message);
  process.exit(1);
}
