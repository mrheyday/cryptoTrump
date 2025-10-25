/**
 * CryptoTrump Master Generation Script
 * Orchestrates the complete artwork and metadata generation process
 */

const TrumpArtworkGenerator = require('./generateArtwork');
const TrumpMetadataGenerator = require('./generateMetadata');
const IPFSPreparation = require('./prepareIPFS');

class MasterGenerator {
  constructor(options = {}) {
    this.options = {
      count: options.count || 10000,
      skipArtwork: options.skipArtwork || false,
      skipMetadata: options.skipMetadata || false,
      skipIPFS: options.skipIPFS || false,
    };
  }

  async run() {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║         🇺🇸  CRYPTOTRUMP NFT GENERATOR  🇺🇸                ║
║                                                           ║
║              Make NFTs Great Again!                       ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`);

    const startTime = Date.now();

    try {
      // Step 1: Generate Artwork
      if (!this.options.skipArtwork) {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`STEP 1: GENERATING ARTWORK`);
        console.log(`${'='.repeat(60)}\n`);

        const artworkGenerator = new TrumpArtworkGenerator();
        await artworkGenerator.generateAll(this.options.count);
      } else {
        console.log(`\n⏭️  Skipping artwork generation`);
      }

      // Step 2: Generate Metadata
      if (!this.options.skipMetadata) {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`STEP 2: GENERATING METADATA`);
        console.log(`${'='.repeat(60)}\n`);

        const metadataGenerator = new TrumpMetadataGenerator();
        await metadataGenerator.generateAll();
      } else {
        console.log(`\n⏭️  Skipping metadata generation`);
      }

      // Step 3: Prepare for IPFS
      if (!this.options.skipIPFS) {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`STEP 3: PREPARING FOR IPFS UPLOAD`);
        console.log(`${'='.repeat(60)}\n`);

        const ipfsPrep = new IPFSPreparation();
        await ipfsPrep.prepare();
        await ipfsPrep.createTestUpload();
      } else {
        console.log(`\n⏭️  Skipping IPFS preparation`);
      }

      // Summary
      const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);

      console.log(`
${'='.repeat(60)}
🎉 GENERATION COMPLETE!
${'='.repeat(60)}

⏱️  Total time: ${totalTime}s (${(totalTime / 60).toFixed(1)} minutes)
📊 Generated: ${this.options.count} unique CryptoTrumps
✅ Artwork: ${!this.options.skipArtwork ? 'Generated' : 'Skipped'}
✅ Metadata: ${!this.options.skipMetadata ? 'Generated' : 'Skipped'}
✅ IPFS Ready: ${!this.options.skipIPFS ? 'Prepared' : 'Skipped'}

${'='.repeat(60)}
NEXT STEPS:
${'='.repeat(60)}

1. Review the generated artwork in: artwork/images/
2. Check metadata in: artwork/metadata/
3. Follow IPFS upload instructions in: artwork/ipfs-ready/UPLOAD_INSTRUCTIONS.md
4. Test with the sample upload first: artwork/ipfs-ready/test-sample/
5. After IPFS upload, update contract base URI

${'='.repeat(60)}

🇺🇸 Make NFTs Great Again! 🇺🇸

`);

    } catch (error) {
      console.error(`\n❌ Error during generation:`, error);
      throw error;
    }
  }
}

// CLI Support
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};

  // Parse command line arguments
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
CryptoTrump NFT Generator

Usage: node generateAll.js [options]

Options:
  --count <number>     Number of Trumps to generate (default: 10000)
  --skip-artwork       Skip artwork generation
  --skip-metadata      Skip metadata generation
  --skip-ipfs          Skip IPFS preparation
  --help, -h           Show this help message

Examples:
  # Generate all 10,000 Trumps
  node generateAll.js

  # Generate only 100 for testing
  node generateAll.js --count 100

  # Only regenerate metadata
  node generateAll.js --skip-artwork

  # Only prepare IPFS upload
  node generateAll.js --skip-artwork --skip-metadata
`);
    process.exit(0);
  }

  // Parse count
  const countIndex = args.indexOf('--count');
  if (countIndex !== -1 && args[countIndex + 1]) {
    options.count = parseInt(args[countIndex + 1]);
  }

  // Parse flags
  options.skipArtwork = args.includes('--skip-artwork');
  options.skipMetadata = args.includes('--skip-metadata');
  options.skipIPFS = args.includes('--skip-ipfs');

  // Run generator
  const generator = new MasterGenerator(options);
  generator.run().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = MasterGenerator;
