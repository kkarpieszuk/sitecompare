const fs = require('fs').promises;
const { diffLines } = require('diff');

/**
 * Compares two HTML files and returns the difference statistics
 * @param {string} html1Path - Path to the first HTML file
 * @param {string} html2Path - Path to the second HTML file
 * @param {number} threshold - Threshold percentage (0-100)
 * @returns {Promise<{differencePercent: number, hasChanges: boolean, changedLines: number, totalLines: number}>}
 */
async function compareHtml(html1Path, html2Path, threshold = 5) {
  try {
    const html1 = await fs.readFile(html1Path, 'utf-8');
    const html2 = await fs.readFile(html2Path, 'utf-8');
    
    // Use diff library to compare line by line
    const differences = diffLines(html1, html2);
    
    let changedLines = 0;
    let totalLines = 0;
    
    differences.forEach(part => {
      const lines = part.value.split('\n').length - 1;
      totalLines += lines;
      
      if (part.added || part.removed) {
        changedLines += lines;
      }
    });
    
    // Avoid division by zero
    if (totalLines === 0) {
      return {
        differencePercent: 0,
        hasChanges: false,
        changedLines: 0,
        totalLines: 0
      };
    }
    
    const differencePercent = (changedLines / totalLines) * 100;
    
    return {
      differencePercent: parseFloat(differencePercent.toFixed(2)),
      hasChanges: differencePercent >= threshold,
      changedLines,
      totalLines
    };
  } catch (error) {
    throw new Error(`Error comparing HTML: ${error.message}`);
  }
}

module.exports = { compareHtml };
