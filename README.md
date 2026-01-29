# SiteCompare

CLI tool for automatic website screenshot comparison.

## Description

SiteCompare is a command-line application that:
- Takes screenshots of websites from a configuration file
- Saves HTML code of pages along with screenshots
- Stores everything in the `~/.sitecompare/` directory
- Compares new screenshots and HTML with previous versions
- Detects visual (images) and structural (HTML) changes with a 5% tolerance threshold
- Generates detailed change reports

## Installation

```bash
cd /path/to/sitecompare
npm install
```

To install globally:

```bash
npm install -g .
```

Or use locally without global installation:

```bash
npm link
```

## Usage

### Basic usage

```bash
sitecompare conf.json
```

### Usage with default configuration file

If a `sitecompare.json` file exists in the current directory, you can run the application without specifying a path:

```bash
sitecompare
```

### Configuration file format

The configuration file must be in JSON format and contain a `urls` array. Each element can be:
- **Simple string** - URL address (uses hash in filenames, 6s timeout)
- **Object** - with additional options

#### URL object format:

```json
{
  "urls": [
    {
      "url": "https://example.com",
      "slug": "homepage",
      "timeout": 6
    },
    {
      "url": "https://example.com/about",
      "slug": "about-page"
    },
    "https://example2.com"
  ]
}
```

#### Object fields:

- **`url`** (required) - Page address to monitor
- **`slug`** (optional) - Human-readable name used in filenames and reports instead of hash. Automatically normalized (lowercase, no special characters)
- **`timeout`** (optional) - Wait time in seconds before taking a screenshot (default: 6). Useful for pages with slow-loading elements

## How it works

1. **First run for URL**: 
   - Application connects to the page and waits 6 seconds for dynamic elements to load (cookie banners, lazy loading, etc.)
   - Takes a screenshot and saves it as `{domain}-{hash}-{date-time}.png`
   - Saves HTML code as `{domain}-{hash}-{date-time}.html`
2. **Subsequent runs**: 
   - Connects to the page and waits 6 seconds
   - Takes a new screenshot and fetches HTML
   - Compares image with the latest existing screenshot (pixel-by-pixel)
   - Compares HTML with the previous version (line-by-line diff)
   - Calculates percentage difference for both
   - If difference < 5%: considers them identical
   - If difference ≥ 5%: detects changes (in image and/or HTML)

## Directory structure

Screenshots and HTML files are saved in:
```
~/.sitecompare/
├── example_com-homepage-2024-01-15-14-30-45.png
├── example_com-homepage-2024-01-15-14-30-45.html
├── example_com-about-page-2024-01-15-14-35-22.png
├── example_com-about-page-2024-01-15-14-35-22.html
├── github_com-abc123def456-2024-01-15-15-00-00.png
├── github_com-abc123def456-2024-01-15-15-00-00.html
└── ...
```

Filename format: `{domain}-{identifier}-{YYYY-MM-DD-HH-MM-SS}.{extension}`

Where:
- `{domain}` - main domain from URL (dots replaced with underscores)
- `{identifier}` - slug (if provided) or SHA256 hash of URL (first 16 characters)
- `{YYYY-MM-DD-HH-MM-SS}` - date and time of screenshot
- `{extension}` - `png` for images, `html` for source code

## Report

After processing all URLs, the application generates a report containing:

### 📸 New snapshots
URLs for which there were no previous snapshots - shows paths to new PNG and HTML files

### ✅ No changes
URLs whose visual (image) and structural (HTML) changes are below the 5% threshold

### 🔴 Changes detected
URLs with significant changes (≥ 5%) in image and/or HTML, along with paths to all files (previous and current)

## Example report

```
================================================================================
SCREENSHOT COMPARISON REPORT
================================================================================

📸 NEW SNAPSHOTS:
--------------------------------------------------------------------------------
1. https://example.com [homepage]
   Image: /home/user/.sitecompare/example_com-homepage-2024-01-15-14-30-45.png
   HTML:  /home/user/.sitecompare/example_com-homepage-2024-01-15-14-30-45.html

✅ NO CHANGES (difference < 5%):
--------------------------------------------------------------------------------
1. https://example.com/about [about-page]
   Image difference: 0.12%
   HTML difference:  0.05%
   Current image: /home/user/.sitecompare/example_com-about-page-2024-01-15-14-35-22.png
   Current HTML:  /home/user/.sitecompare/example_com-about-page-2024-01-15-14-35-22.html

🔴 CHANGES DETECTED (difference ≥ 5%):
--------------------------------------------------------------------------------
1. https://github.com [github-main]
   Changes: Image: 15.34%, HTML: 8.45%
   Previous image: /home/user/.sitecompare/github_com-github-main-2024-01-14-10-00-00.png
   Current image:  /home/user/.sitecompare/github_com-github-main-2024-01-15-15-00-00.png
   Previous HTML:  /home/user/.sitecompare/github_com-github-main-2024-01-14-10-00-00.html
   Current HTML:   /home/user/.sitecompare/github_com-github-main-2024-01-15-15-00-00.html

================================================================================
SUMMARY:
  New snapshots:       1
  No changes:          1
  With changes:        1
  Total processed:     3
================================================================================
```

## Requirements

- Node.js (version 14 or newer)
- npm

## Dependencies

- **puppeteer**: Taking screenshots of pages and fetching HTML
- **pixelmatch**: Comparing images at pixel level
- **pngjs**: PNG file handling
- **diff**: Comparing HTML files line-by-line

## Error handling

The application handles:
- Invalid or missing configuration files
- Network errors during page loading
- Invalid URLs
- File write errors

## License

MIT
