/**
 * Set Base URI for CryptoTrump NFT Contract
 *
 * This script sets the base URI on the deployed CryptoTrumpMarketplace contract
 * to point to the IPFS metadata folder.
 *
 * Usage:
 * 1. Deploy contract first
 * 2. Upload metadata to IPFS
 * 3. Update METADATA_CID and CONTRACT_ADDRESS below
 * 4. Run: npx hardhat run scripts/setBaseURI.js --network <network>
 */

const hre = require("hardhat");

// ========================================
// CONFIGURATION
// ========================================

// IMPORTANT: Replace these with your actual values!
const METADATA_CID = 'YOUR_METADATA_CID_HERE';
const CONTRACT_ADDRESS = 'YOUR_CONTRACT_ADDRESS_HERE';

// ========================================
// MAIN FUNCTION
// ========================================

async function main() {
  console.log('\n========================================');
  console.log('🇺🇸 CryptoTrump BaseURI Setter 🇺🇸');
  console.log('========================================\n');

  // Validate inputs
  if (METADATA_CID === 'YOUR_METADATA_CID_HERE') {
    console.error('❌ ERROR: Please set METADATA_CID to your IPFS CID!');
    console.error('   Edit this file and replace YOUR_METADATA_CID_HERE with your CID.');
    process.exit(1);
  }

  if (CONTRACT_ADDRESS === 'YOUR_CONTRACT_ADDRESS_HERE') {
    console.error('❌ ERROR: Please set CONTRACT_ADDRESS to your deployed contract!');
    console.error('   Edit this file and replace YOUR_CONTRACT_ADDRESS_HERE with your address.');
    process.exit(1);
  }

  // Validate CID format
  if (!METADATA_CID.startsWith('Qm') && !METADATA_CID.startsWith('bafy')) {
    console.error('❌ ERROR: Invalid IPFS CID format!');
    console.error('   CID should start with "Qm" or "bafy"');
    process.exit(1);
  }

  // Construct base URI
  const BASE_URI = `ipfs://${METADATA_CID}/`;

  console.log('Network:', hre.network.name);
  console.log('Contract Address:', CONTRACT_ADDRESS);
  console.log('Metadata CID:', METADATA_CID);
  console.log('Base URI:', BASE_URI);
  console.log('');

  // Get signer
  const [signer] = await hre.ethers.getSigners();
  console.log('Signer:', signer.address);

  // Get contract
  const CryptoTrump = await hre.ethers.getContractFactory('CryptoTrumpMarketplace');
  const cryptoTrump = CryptoTrump.attach(CONTRACT_ADDRESS);

  console.log('\n📝 Setting base URI...');

  try {
    // Set base URI
    const tx = await cryptoTrump.setBaseURI(BASE_URI);
    console.log('Transaction sent:', tx.hash);
    console.log('Waiting for confirmation...');

    const receipt = await tx.wait();
    console.log('✅ Transaction confirmed!');
    console.log('Block:', receipt.blockNumber);
    console.log('Gas used:', receipt.gasUsed.toString());

    // Verify by checking tokenURI for a few tokens
    console.log('\n🔍 Verifying tokenURIs...');

    const tokensToCheck = [0, 1, 100];
    for (const tokenId of tokensToCheck) {
      try {
        const tokenURI = await cryptoTrump.tokenURI(tokenId);
        console.log(`Token ${tokenId}: ${tokenURI}`);
      } catch (error) {
        console.log(`Token ${tokenId}: Not yet minted or assigned`);
      }
    }

    console.log('\n========================================');
    console.log('✅ Base URI Set Successfully!');
    console.log('========================================');
    console.log('\nYour NFTs will now resolve to:');
    console.log(`Token 0: ${BASE_URI}0.json`);
    console.log(`Token 1: ${BASE_URI}1.json`);
    console.log('...');
    console.log(`Token 9999: ${BASE_URI}9999.json`);
    console.log('\nIPFS Gateway URLs:');
    console.log(`https://ipfs.io/ipfs/${METADATA_CID}/0.json`);
    console.log(`https://gateway.pinata.cloud/ipfs/${METADATA_CID}/0.json`);
    console.log(`https://cloudflare-ipfs.com/ipfs/${METADATA_CID}/0.json`);
    console.log('\n🇺🇸 Make NFTs Great Again! 🇺🇸\n');

  } catch (error) {
    console.error('\n❌ Error setting base URI:', error.message);
    if (error.reason) {
      console.error('Reason:', error.reason);
    }
    process.exit(1);
  }
}

// ========================================
// ERROR HANDLING
// ========================================

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Unexpected error:', error);
    process.exit(1);
  });
