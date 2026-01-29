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
        console.log(`Using default configuration file: ${defaultPath}\n`);
      } else {
        console.log('Usage: sitecompare [config-file-path]\n');
        console.log('Example: sitecompare conf.json');
        console.log('or:      sitecompare /path/to/config.json\n');
        console.log('If you don\'t provide a path, the application will try to find a "sitecompare.json" file in the current directory.\n');
        console.log('Configuration file format (JSON):');
        console.log(JSON.stringify({
          urls: [
            {
              url: 'https://example.com',
              slug: 'homepage',
              timeout: 6
            },
            {
              url: 'https://example.com/about',
              slug: 'about-page'
            },
            'https://example2.com'
          ]
        }, null, 2));
        console.log('\nURL object fields:');
        console.log('  url      - (required) page address to monitor');
        console.log('  slug     - (optional) human-readable name used in filenames and reports');
        console.log('  timeout  - (optional) wait time in seconds (default: 6)');
        console.log('\nYou can also use simple URL strings (without slug and timeout).');
        process.exit(1);
      }
    }

    // Run the main application logic
    await run(configPath);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
