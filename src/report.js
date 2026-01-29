/**
 * Generates and displays a report of screenshot comparisons
 * @param {Array} results - Array of result objects
 */
function generateReport(results) {
  console.log('\n' + '='.repeat(80));
  console.log('SCREENSHOT COMPARISON REPORT');
  console.log('='.repeat(80) + '\n');
  
  // Separate results by type
  const newScreenshots = results.filter(r => r.type === 'new');
  const unchanged = results.filter(r => r.type === 'unchanged');
  const changed = results.filter(r => r.type === 'changed');
  
  // New screenshots
  if (newScreenshots.length > 0) {
    console.log('📸 NEW SNAPSHOTS:');
    console.log('-'.repeat(80));
    newScreenshots.forEach((result, index) => {
      const displayName = result.slug ? `${result.url} [${result.slug}]` : result.url;
      console.log(`${index + 1}. ${displayName}`);
      console.log(`   Image: ${result.newScreenshot}`);
      console.log(`   HTML:  ${result.newHtml}`);
      console.log('');
    });
  }
  
  // Unchanged
  if (unchanged.length > 0) {
    console.log('✅ NO CHANGES (difference < 5%):');
    console.log('-'.repeat(80));
    unchanged.forEach((result, index) => {
      const displayName = result.slug ? `${result.url} [${result.slug}]` : result.url;
      console.log(`${index + 1}. ${displayName}`);
      console.log(`   Image difference: ${result.imageDifferencePercent}%`);
      console.log(`   HTML difference:  ${result.htmlDifferencePercent}%`);
      console.log(`   Current image: ${result.newScreenshot}`);
      console.log(`   Current HTML:  ${result.newHtml}`);
      console.log('');
    });
  }
  
  // Changed
  if (changed.length > 0) {
    console.log('🔴 CHANGES DETECTED (difference ≥ 5%):');
    console.log('-'.repeat(80));
    changed.forEach((result, index) => {
      const displayName = result.slug ? `${result.url} [${result.slug}]` : result.url;
      console.log(`${index + 1}. ${displayName}`);
      
      // Show what changed
      const changes = [];
      if (result.hasImageChanges) {
        changes.push(`Image: ${result.imageDifferencePercent}%`);
      }
      if (result.hasHtmlChanges) {
        changes.push(`HTML: ${result.htmlDifferencePercent}%`);
      }
      console.log(`   Changes: ${changes.join(', ')}`);
      
      console.log(`   Previous image: ${result.oldScreenshot}`);
      console.log(`   Current image:  ${result.newScreenshot}`);
      console.log(`   Previous HTML:  ${result.oldHtml}`);
      console.log(`   Current HTML:   ${result.newHtml}`);
      console.log('');
    });
  }
  
  // Summary
  console.log('='.repeat(80));
  console.log('SUMMARY:');
  console.log(`  New snapshots:       ${newScreenshots.length}`);
  console.log(`  No changes:          ${unchanged.length}`);
  console.log(`  With changes:        ${changed.length}`);
  console.log(`  Total processed:     ${results.length}`);
  console.log('='.repeat(80) + '\n');
}

module.exports = { generateReport };
