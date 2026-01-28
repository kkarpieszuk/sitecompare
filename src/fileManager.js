const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const os = require('os');

/**
 * Gets the screenshot directory path
 * @returns {string} - Path to ~/.sitecompare/
 */
function getScreenshotDir() {
  return path.join(os.homedir(), '.sitecompare');
}

/**
 * Generates a hash for the given URL
 * @param {string} url - URL to hash
 * @returns {string} - SHA256 hash of the URL
 */
function getUrlHash(url) {
  return crypto.createHash('sha256').update(url).digest('hex').substring(0, 16);
}

/**
 * Gets today's date in YYYY-MM-DD format
 * @returns {string} - Formatted date
 */
function getDateString() {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

/**
 * Ensures the screenshot directory exists
 */
async function ensureScreenshotDir() {
  const dir = getScreenshotDir();
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (error) {
    throw new Error(`Nie można utworzyć katalogu ${dir}: ${error.message}`);
  }
}

/**
 * Saves a screenshot buffer to a file
 * @param {string} urlHash - Hash of the URL
 * @param {Buffer} buffer - Screenshot buffer
 * @returns {Promise<string>} - Path to saved file
 */
async function saveScreenshot(urlHash, buffer) {
  await ensureScreenshotDir();
  const filename = `${urlHash}-${getDateString()}.png`;
  const filepath = path.join(getScreenshotDir(), filename);
  await fs.writeFile(filepath, buffer);
  return filepath;
}

/**
 * Gets all screenshots for a given URL hash
 * @param {string} urlHash - Hash of the URL
 * @returns {Promise<Array<{path: string, date: string}>>} - Array of screenshot info, sorted by date (newest first)
 */
async function getAllScreenshots(urlHash) {
  await ensureScreenshotDir();
  const dir = getScreenshotDir();
  
  try {
    const files = await fs.readdir(dir);
    const screenshots = files
      .filter(file => file.startsWith(urlHash) && file.endsWith('.png'))
      .map(file => {
        const match = file.match(/^(.+)-(\d{4}-\d{2}-\d{2})\.png$/);
        if (match) {
          return {
            path: path.join(dir, file),
            date: match[2],
            filename: file
          };
        }
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => b.date.localeCompare(a.date)); // Sort by date, newest first
    
    return screenshots;
  } catch (error) {
    return [];
  }
}

/**
 * Finds the latest screenshot for a given URL hash
 * @param {string} urlHash - Hash of the URL
 * @returns {Promise<string|null>} - Path to the latest screenshot, or null if none exists
 */
async function findLatestScreenshot(urlHash) {
  const screenshots = await getAllScreenshots(urlHash);
  return screenshots.length > 0 ? screenshots[0].path : null;
}

module.exports = {
  getScreenshotDir,
  getUrlHash,
  saveScreenshot,
  getAllScreenshots,
  findLatestScreenshot,
  ensureScreenshotDir
};
