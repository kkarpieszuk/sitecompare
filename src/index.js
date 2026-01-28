const { readConfig } = require('./config');
const { takeScreenshot } = require('./screenshot');
const { getUrlHash, saveScreenshot, findLatestScreenshot } = require('./fileManager');
const { compareImages } = require('./comparator');
const { generateReport } = require('./report');

/**
 * Main application logic
 * @param {string} configPath - Path to configuration file
 */
async function run(configPath) {
  try {
    console.log('SiteCompare - Narzędzie do porównywania zrzutów ekranu stron\n');
    
    // Read configuration
    const config = await readConfig(configPath);
    console.log(`Załadowano konfigurację z: ${configPath}`);
    console.log(`Znaleziono ${config.urls.length} URL(i) do przetworzenia\n`);
    
    const results = [];
    const THRESHOLD = 5; // 5% threshold
    
    // Process each URL
    for (let i = 0; i < config.urls.length; i++) {
      const url = config.urls[i];
      console.log(`[${i + 1}/${config.urls.length}] Przetwarzanie: ${url}`);
      
      try {
        const urlHash = getUrlHash(url);
        
        // Check if screenshot already exists
        const existingScreenshot = await findLatestScreenshot(urlHash);
        
        // Take new screenshot
        const screenshotBuffer = await takeScreenshot(url);
        const newScreenshotPath = await saveScreenshot(url, urlHash, screenshotBuffer);
        
        if (!existingScreenshot) {
          // First screenshot for this URL
          console.log(`  ✓ Pierwszy zrzut ekranu zapisany: ${newScreenshotPath}\n`);
          results.push({
            type: 'new',
            url,
            newScreenshot: newScreenshotPath
          });
        } else {
          // Compare with existing screenshot
          console.log(`  Porównywanie z poprzednim zrzutem...`);
          const comparison = await compareImages(existingScreenshot, newScreenshotPath, THRESHOLD);
          
          if (comparison.hasChanges) {
            console.log(`  ⚠ Wykryto zmiany: ${comparison.differencePercent}%\n`);
            results.push({
              type: 'changed',
              url,
              oldScreenshot: existingScreenshot,
              newScreenshot: newScreenshotPath,
              differencePercent: comparison.differencePercent
            });
          } else {
            console.log(`  ✓ Brak zmian: ${comparison.differencePercent}%\n`);
            results.push({
              type: 'unchanged',
              url,
              oldScreenshot: existingScreenshot,
              newScreenshot: newScreenshotPath,
              differencePercent: comparison.differencePercent
            });
          }
        }
      } catch (error) {
        console.error(`  ✗ Błąd: ${error.message}\n`);
        results.push({
          type: 'error',
          url,
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
