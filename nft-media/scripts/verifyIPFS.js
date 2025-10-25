/**
 * Verify IPFS Upload for CryptoTrump NFTs
 *
 * This script verifies that all images and metadata are accessible via IPFS
 * after uploading.
 *
 * Usage:
 * 1. Upload images and metadata to IPFS
 * 2. Update IMAGES_CID and METADATA_CID below
 * 3. Run: node verifyIPFS.js
 */

const https = require('https');
const http = require('http');

// ========================================
// CONFIGURATION
// ========================================

// IMPORTANT: Replace these with your actual IPFS CIDs!
const IMAGES_CID = 'YOUR_IMAGES_CID_HERE';
const METADATA_CID = 'YOUR_METADATA_CID_HERE';

// IPFS Gateways to test
const GATEWAYS = [
  'https://ipfs.io/ipfs',
  'https://gateway.pinata.cloud/ipfs',
  'https://cloudflare-ipfs.com/ipfs',
  'https://dweb.link/ipfs'
];

// Sample tokens to verify
const SAMPLE_TOKENS = [0, 1, 100, 500, 1000, 5000, 9999];

// ========================================
// HELPER FUNCTIONS
// ========================================

function fetchURL(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const startTime = Date.now();

    protocol.get(url, { timeout: 10000 }, (res) => {
      const duration = Date.now() - startTime;

      if (res.statusCode === 200) {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            success: true,
            statusCode: res.statusCode,
            duration,
            data: data.substring(0, 500) // First 500 chars
          });
        });
      } else {
        resolve({
          success: false,
          statusCode: res.statusCode,
          duration,
          error: `HTTP ${res.statusCode}`
        });
      }
    }).on('error', (error) => {
      const duration = Date.now() - startTime;
      resolve({
        success: false,
        duration,
        error: error.message
      });
    }).on('timeout', () => {
      resolve({
        success: false,
        duration: 10000,
        error: 'Timeout'
      });
    });
  });
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ========================================
// VERIFICATION FUNCTIONS
// ========================================

async function verifyImageAccess(gateway, tokenId) {
  const url = `${gateway}/${IMAGES_CID}/${tokenId}.png`;
  console.log(`   Testing: ${url}`);

  const result = await fetchURL(url);

  if (result.success) {
    console.log(`   ✅ Success (${result.duration}ms)`);
    return true;
  } else {
    console.log(`   ❌ Failed: ${result.error} (${result.duration}ms)`);
    return false;
  }
}

async function verifyMetadataAccess(gateway, tokenId) {
  const url = `${gateway}/${METADATA_CID}/${tokenId}.json`;
  console.log(`   Testing: ${url}`);

  const result = await fetchURL(url);

  if (result.success) {
    console.log(`   ✅ Success (${result.duration}ms)`);

    // Verify metadata structure
    try {
      const metadata = JSON.parse(result.data);
      const expectedImage = `ipfs://${IMAGES_CID}/${tokenId}.png`;

      if (metadata.image === expectedImage) {
        console.log(`   ✅ Image URL correct: ${metadata.image}`);
      } else {
        console.log(`   ⚠️  Image URL mismatch!`);
        console.log(`      Expected: ${expectedImage}`);
        console.log(`      Got: ${metadata.image}`);
      }

      if (metadata.name && metadata.description && metadata.attributes) {
        console.log(`   ✅ Metadata structure valid`);
      } else {
        console.log(`   ⚠️  Metadata structure incomplete`);
      }

      return true;
    } catch (error) {
      console.log(`   ❌ Invalid JSON: ${error.message}`);
      return false;
    }
  } else {
    console.log(`   ❌ Failed: ${result.error} (${result.duration}ms)`);
    return false;
  }
}

// ========================================
// MAIN VERIFICATION
// ========================================

