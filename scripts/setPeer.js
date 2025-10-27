/**
 * Set LayerZero Peer Script
 * 
 * Configures LayerZero peer contracts for cross-chain transfers.
 * 
 * Usage: npx hardhat run scripts/setPeer.js --network <network>
 * 
 * Before running, set these environment variables:
 * - CONTRACT_ADDRESS_<NETWORK> for each network
 * - Or edit the PEERS object below
 */

const hre = require("hardhat");
require("dotenv").config();

// LayerZero V2 Endpoint IDs
const LZ_CHAIN_IDS = {
  ethereum: 30101,
  polygon: 30109,
  arbitrum: 30110,
  optimism: 30111,
  base: 30184,
  sepolia: 40161,
  mumbai: 40109,
  'arbitrum-sepolia': 40231,
  'optimism-sepolia': 40232,
  'base-sepolia': 40245,
};

// Contract addresses on each network
// Update these with your deployed contract addresses
const PEERS = {
  ethereum: process.env.CONTRACT_ADDRESS_ETHEREUM || '',
  polygon: process.env.CONTRACT_ADDRESS_POLYGON || '',
  arbitrum: process.env.CONTRACT_ADDRESS_ARBITRUM || '',
  optimism: process.env.CONTRACT_ADDRESS_OPTIMISM || '',
  base: process.env.CONTRACT_ADDRESS_BASE || '',
};

async function main() {
  console.log('\n========================================');
  console.log('LayerZero Peer Configuration');
  console.log('========================================\n');

  const currentNetwork = hre.network.name;
  console.log('Current Network:', currentNetwork);
  
  // Get current contract address
  const currentAddress = PEERS[currentNetwork];
  if (!currentAddress) {
    console.error('❌ Error: Contract address not found for', currentNetwork);
    console.error('   Set CONTRACT_ADDRESS_' + currentNetwork.toUpperCase() + ' in .env');
    process.exit(1);
  }

  console.log('Current Contract:', currentAddress);
  console.log('');

  // Get contract instance
  const CryptoTrump = await hre.ethers.getContractFactory('CryptoTrumpMarketplace');
  const cryptoTrump = CryptoTrump.attach(currentAddress);

  // Get signer
  const [signer] = await hre.ethers.getSigners();
  console.log('Signer:', signer.address);
  console.log('');

  // Set peers for all other networks
  let successCount = 0;
  let errorCount = 0;

  for (const [networkName, peerAddress] of Object.entries(PEERS)) {
    // Skip current network
    if (networkName === currentNetwork) continue;
    
    // Skip if peer address not set
    if (!peerAddress) {
      console.log(`⏭️  Skipping ${networkName}: No contract address configured`);
      continue;
    }

    // Get LayerZero chain ID
    const lzChainId = LZ_CHAIN_IDS[networkName];
    if (!lzChainId) {
      console.log(`⚠️  Warning: LayerZero chain ID not found for ${networkName}`);
      continue;
    }

    console.log(`📡 Setting peer for ${networkName}:`);
    console.log(`   Chain ID: ${lzChainId}`);
    console.log(`   Peer Address: ${peerAddress}`);

    try {
      // Convert address to bytes32 format for LayerZero
      const peerBytes32 = hre.ethers.zeroPadValue(peerAddress, 32);
      
      // Set peer
      const tx = await cryptoTrump.setPeer(lzChainId, peerBytes32);
      console.log(`   Transaction: ${tx.hash}`);
      console.log(`   Waiting for confirmation...`);
      
      await tx.wait();
      
      console.log(`   ✅ Peer set successfully!\n`);
      successCount++;
      
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}\n`);
      errorCount++;
    }
  }

  console.log('========================================');
  console.log('Summary:');
  console.log(`✅ Successful: ${successCount}`);
  if (errorCount > 0) {
    console.log(`❌ Errors: ${errorCount}`);
  }
  console.log('========================================\n');

  // Verify peers
  console.log('🔍 Verifying peers...\n');
  for (const [networkName, peerAddress] of Object.entries(PEERS)) {
    if (networkName === currentNetwork || !peerAddress) continue;
    
    const lzChainId = LZ_CHAIN_IDS[networkName];
    if (!lzChainId) continue;

    try {
      const peer = await cryptoTrump.peers(lzChainId);
      const peerBytes32 = hre.ethers.zeroPadValue(peerAddress, 32);
      
      if (peer.toLowerCase() === peerBytes32.toLowerCase()) {
        console.log(`✅ ${networkName}: Peer verified`);
      } else {
        console.log(`⚠️  ${networkName}: Peer mismatch!`);
        console.log(`   Expected: ${peerBytes32}`);
        console.log(`   Got: ${peer}`);
      }
    } catch (error) {
      console.log(`❌ ${networkName}: Verification failed - ${error.message}`);
    }
  }

  console.log('\n========================================');
  console.log('Peer configuration complete!');
  console.log('========================================\n');

  console.log('💡 Next steps:');
  console.log('1. Repeat this process on all other networks');
  console.log('2. Test cross-chain transfer');
  console.log('3. Verify transfers work in both directions\n');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Unexpected error:', error);
    process.exit(1);
  });
