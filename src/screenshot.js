const puppeteer = require('puppeteer');

/**
 * Takes a screenshot and gets HTML content of a given URL
 * @param {string} url - URL to screenshot
 * @returns {Promise<{screenshot: Buffer, html: string}>} - Screenshot buffer and HTML content
 */
async function takeScreenshot(url) {
  let browser;
  try {
    console.log(`  Wykonywanie zrzutu ekranu dla: ${url}`);

    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Set viewport size
    await page.setViewport({
      width: 1920,
      height: 1080
    });

    // Navigate to URL with timeout
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Take screenshot
    const screenshot = await page.screenshot({
      fullPage: true,
      type: 'png'
    });

    // Get HTML content
    const html = await page.content();

    return { screenshot, html };
  } catch (error) {
    throw new Error(`Błąd podczas wykonywania zrzutu ekranu ${url}: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

module.exports = { takeScreenshot };