async function main() {
  console.log('\n========================================');
  console.log('🇺🇸 CryptoTrump IPFS Verifier 🇺🇸');
  console.log('========================================\n');

  // Validate CIDs are set
  if (IMAGES_CID === 'YOUR_IMAGES_CID_HERE' || METADATA_CID === 'YOUR_METADATA_CID_HERE') {
    console.error('❌ ERROR: Please set IMAGES_CID and METADATA_CID!');
    console.error('   Edit this file and replace the placeholder values.');
    process.exit(1);
  }

  console.log('Images CID:', IMAGES_CID);
  console.log('Metadata CID:', METADATA_CID);
  console.log('Sample Tokens:', SAMPLE_TOKENS.join(', '));
  console.log('Gateways to test:', GATEWAYS.length);
  console.log('');

  const results = {
    imagesSuccess: 0,
    imagesFailed: 0,
    metadataSuccess: 0,
    metadataFailed: 0,
    gatewayResults: {}
  };

  // Test each gateway
  for (const gateway of GATEWAYS) {
    console.log(`\n📡 Testing Gateway: ${gateway}`);
    console.log('─'.repeat(60));

    results.gatewayResults[gateway] = {
      images: 0,
      metadata: 0
    };

    // Test a sample token
    const sampleToken = SAMPLE_TOKENS[0];

    console.log(`\n🖼️  Testing Image Access (Token ${sampleToken}):`);
    const imageSuccess = await verifyImageAccess(gateway, sampleToken);
    if (imageSuccess) {
      results.imagesSuccess++;
      results.gatewayResults[gateway].images++;
    } else {
      results.imagesFailed++;
    }

    await sleep(500); // Rate limiting

    console.log(`\n📄 Testing Metadata Access (Token ${sampleToken}):`);
    const metadataSuccess = await verifyMetadataAccess(gateway, sampleToken);
    if (metadataSuccess) {
      results.metadataSuccess++;
      results.gatewayResults[gateway].metadata++;
    } else {
      results.metadataFailed++;
    }

    await sleep(500); // Rate limiting
  }

  // Test additional sample tokens on primary gateway
  const primaryGateway = GATEWAYS[0];
  console.log(`\n\n📝 Testing Additional Samples on ${primaryGateway}`);
  console.log('─'.repeat(60));

  for (const tokenId of SAMPLE_TOKENS.slice(1)) {
    console.log(`\nToken ${tokenId}:`);

    const metadataSuccess = await verifyMetadataAccess(primaryGateway, tokenId);
    await sleep(300); // Rate limiting
  }

  // Summary
  console.log('\n\n========================================');
  console.log('Verification Summary');
  console.log('========================================\n');

  console.log('Gateway Results:');
  for (const [gateway, result] of Object.entries(results.gatewayResults)) {
    const shortName = gateway.replace('https://', '').split('/')[0];
    const imageStatus = result.images > 0 ? '✅' : '❌';
    const metadataStatus = result.metadata > 0 ? '✅' : '❌';
    console.log(`  ${imageStatus} ${metadataStatus} ${shortName}`);
  }

  console.log('');
  console.log(`Images Accessible: ${results.imagesSuccess}/${GATEWAYS.length} gateways`);
  console.log(`Metadata Accessible: ${results.metadataSuccess}/${GATEWAYS.length} gateways`);
  console.log('');

  // Recommendations
  if (results.imagesSuccess === 0 || results.metadataSuccess === 0) {
    console.log('❌ CRITICAL: Content not accessible on any gateway!');
    console.log('');
    console.log('Possible issues:');
    console.log('  - CIDs are incorrect');
    console.log('  - Content not yet propagated to IPFS network (wait 5-10 minutes)');
    console.log('  - Upload failed or was not pinned');
    console.log('  - Network connectivity issues');
    console.log('');
    console.log('Next steps:');
    console.log('  1. Verify CIDs are correct');
    console.log('  2. Wait 5-10 minutes for IPFS propagation');
    console.log('  3. Check your pinning service (Pinata, NFT.Storage, etc.)');
    console.log('  4. Try re-uploading to IPFS');
  } else if (results.imagesSuccess < GATEWAYS.length || results.metadataSuccess < GATEWAYS.length) {
    console.log('⚠️  WARNING: Content accessible but not on all gateways');
    console.log('');
    console.log('This is normal during initial propagation.');
    console.log('Wait 5-10 minutes and test again.');
  } else {
    console.log('✅ SUCCESS: Content fully accessible!');
    console.log('');
    console.log('Your NFTs are ready! 🎉');
    console.log('');
    console.log('Next steps:');
    console.log('  1. Set contract baseURI: npx hardhat run scripts/setBaseURI.js');
    console.log('  2. Test on OpenSea testnet');
    console.log('  3. Deploy to mainnet after security audit');
  }

  console.log('\n🇺🇸 Make Verification Great Again! 🇺🇸\n');
}

// ========================================
// RUN
// ========================================

main().catch((error) => {
  console.error('\n❌ Unexpected error:', error);
  process.exit(1);
});
