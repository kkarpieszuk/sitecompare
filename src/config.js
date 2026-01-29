const fs = require('fs').promises;
const path = require('path');

/**
 * Slugifies a string for use in filenames
 * @param {string} text - Text to slugify
 * @returns {string} - Slugified text
 */
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

/**
 * Reads and validates the configuration file
 * @param {string} configPath - Path to the config file
 * @returns {Promise<{urls: Array<{url: string, slug?: string, timeout?: number}>}>} - Parsed configuration
 */
async function readConfig(configPath) {
  try {
    // Check if file exists
    const absolutePath = path.resolve(configPath);
    const fileContent = await fs.readFile(absolutePath, 'utf-8');
    
    // Parse JSON
    const config = JSON.parse(fileContent);
    
    // Validate structure
    if (!config.urls || !Array.isArray(config.urls)) {
      throw new Error('Configuration file must contain a "urls" array');
    }
    
    if (config.urls.length === 0) {
      throw new Error('The "urls" array cannot be empty');
    }
    
    // Validate and normalize URLs
    config.urls = config.urls.map((item, index) => {
      // Support both old format (string) and new format (object)
      let urlObj;
      if (typeof item === 'string') {
        // Old format - convert to new format
        urlObj = { url: item };
      } else if (typeof item === 'object' && item !== null) {
        // New format
        urlObj = { ...item };
      } else {
        throw new Error(`Invalid element at index ${index}`);
      }
      
      // Validate required fields
      if (!urlObj.url || typeof urlObj.url !== 'string' || !urlObj.url.startsWith('http')) {
        throw new Error(`Invalid URL at index ${index}: ${urlObj.url}`);
      }
      
      // Validate and slugify slug if provided
      if (urlObj.slug) {
        if (typeof urlObj.slug !== 'string') {
          throw new Error(`Field "slug" must be text at index ${index}`);
        }
        urlObj.slug = slugify(urlObj.slug);
        if (!urlObj.slug) {
          throw new Error(`Field "slug" is empty after normalization at index ${index}`);
        }
      }
      
      // Validate timeout if provided
      if (urlObj.timeout !== undefined) {
        if (typeof urlObj.timeout !== 'number' || urlObj.timeout < 0) {
          throw new Error(`Field "timeout" must be a number >= 0 at index ${index}`);
        }
      }
      
      return urlObj;
    });
    
    return config;
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`Configuration file not found: ${configPath}`);
    }
    if (error instanceof SyntaxError) {
      throw new Error(`JSON parsing error in file ${configPath}: ${error.message}`);
    }
    throw error;
  }
}

module.exports = { readConfig, slugify };
