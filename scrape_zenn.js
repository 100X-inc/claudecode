const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function scrapeZennArticle() {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();

    const url = 'https://zenn.dev/genda_jp/articles/70aa9a74ac1e62';
    console.log('Navigating to:', url);

    await page.goto(url, { waitUntil: 'networkidle' });

    // Wait for content to load
    await page.waitForSelector('article', { timeout: 10000 });

    // Create output directory
    const outputDir = path.join(__dirname, 'zenn_article_output');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Take full page screenshot
    console.log('Taking full page screenshot...');
    await page.screenshot({
        path: path.join(outputDir, 'full_page.png'),
        fullPage: true
    });

    // Take screenshots of specific sections
    console.log('Taking section screenshots...');

    // Scroll and capture multiple viewport screenshots
    const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    const viewportHeight = 1080;
    let screenshotIndex = 1;

    for (let scrollPos = 0; scrollPos < scrollHeight; scrollPos += viewportHeight) {
        await page.evaluate((pos) => window.scrollTo(0, pos), scrollPos);
        await page.waitForTimeout(500);
        await page.screenshot({
            path: path.join(outputDir, `section_${screenshotIndex}.png`),
            clip: { x: 0, y: 0, width: 1920, height: viewportHeight }
        });
        screenshotIndex++;
    }

    // Extract article content
    console.log('Extracting article content...');

    const articleData = await page.evaluate(() => {
        const article = document.querySelector('article');

        // Get title
        const titleEl = document.querySelector('h1');
        const title = titleEl ? titleEl.textContent.trim() : '';

        // Get author info
        const authorEl = document.querySelector('[class*="ArticleHeader"] a[href*="/"]');
        const author = authorEl ? authorEl.textContent.trim() : '';

        // Get publication date
        const dateEl = document.querySelector('time');
        const date = dateEl ? dateEl.getAttribute('datetime') || dateEl.textContent.trim() : '';

        // Get all headings and their content
        const sections = [];
        const headings = article ? article.querySelectorAll('h1, h2, h3, h4') : [];

        headings.forEach((heading, index) => {
            const level = parseInt(heading.tagName.charAt(1));
            const text = heading.textContent.trim();

            // Get content until next heading
            let content = [];
            let sibling = heading.nextElementSibling;
            while (sibling && !['H1', 'H2', 'H3', 'H4'].includes(sibling.tagName)) {
                if (sibling.textContent.trim()) {
                    content.push(sibling.textContent.trim());
                }
                sibling = sibling.nextElementSibling;
            }

            sections.push({
                level,
                heading: text,
                content: content.join('\n\n')
            });
        });

        // Get all code blocks
        const codeBlocks = [];
        const codeEls = article ? article.querySelectorAll('pre code, pre') : [];
        codeEls.forEach((code, index) => {
            const lang = code.className.match(/language-(\w+)/)?.[1] || '';
            codeBlocks.push({
                index: index + 1,
                language: lang,
                code: code.textContent.trim()
            });
        });

        // Get all images
        const images = [];
        const imgEls = article ? article.querySelectorAll('img') : [];
        imgEls.forEach((img, index) => {
            images.push({
                index: index + 1,
                src: img.src,
                alt: img.alt || ''
            });
        });

        // Get full article HTML
        const fullHtml = article ? article.innerHTML : '';

        // Get full article text
        const fullText = article ? article.textContent : '';

        return {
            title,
            author,
            date,
            sections,
            codeBlocks,
            images,
            fullHtml,
            fullText
        };
    });

    // Save extracted data as JSON
    fs.writeFileSync(
        path.join(outputDir, 'article_data.json'),
        JSON.stringify(articleData, null, 2),
        'utf-8'
    );

    // Download images
    console.log('Downloading images...');
    for (const img of articleData.images) {
        try {
            const imgName = `image_${img.index}.png`;
            const imgPath = path.join(outputDir, imgName);

            const response = await page.goto(img.src);
            if (response) {
                const buffer = await response.body();
                fs.writeFileSync(imgPath, buffer);
                console.log(`Downloaded: ${imgName}`);
            }
        } catch (e) {
            console.log(`Failed to download image ${img.index}: ${e.message}`);
        }
    }

    // Go back to article page
    await page.goto(url, { waitUntil: 'networkidle' });

    // Generate markdown document
    console.log('Generating markdown document...');

    let markdown = `# ${articleData.title}\n\n`;
    markdown += `**著者:** ${articleData.author}\n`;
    markdown += `**公開日:** ${articleData.date}\n`;
    markdown += `**URL:** ${url}\n\n`;
    markdown += `---\n\n`;

    // Add sections
    for (const section of articleData.sections) {
        const headingPrefix = '#'.repeat(section.level);
        markdown += `${headingPrefix} ${section.heading}\n\n`;
        if (section.content) {
            markdown += `${section.content}\n\n`;
        }
    }

    // Add code blocks section
    if (articleData.codeBlocks.length > 0) {
        markdown += `\n---\n\n## コードブロック一覧\n\n`;
        for (const block of articleData.codeBlocks) {
            markdown += `### コードブロック ${block.index}${block.language ? ` (${block.language})` : ''}\n\n`;
            markdown += '```' + block.language + '\n';
            markdown += block.code + '\n';
            markdown += '```\n\n';
        }
    }

    // Add images section
    if (articleData.images.length > 0) {
        markdown += `\n---\n\n## 画像一覧\n\n`;
        for (const img of articleData.images) {
            markdown += `### 画像 ${img.index}\n`;
            markdown += `- ファイル: image_${img.index}.png\n`;
            markdown += `- Alt: ${img.alt || '(なし)'}\n`;
            markdown += `- 元URL: ${img.src}\n\n`;
        }
    }

    fs.writeFileSync(
        path.join(outputDir, 'article.md'),
        markdown,
        'utf-8'
    );

    // Save full text
    fs.writeFileSync(
        path.join(outputDir, 'full_text.txt'),
        articleData.fullText,
        'utf-8'
    );

    // Save HTML
    fs.writeFileSync(
        path.join(outputDir, 'article.html'),
        articleData.fullHtml,
        'utf-8'
    );

    console.log('\n=== Scraping Complete ===');
    console.log(`Output directory: ${outputDir}`);
    console.log(`Files created:`);
    console.log(`  - full_page.png (full page screenshot)`);
    console.log(`  - section_*.png (viewport screenshots)`);
    console.log(`  - article.md (markdown document)`);
    console.log(`  - article_data.json (structured data)`);
    console.log(`  - full_text.txt (plain text)`);
    console.log(`  - article.html (HTML content)`);
    console.log(`  - image_*.png (downloaded images)`);

    console.log(`\nArticle Summary:`);
    console.log(`  Title: ${articleData.title}`);
    console.log(`  Author: ${articleData.author}`);
    console.log(`  Date: ${articleData.date}`);
    console.log(`  Sections: ${articleData.sections.length}`);
    console.log(`  Code blocks: ${articleData.codeBlocks.length}`);
    console.log(`  Images: ${articleData.images.length}`);

    await browser.close();

    return outputDir;
}

scrapeZennArticle().catch(console.error);
