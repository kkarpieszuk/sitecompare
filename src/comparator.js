const fs = require('fs').promises;
const { PNG } = require('pngjs');
const pixelmatch = require('pixelmatch');

/**
 * Reads a PNG file and returns PNG object
 * @param {string} imagePath - Path to the image file
 * @returns {Promise<PNG>} - PNG object
 */
async function readPNG(imagePath) {
  const buffer = await fs.readFile(imagePath);
  return PNG.sync.read(buffer);
}

/**
 * Compares two images and returns the difference percentage
 * @param {string} image1Path - Path to the first image
 * @param {string} image2Path - Path to the second image
 * @param {number} threshold - Threshold percentage (0-100)
 * @returns {Promise<{differencePercent: number, hasChanges: boolean}>}
 */
async function compareImages(image1Path, image2Path, threshold = 5) {
  try {
    const img1 = await readPNG(image1Path);
    const img2 = await readPNG(image2Path);
    
    const { width, height } = img1;
    
    // Check if dimensions match
    if (img1.width !== img2.width || img1.height !== img2.height) {
      // If dimensions differ, consider it a significant change
      return {
        differencePercent: 100,
        hasChanges: true
      };
    }
    
    // Create a diff image buffer (not saved, just for pixelmatch)
    const diff = new PNG({ width, height });
    
    // Compare images
    const numDiffPixels = pixelmatch(
      img1.data,
      img2.data,
      diff.data,
      width,
      height,
      { threshold: 0.1 }
    );
    
    const totalPixels = width * height;
    const differencePercent = (numDiffPixels / totalPixels) * 100;
    
    return {
      differencePercent: parseFloat(differencePercent.toFixed(2)),
      hasChanges: differencePercent >= threshold
    };
  } catch (error) {
    throw new Error(`Błąd podczas porównywania obrazów: ${error.message}`);
  }
}

module.exports = { compareImages };
