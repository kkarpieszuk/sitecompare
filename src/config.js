const fs = require('fs').promises;
const path = require('path');

/**
 * Reads and validates the configuration file
 * @param {string} configPath - Path to the config file
 * @returns {Promise<{urls: string[]}>} - Parsed configuration
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
      throw new Error('Plik konfiguracyjny musi zawierać tablicę "urls"');
    }
    
    if (config.urls.length === 0) {
      throw new Error('Tablica "urls" nie może być pusta');
    }
    
    // Validate URLs
    config.urls.forEach((url, index) => {
      if (typeof url !== 'string' || !url.startsWith('http')) {
        throw new Error(`Nieprawidłowy URL pod indeksem ${index}: ${url}`);
      }
    });
    
    return config;
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`Nie znaleziono pliku konfiguracyjnego: ${configPath}`);
    }
    if (error instanceof SyntaxError) {
      throw new Error(`Błąd parsowania JSON w pliku ${configPath}: ${error.message}`);
    }
    throw error;
  }
}

module.exports = { readConfig };
