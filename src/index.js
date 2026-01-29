const { readConfig } = require('./config');
const { takeScreenshot } = require('./screenshot');
const { getUrlHash, saveScreenshot, saveHtml, findLatestScreenshot, findLatestHtml } = require('./fileManager');
const { compareImages } = require('./comparator');
const { compareHtml } = require('./htmlComparator');
const { generateReport } = require('./report');

/**
 * Main application logic
 * @param {string} configPath - Path to configuration file
 */
async function run(configPath) {
  try {
    console.log('SiteCompare - Website Screenshot Comparison Tool\n');
    
    // Read configuration
    const config = await readConfig(configPath);
    console.log(`Loaded configuration from: ${configPath}`);
    console.log(`Found ${config.urls.length} URL(s) to process\n`);
    
    const results = [];
    const THRESHOLD = 5; // 5% threshold
    
    // Process each URL
    for (let i = 0; i < config.urls.length; i++) {
      const urlConfig = config.urls[i];
      const url = urlConfig.url;
      const slug = urlConfig.slug;
      const timeout = urlConfig.timeout !== undefined ? urlConfig.timeout : 6;
      
      // Use slug if provided, otherwise use hash
      const identifier = slug || getUrlHash(url);
      
      // Display information
      const displayName = slug ? `${url} [${slug}]` : url;
      console.log(`[${i + 1}/${config.urls.length}] Processing: ${displayName}`);
      
      try {
        // Check if screenshot and HTML already exist
        const existingScreenshot = await findLatestScreenshot(url, identifier);
        const existingHtml = await findLatestHtml(url, identifier);
        
        // Take new screenshot and get HTML
        const { screenshot: screenshotBuffer, html } = await takeScreenshot(url, timeout);
        const newScreenshotPath = await saveScreenshot(url, identifier, screenshotBuffer);
        const newHtmlPath = await saveHtml(url, identifier, html);
        
        if (!existingScreenshot || !existingHtml) {
          // First capture for this URL
          console.log(`  ✓ First snapshot saved:`);
          console.log(`    Image: ${newScreenshotPath}`);
          console.log(`    HTML:  ${newHtmlPath}\n`);
          results.push({
            type: 'new',
            url,
            slug,
            newScreenshot: newScreenshotPath,
            newHtml: newHtmlPath
          });
        } else {
          // Compare with existing screenshot and HTML
          console.log(`  Comparing with previous snapshot...`);
          const imageComparison = await compareImages(existingScreenshot, newScreenshotPath, THRESHOLD);
          console.log(`    Image: ${imageComparison.differencePercent}%`);
          
          const htmlComparison = await compareHtml(existingHtml, newHtmlPath, THRESHOLD);
          console.log(`    HTML:  ${htmlComparison.differencePercent}% (${htmlComparison.changedLines}/${htmlComparison.totalLines} lines)`);
          
          const hasImageChanges = imageComparison.hasChanges;
          const hasHtmlChanges = htmlComparison.hasChanges;
          
          if (hasImageChanges || hasHtmlChanges) {
            console.log(`  ⚠ Changes detected!\n`);
            results.push({
              type: 'changed',
              url,
              slug,
              oldScreenshot: existingScreenshot,
              newScreenshot: newScreenshotPath,
              oldHtml: existingHtml,
              newHtml: newHtmlPath,
              imageDifferencePercent: imageComparison.differencePercent,
              htmlDifferencePercent: htmlComparison.differencePercent,
              hasImageChanges,
              hasHtmlChanges
            });
          } else {
            console.log(`  ✓ No changes\n`);
            results.push({
              type: 'unchanged',
              url,
              slug,
              oldScreenshot: existingScreenshot,
              newScreenshot: newScreenshotPath,
              oldHtml: existingHtml,
              newHtml: newHtmlPath,
              imageDifferencePercent: imageComparison.differencePercent,
              htmlDifferencePercent: htmlComparison.differencePercent
            });
          }
        }
      } catch (error) {
        console.error(`  ✗ Error: ${error.message}\n`);
        results.push({
          type: 'error',
          url,
          slug,
          error: error.message
        });
      }
    }
    
    // Generate and display report
    generateReport(results);
  } catch (error) {
    throw error;
  }
}

module.exports = { run };
