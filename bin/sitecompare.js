#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const { run } = require('../src/index');

async function main() {
  try {
    // Get config file path from arguments or default to sitecompare.json
    let configPath = process.argv[2];
    
    if (!configPath) {
      // Try to find sitecompare.json in current directory
      const defaultPath = path.join(process.cwd(), 'sitecompare.json');
      if (fs.existsSync(defaultPath)) {
        configPath = defaultPath;
        console.log(`Używam domyślnego pliku konfiguracyjnego: ${defaultPath}\n`);
      } else {
        console.log('Użycie: sitecompare [ścieżka-do-pliku-konfiguracyjnego]\n');
        console.log('Przykład: sitecompare conf.json');
        console.log('lub:      sitecompare /path/to/config.json\n');
        console.log('Jeśli nie podasz ścieżki, aplikacja spróbuje znaleźć plik "sitecompare.json" w bieżącym katalogu.\n');
        console.log('Format pliku konfiguracyjnego (JSON):');
        console.log(JSON.stringify({
          urls: [
            'https://example.com',
            'https://example2.com'
          ]
        }, null, 2));
        process.exit(1);
      }
    }

    // Run the main application logic
    await run(configPath);
  } catch (error) {
    console.error('Błąd:', error.message);
    process.exit(1);
  }
}

main();
