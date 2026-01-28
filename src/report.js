/**
 * Generates and displays a report of screenshot comparisons
 * @param {Array} results - Array of result objects
 */
function generateReport(results) {
  console.log('\n' + '='.repeat(80));
  console.log('RAPORT PORÓWNANIA ZRZUTÓW EKRANU');
  console.log('='.repeat(80) + '\n');
  
  // Separate results by type
  const newScreenshots = results.filter(r => r.type === 'new');
  const unchanged = results.filter(r => r.type === 'unchanged');
  const changed = results.filter(r => r.type === 'changed');
  
  // New screenshots
  if (newScreenshots.length > 0) {
    console.log('📸 NOWE ZRZUTY:');
    console.log('-'.repeat(80));
    newScreenshots.forEach((result, index) => {
      const displayName = result.slug ? `${result.url} [${result.slug}]` : result.url;
      console.log(`${index + 1}. ${displayName}`);
      console.log(`   Obraz: ${result.newScreenshot}`);
      console.log(`   HTML:  ${result.newHtml}`);
      console.log('');
    });
  }
  
  // Unchanged
  if (unchanged.length > 0) {
    console.log('✅ BEZ ZMIAN (różnica < 5%):');
    console.log('-'.repeat(80));
    unchanged.forEach((result, index) => {
      const displayName = result.slug ? `${result.url} [${result.slug}]` : result.url;
      console.log(`${index + 1}. ${displayName}`);
      console.log(`   Różnica obrazu: ${result.imageDifferencePercent}%`);
      console.log(`   Różnica HTML:   ${result.htmlDifferencePercent}%`);
      console.log(`   Aktualny obraz: ${result.newScreenshot}`);
      console.log(`   Aktualny HTML:  ${result.newHtml}`);
      console.log('');
    });
  }
  
  // Changed
  if (changed.length > 0) {
    console.log('🔴 WYKRYTO ZMIANY (różnica ≥ 5%):');
    console.log('-'.repeat(80));
    changed.forEach((result, index) => {
      const displayName = result.slug ? `${result.url} [${result.slug}]` : result.url;
      console.log(`${index + 1}. ${displayName}`);
      
      // Show what changed
      const changes = [];
      if (result.hasImageChanges) {
        changes.push(`Obraz: ${result.imageDifferencePercent}%`);
      }
      if (result.hasHtmlChanges) {
        changes.push(`HTML: ${result.htmlDifferencePercent}%`);
      }
      console.log(`   Zmiany: ${changes.join(', ')}`);
      
      console.log(`   Poprzedni obraz: ${result.oldScreenshot}`);
      console.log(`   Aktualny obraz:  ${result.newScreenshot}`);
      console.log(`   Poprzedni HTML:  ${result.oldHtml}`);
      console.log(`   Aktualny HTML:   ${result.newHtml}`);
      console.log('');
    });
  }
  
  // Summary
  console.log('='.repeat(80));
  console.log('PODSUMOWANIE:');
  console.log(`  Nowe zrzuty:        ${newScreenshots.length}`);
  console.log(`  Bez zmian:          ${unchanged.length}`);
  console.log(`  Ze zmianami:        ${changed.length}`);
  console.log(`  Razem przetworzono: ${results.length}`);
  console.log('='.repeat(80) + '\n');
}

module.exports = { generateReport };
