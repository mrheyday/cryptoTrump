/**
 * Contract Info Script
 * 
 * Retrieves information about a deployed CryptoTrump contract.
 * 
 * Usage: 
 * - Set CONTRACT_ADDRESS in .env
 * - Run: npx hardhat run scripts/contractInfo.js --network <network>
 */

const hre = require("hardhat");
require("dotenv").config();

async function main() {
  console.log('\n========================================');
  console.log('CryptoTrump Contract Info');
  console.log('========================================\n');

  // Get contract address from environment or command line
  const contractAddress = process.env.CONTRACT_ADDRESS_ETHEREUM || process.argv[2];
  
  if (!contractAddress) {
    console.error('❌ Error: Contract address not provided!');
    console.error('   Set CONTRACT_ADDRESS_ETHEREUM in .env or pass as argument');
    process.exit(1);
  }

  console.log('Network:', hre.network.name);
  console.log('Contract Address:', contractAddress);
  console.log('');

  // Get contract instance
  const CryptoTrump = await hre.ethers.getContractFactory('CryptoTrumpMarketplace');
  const cryptoTrump = CryptoTrump.attach(contractAddress);

  try {
    // Basic info
    console.log('📊 Basic Information:');
    const name = await cryptoTrump.name();
    const symbol = await cryptoTrump.symbol();
    const totalSupply = await cryptoTrump.TOTAL_TRUMPS();
    
    console.log('   Name:', name);
    console.log('   Symbol:', symbol);
    console.log('   Total Supply:', totalSupply.toString());
    console.log('');

    // Contract state
    console.log('📝 Contract State:');
    const allAssigned = await cryptoTrump.allTrumpsAssigned();
    const trumpsRemaining = await cryptoTrump.trumpsRemainingToAssign();
    const nextIndex = await cryptoTrump.nextTrumpIndexToAssign();
    const paused = await cryptoTrump.paused();
    
    console.log('   All Trumps Assigned:', allAssigned);
    console.log('   Trumps Remaining:', trumpsRemaining.toString());
    console.log('   Next Index:', nextIndex.toString());
    console.log('   Paused:', paused);
    console.log('');

    // Ownership
    console.log('👤 Ownership:');
    const owner = await cryptoTrump.owner();
    console.log('   Owner:', owner);
    console.log('');

    // Try to get base URI (might fail if not set)
    try {
      console.log('🌐 Metadata:');
      // Check if token 0 exists by trying to get its URI
      try {
        const tokenURI = await cryptoTrump.tokenURI(0);
        console.log('   Token 0 URI:', tokenURI);
      } catch (e) {
        console.log('   Base URI: Not set or no tokens minted yet');
      }
      console.log('');
    } catch (e) {
      console.log('   Metadata: Not accessible\n');
    }

    // Sample some Trump ownership (if any exist)
    console.log('🏛️  Sample Trump Ownership:');
    const sampleIds = [0, 1, 2, 45, 47];
    for (const id of sampleIds) {
      try {
        const trumpOwner = await cryptoTrump.trumpIndexToAddress(id);
        if (trumpOwner !== '0x0000000000000000000000000000000000000000') {
          console.log(`   Trump #${id}:`, trumpOwner);
        }
      } catch (e) {
        // Token doesn't exist or error, skip
      }
    }
    console.log('');

    console.log('✅ Contract information retrieved successfully!');
    
  } catch (error) {
    console.error('❌ Error retrieving contract information:');
    console.error('   ', error.message);
    console.log('');
    console.log('💡 Possible issues:');
    console.log('   - Contract address is incorrect');
    console.log('   - Network mismatch');
    console.log('   - RPC endpoint not responding');
    process.exit(1);
  }

  console.log('\n========================================\n');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
