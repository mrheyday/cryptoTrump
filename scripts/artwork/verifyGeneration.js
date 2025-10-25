/**
 * CryptoTrump Generation Verification Script
 * Verifies the integrity and uniqueness of generated artwork and metadata
 */

const fs = require('fs');
const path = require('path');

class GenerationVerifier {
  constructor() {
    this.artworkDir = path.join(__dirname, '../../artwork/images');
    this.metadataDir = path.join(__dirname, '../../artwork/metadata');
    this.artworkDataPath = path.join(__dirname, '../../artwork/artwork-data.json');
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Run all verification checks
   */
  async verify() {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║       🔍  CRYPTOTRUMP VERIFICATION SYSTEM  🔍             ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`);

    const checks = [
      { name: 'File Count', fn: () => this.checkFileCounts() },
      { name: 'Artwork Integrity', fn: () => this.checkArtworkIntegrity() },
      { name: 'Metadata Validity', fn: () => this.checkMetadataValidity() },
      { name: 'Uniqueness', fn: () => this.checkUniqueness() },
      { name: 'Special Editions', fn: () => this.checkSpecialEditions() },
      { name: 'Rarity Distribution', fn: () => this.checkRarityDistribution() },
      { name: 'Trait Distribution', fn: () => this.checkTraitDistribution() },
    ];

    for (const check of checks) {
      process.stdout.write(`\n🔍 ${check.name}... `);
      try {
        await check.fn();
        console.log('✅ PASSED');
      } catch (error) {
        console.log('❌ FAILED');
        this.errors.push(`${check.name}: ${error.message}`);
      }
    }

    // Display results
    this.displayResults();
  }

  /**
   * Check file counts
   */
  checkFileCounts() {
    const imageFiles = fs.readdirSync(this.artworkDir).filter(f => f.endsWith('.svg'));
    const metadataFiles = fs.readdirSync(this.metadataDir).filter(f => f.endsWith('.json'));

    if (imageFiles.length !== 10000) {
      throw new Error(`Expected 10000 images, found ${imageFiles.length}`);
    }

    if (metadataFiles.length !== 10001) { // 10000 + collection.json
      throw new Error(`Expected 10001 metadata files, found ${metadataFiles.length}`);
    }

    // Check sequential numbering
    for (let i = 0; i < 10000; i++) {
      if (!imageFiles.includes(`${i}.svg`)) {
        throw new Error(`Missing image file: ${i}.svg`);
      }
      if (!metadataFiles.includes(`${i}.json`)) {
        throw new Error(`Missing metadata file: ${i}.json`);
      }
    }
  }

  /**
   * Check artwork integrity
   */
  checkArtworkIntegrity() {
    let checkedCount = 0;
    const sampleSize = 100; // Check random 100 files

    for (let i = 0; i < sampleSize; i++) {
      const randomId = Math.floor(Math.random() * 10000);
      const filepath = path.join(this.artworkDir, `${randomId}.svg`);

      if (!fs.existsSync(filepath)) {
        throw new Error(`Image file not found: ${randomId}.svg`);
      }

      const content = fs.readFileSync(filepath, 'utf8');

      // Check SVG structure
      if (!content.includes('<?xml version="1.0"')) {
        throw new Error(`Invalid SVG format in ${randomId}.svg`);
      }

      if (!content.includes('<svg') || !content.includes('</svg>')) {
        throw new Error(`Incomplete SVG in ${randomId}.svg`);
      }

      // Check size
      if (content.length < 1000) {
        throw new Error(`SVG too small in ${randomId}.svg`);
      }

      checkedCount++;
    }

    if (checkedCount !== sampleSize) {
      throw new Error(`Only verified ${checkedCount}/${sampleSize} images`);
    }
  }

  /**
   * Check metadata validity
   */
  checkMetadataValidity() {
    let checkedCount = 0;
    const sampleSize = 100;

    for (let i = 0; i < sampleSize; i++) {
      const randomId = Math.floor(Math.random() * 10000);
      const filepath = path.join(this.metadataDir, `${randomId}.json`);

      if (!fs.existsSync(filepath)) {
        throw new Error(`Metadata file not found: ${randomId}.json`);
      }

      const content = fs.readFileSync(filepath, 'utf8');
      let metadata;

      try {
        metadata = JSON.parse(content);
      } catch (e) {
        throw new Error(`Invalid JSON in ${randomId}.json`);
      }

      // Check required fields
      const requiredFields = ['name', 'description', 'image', 'attributes'];
      for (const field of requiredFields) {
        if (!metadata[field]) {
          throw new Error(`Missing ${field} in ${randomId}.json`);
        }
      }

      // Check attributes
      if (!Array.isArray(metadata.attributes) || metadata.attributes.length === 0) {
        throw new Error(`Invalid attributes in ${randomId}.json`);
      }

      // Check name format
      if (metadata.name !== `CryptoTrump #${randomId}`) {
        throw new Error(`Incorrect name in ${randomId}.json`);
      }

      checkedCount++;
    }

