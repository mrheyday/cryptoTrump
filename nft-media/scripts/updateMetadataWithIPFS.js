/**
 * Update Metadata Files with IPFS CID
 *
 * This script updates all 10,000 metadata JSON files with the actual IPFS CID
 * for the images after they've been uploaded to IPFS.
 *
 * Usage:
 * 1. Upload images folder to IPFS first
 * 2. Copy the images IPFS CID
 * 3. Replace IMAGES_IPFS_CID below with your actual CID
 * 4. Run: node updateMetadataWithIPFS.js
 */

const fs = require('fs');
const path = require('path');

// ========================================
// CONFIGURATION
// ========================================

// IMPORTANT: Replace this with your actual images IPFS CID after upload!
const IMAGES_IPFS_CID = 'YOUR_IMAGES_CID_HERE';

// Path to metadata folder
const METADATA_DIR = path.join(__dirname, '..', 'metadata');

// Total number of NFTs
const TOTAL_NFTS = 10000;

// ========================================
// MAIN FUNCTION
// ========================================

function updateMetadataFiles() {
  console.log('========================================');
  console.log('CryptoTrump Metadata IPFS Updater');
  console.log('========================================\n');

  // Validate CID is set
  if (IMAGES_IPFS_CID === 'YOUR_IMAGES_CID_HERE') {
    console.error('❌ ERROR: Please set IMAGES_IPFS_CID to your actual IPFS CID!');
    console.error('   Edit this file and replace YOUR_IMAGES_CID_HERE with your CID.');
    process.exit(1);
  }

  // Validate CID format (basic check)
  if (!IMAGES_IPFS_CID.startsWith('Qm') && !IMAGES_IPFS_CID.startsWith('bafy')) {
    console.error('❌ ERROR: Invalid IPFS CID format!');
    console.error('   CID should start with "Qm" or "bafy"');
    console.error('   Your CID:', IMAGES_IPFS_CID);
    process.exit(1);
  }

  // Validate metadata directory exists
  if (!fs.existsSync(METADATA_DIR)) {
    console.error('❌ ERROR: Metadata directory not found!');
    console.error('   Expected path:', METADATA_DIR);
    process.exit(1);
  }

  console.log('Images IPFS CID:', IMAGES_IPFS_CID);
  console.log('Metadata Directory:', METADATA_DIR);
  console.log('Total NFTs to update:', TOTAL_NFTS);
  console.log('\nUpdating metadata files...\n');

  let updated = 0;
  let errors = 0;
  const startTime = Date.now();

  // Update each metadata file
  for (let i = 0; i < TOTAL_NFTS; i++) {
    const metadataPath = path.join(METADATA_DIR, `${i}.json`);

    try {
      // Check if file exists
      if (!fs.existsSync(metadataPath)) {
        console.error(`⚠️  Warning: File not found: ${i}.json`);
        errors++;
        continue;
      }

      // Read metadata file
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

      // Update image URL with IPFS CID
      metadata.image = `ipfs://${IMAGES_IPFS_CID}/${i}.png`;

      // Write updated metadata back to file
      fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

      updated++;

      // Progress indicator every 1000 files
      if (updated % 1000 === 0) {
        console.log(`✅ Updated ${updated} files...`);
      }

    } catch (error) {
      console.error(`❌ Error updating ${i}.json:`, error.message);
      errors++;
    }
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  console.log('\n========================================');
  console.log('Update Complete!');
  console.log('========================================');
  console.log(`✅ Successfully updated: ${updated} files`);
  if (errors > 0) {
    console.log(`❌ Errors: ${errors} files`);
  }
  console.log(`⏱️  Time taken: ${duration}s`);
  console.log('\nNext Steps:');
  console.log('1. Verify a few metadata files manually');
  console.log('2. Upload the metadata folder to IPFS');
  console.log('3. Copy the metadata IPFS CID');
  console.log('4. Set the contract baseURI to: ipfs://METADATA_CID/');
  console.log('\n🇺🇸 Make Metadata Great Again! 🇺🇸\n');
}

// ========================================
// VERIFICATION FUNCTION
// ========================================

function verifyUpdate() {
  console.log('\n========================================');
  console.log('Verifying Updated Metadata...');
  console.log('========================================\n');

  const samplesToCheck = [0, 1, 100, 500, 1000, 5000, 9999];
  let allValid = true;

  for (const tokenId of samplesToCheck) {
    const metadataPath = path.join(METADATA_DIR, `${tokenId}.json`);

    if (!fs.existsSync(metadataPath)) {
      console.log(`❌ Token ${tokenId}: File not found`);
      allValid = false;
      continue;
    }

    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    const expectedImageURL = `ipfs://${IMAGES_IPFS_CID}/${tokenId}.png`;

    if (metadata.image === expectedImageURL) {
      console.log(`✅ Token ${tokenId}: ${metadata.image}`);
    } else {
      console.log(`❌ Token ${tokenId}: URL mismatch`);
      console.log(`   Expected: ${expectedImageURL}`);
      console.log(`   Got: ${metadata.image}`);
      allValid = false;
    }
  }

  console.log('\n========================================');
  if (allValid) {
    console.log('✅ All sample metadata files verified successfully!');
  } else {
    console.log('❌ Some metadata files have issues. Please check above.');
  }
  console.log('========================================\n');
}

// ========================================
// RUN
// ========================================

// Run the update
updateMetadataFiles();

// Verify the update
if (IMAGES_IPFS_CID !== 'YOUR_IMAGES_CID_HERE') {
  verifyUpdate();
}
