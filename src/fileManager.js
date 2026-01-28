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
 * Gets current date and time in YYYY-MM-DD-HH-MM-SS format
 * @returns {string} - Formatted date and time
 */
function getDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day}-${hours}-${minutes}-${seconds}`;
}

/**
 * Extracts domain name from URL and formats it for filename
 * @param {string} url - Full URL
 * @returns {string} - Domain with dots replaced by underscores
 */
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    // Get hostname and replace dots with underscores
    return urlObj.hostname.replace(/\./g, '_');
  } catch (error) {
    return 'unknown';
  }
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
 * @param {string} url - Full URL (for domain extraction)
 * @param {string} urlHash - Hash of the URL
 * @param {Buffer} buffer - Screenshot buffer
 * @returns {Promise<string>} - Path to saved file
 */
async function saveScreenshot(url, urlHash, buffer) {
  await ensureScreenshotDir();
  const domain = extractDomain(url);
  const filename = `${domain}-${urlHash}-${getDateString()}.png`;
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
      .filter(file => file.includes(urlHash) && file.endsWith('.png'))
      .map(file => {
        // Match format: {domain}-{hash}-{YYYY-MM-DD-HH-MM-SS}.png
        const match = file.match(/^(.+)-([a-f0-9]+)-(\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2})\.png$/);
        if (match) {
          return {
            path: path.join(dir, file),
            date: match[3],
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
  extractDomain,
  saveScreenshot,
  getAllScreenshots,
  findLatestScreenshot,
  ensureScreenshotDir
};