    if (checkedCount !== sampleSize) {
      throw new Error(`Only verified ${checkedCount}/${sampleSize} metadata files`);
    }
  }

  /**
   * Check uniqueness
   */
  checkUniqueness() {
    if (!fs.existsSync(this.artworkDataPath)) {
      throw new Error('Artwork data file not found');
    }

    const artworkData = JSON.parse(fs.readFileSync(this.artworkDataPath, 'utf8'));

    if (artworkData.length !== 10000) {
      throw new Error(`Expected 10000 entries, found ${artworkData.length}`);
    }

    // Check hash uniqueness
    const hashes = new Set();
    const duplicates = [];

    artworkData.forEach(data => {
      if (hashes.has(data.hash)) {
        duplicates.push(data.tokenId);
      }
      hashes.add(data.hash);
    });

    if (duplicates.length > 0) {
      throw new Error(`Found ${duplicates.length} duplicate combinations`);
    }

    if (hashes.size !== 10000) {
      throw new Error(`Only ${hashes.size} unique combinations out of 10000`);
    }
  }

  /**
   * Check special editions
   */
  checkSpecialEditions() {
    const artworkData = JSON.parse(fs.readFileSync(this.artworkDataPath, 'utf8'));
    const specialEditions = artworkData.filter(d => d.special);

    // Expected special token IDs
    const expectedSpecialIds = [1, 100, 1000, 5000, 777, 6969, 420, 1337, 9999];

    for (const id of expectedSpecialIds) {
      const trump = artworkData.find(d => d.tokenId === id);
      if (!trump || !trump.special) {
        this.warnings.push(`Token #${id} should be a special edition but is not marked as such`);
      }
    }

    console.log(`\n   Found ${specialEditions.length} special editions`);
  }

  /**
   * Check rarity distribution
   */
  checkRarityDistribution() {
    const artworkData = JSON.parse(fs.readFileSync(this.artworkDataPath, 'utf8'));
    const distribution = {};

    artworkData.forEach(data => {
      distribution[data.rarityTier] = (distribution[data.rarityTier] || 0) + 1;
    });

    console.log(`\n   Rarity Distribution:`);
    Object.entries(distribution).forEach(([tier, count]) => {
      const percentage = ((count / 10000) * 100).toFixed(1);
      console.log(`   - ${tier}: ${count} (${percentage}%)`);
    });
  }

  /**
   * Check trait distribution
   */
  checkTraitDistribution() {
    const artworkData = JSON.parse(fs.readFileSync(this.artworkDataPath, 'utf8'));

    // Count traits
    const traitCounts = {};
    artworkData.forEach(data => {
      Object.entries(data.traits).forEach(([category, value]) => {
        if (!traitCounts[category]) {
          traitCounts[category] = {};
        }
        traitCounts[category][value] = (traitCounts[category][value] || 0) + 1;
      });
    });

    // Check for reasonable distribution (no trait should be > 50%)
    Object.entries(traitCounts).forEach(([category, traits]) => {
      Object.entries(traits).forEach(([trait, count]) => {
        const percentage = (count / 10000) * 100;
        if (percentage > 50) {
          this.warnings.push(`${category}:${trait} appears in ${percentage.toFixed(1)}% of tokens (>50%)`);
        }
      });
    });
  }

  /**
   * Display verification results
   */
  displayResults() {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`VERIFICATION RESULTS`);
    console.log(`${'='.repeat(60)}\n`);

    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log(`✅ ALL CHECKS PASSED!`);
      console.log(`\n🎉 Your CryptoTrump collection is ready for deployment!`);
    } else {
      if (this.errors.length > 0) {
        console.log(`❌ ERRORS (${this.errors.length}):\n`);
        this.errors.forEach((error, i) => {
          console.log(`   ${i + 1}. ${error}`);
        });
      }

      if (this.warnings.length > 0) {
        console.log(`\n⚠️  WARNINGS (${this.warnings.length}):\n`);
        this.warnings.forEach((warning, i) => {
          console.log(`   ${i + 1}. ${warning}`);
        });
      }
    }

    console.log(`\n${'='.repeat(60)}\n`);
  }
}

// Main execution
if (require.main === module) {
  const verifier = new GenerationVerifier();
  verifier.verify().catch(console.error);
}

module.exports = GenerationVerifier;
