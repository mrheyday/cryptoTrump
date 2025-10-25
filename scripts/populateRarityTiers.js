const hre = require("hardhat");
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Populate rarity tiers from artwork metadata
 *
 * This script reads the generated artwork metadata and populates
 * the rarity tiers in the CryptoTrumpMarketplace contract.
 *
 * Usage:
 * 1. Update MARKETPLACE_ADDRESS with your deployed contract
 * 2. Run: npx hardhat run scripts/populateRarityTiers.js --network <network>
 */

// ============ Configuration ============

const MARKETPLACE_ADDRESS = "YOUR_MARKETPLACE_CONTRACT_ADDRESS"; // Update this!
const METADATA_DIR = path.join(__dirname, "../artwork/metadata");
const TOTAL_TRUMPS = 10000;
const BATCH_SIZE = 100; // Process 100 Trumps per transaction

// ============ Main Function ============

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = hre.network.name;

  console.log("╔════════════════════════════════════════════════════╗");
  console.log("║     🎨 CryptoTrump Rarity Tier Populator 🎨       ║");
  console.log("╚════════════════════════════════════════════════════╝");
  console.log();
  console.log("Network:", network);
  console.log("Deployer:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
  console.log("Marketplace:", MARKETPLACE_ADDRESS);
  console.log();

  // Validate configuration
  if (MARKETPLACE_ADDRESS === "YOUR_MARKETPLACE_CONTRACT_ADDRESS") {
    console.error("❌ Error: Please update MARKETPLACE_ADDRESS in the script!");
    console.error("   Set it to your deployed CryptoTrumpMarketplace address.");
    process.exit(1);
  }

  // Check metadata directory
  if (!fs.existsSync(METADATA_DIR)) {
    console.error("❌ Error: Metadata directory not found!");
    console.error("   Expected:", METADATA_DIR);
    console.error("   Run artwork generation scripts first.");
    process.exit(1);
  }

  // Get contract instance
  console.log("📡 Connecting to CryptoTrumpMarketplace...");
  const marketplace = await ethers.getContractAt("CryptoTrumpMarketplace", MARKETPLACE_ADDRESS);

  // Verify deployer is owner
  const owner = await marketplace.owner();
  if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
    console.error("❌ Error: Only contract owner can set rarity tiers!");
    console.error("   Owner:", owner);
    console.error("   Your address:", deployer.address);
    process.exit(1);
  }

  console.log("✅ Contract connected");
  console.log("✅ Ownership verified");
  console.log();

  // ============ Read Metadata ============
  console.log("╔════════════════════════════════════════════════════╗");
  console.log("║       Step 1: Reading Artwork Metadata             ║");
  console.log("╚════════════════════════════════════════════════════╝");
  console.log("📖 Reading metadata files...");
  console.log();

  const rarityData = [];
  const rarityCount = {
    "Common": 0,
    "Uncommon": 0,
    "Rare": 0,
    "Epic": 0,
    "Legendary": 0,
    "Mythic": 0,
  };

  for (let i = 0; i < TOTAL_TRUMPS; i++) {
    const metadataPath = path.join(METADATA_DIR, `${i}.json`);

    if (!fs.existsSync(metadataPath)) {
      console.error(`❌ Error: Metadata file not found for Trump #${i}`);
      console.error(`   Expected: ${metadataPath}`);
      process.exit(1);
    }

    try {
      const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));

      // Find rarity tier attribute
      const rarityAttr = metadata.attributes.find(
        (attr) => attr.trait_type === "Rarity Tier"
      );

      if (!rarityAttr) {
        console.error(`❌ Error: Rarity Tier not found in metadata for Trump #${i}`);
        process.exit(1);
      }

      const rarity = rarityAttr.value;
      rarityData.push({
        trumpId: i,
        rarity: rarity,
      });

      rarityCount[rarity] = (rarityCount[rarity] || 0) + 1;

      // Progress indicator
      if ((i + 1) % 1000 === 0) {
        console.log(`   ✅ Read ${i + 1} / ${TOTAL_TRUMPS} metadata files...`);
      }
    } catch (error) {
      console.error(`❌ Error reading metadata for Trump #${i}:`, error.message);
      process.exit(1);
    }
  }

  console.log();
  console.log("✅ All metadata files read successfully!");
  console.log();
  console.log("📊 Rarity Distribution:");
  Object.keys(rarityCount).forEach((rarity) => {
    const count = rarityCount[rarity];
    const percentage = ((count / TOTAL_TRUMPS) * 100).toFixed(2);
    console.log(`   ${rarity.padEnd(12)}: ${count.toString().padStart(5)} (${percentage}%)`);
  });
  console.log();

  // ============ Populate Contract ============
  console.log("╔════════════════════════════════════════════════════╗");
  console.log("║      Step 2: Populating Contract Data              ║");
  console.log("╚════════════════════════════════════════════════════╝");
  console.log(`🔄 Processing in batches of ${BATCH_SIZE}...`);
  console.log();

  const totalBatches = Math.ceil(TOTAL_TRUMPS / BATCH_SIZE);
  let processedCount = 0;
  let successfulBatches = 0;
  let failedBatches = 0;

  for (let batchNum = 0; batchNum < totalBatches; batchNum++) {
    const startIdx = batchNum * BATCH_SIZE;
    const endIdx = Math.min(startIdx + BATCH_SIZE, TOTAL_TRUMPS);
    const batchData = rarityData.slice(startIdx, endIdx);

    const trumpIds = batchData.map((d) => d.trumpId);
    const rarities = batchData.map((d) => d.rarity);

    console.log(`📦 Batch ${batchNum + 1}/${totalBatches}: Trumps #${startIdx}-${endIdx - 1}`);

    try {
      // Estimate gas
      const gasEstimate = await marketplace.setRarityTierBatch.estimateGas(trumpIds, rarities);
      const gasLimit = gasEstimate * 120n / 100n; // Add 20% buffer

      console.log(`   ⛽ Estimated gas: ${gasEstimate.toString()}`);

      // Send transaction
      const tx = await marketplace.setRarityTierBatch(trumpIds, rarities, {
        gasLimit: gasLimit,
      });

      console.log(`   📤 Transaction sent: ${tx.hash}`);
      console.log(`   ⏳ Waiting for confirmation...`);

      const receipt = await tx.wait();

      console.log(`   ✅ Confirmed in block ${receipt.blockNumber}`);
      console.log(`   ⛽ Gas used: ${receipt.gasUsed.toString()}`);
      console.log();

      processedCount += batchData.length;
      successfulBatches++;
    } catch (error) {
      console.error(`   ❌ Batch ${batchNum + 1} failed:`, error.message);
      console.error();
      failedBatches++;

      // Continue with next batch or abort?
      console.log("   ⚠️  Continuing with next batch...");
      console.log();
    }
  }

  // ============ Summary ============
  console.log("╔════════════════════════════════════════════════════╗");
  console.log("║              🏆 Process Summary 🏆                 ║");
  console.log("╚════════════════════════════════════════════════════╝");
  console.log("Total Trumps:", TOTAL_TRUMPS);
  console.log("Total Batches:", totalBatches);
  console.log("Batch Size:", BATCH_SIZE);
  console.log("Successful Batches:", successfulBatches);
  console.log("Failed Batches:", failedBatches);
  console.log("Trumps Processed:", processedCount);
  console.log();

  if (failedBatches === 0) {
    console.log("✅ All rarity tiers populated successfully!");
    console.log();
    console.log("🎯 Next Steps:");
    console.log("1. Verify on block explorer");
    console.log("2. Test getRarityTier() for sample Trumps");
    console.log("3. Deploy merge contracts if not already deployed");
    console.log("4. Test full merge system");
    console.log();
    console.log("🇺🇸 Tremendous! Rarity tiers are set! 🇺🇸");
  } else {
    console.log("⚠️  Some batches failed. Please review errors above.");
    console.log("   You may need to re-run this script or process failed batches manually.");
    console.log();
  }

  return {
    totalProcessed: processedCount,
    successfulBatches,
    failedBatches,
    rarityDistribution: rarityCount,
  };
}

// ============ Helper Functions ============

/**
 * Verify rarity tiers were set correctly
 */
async function verifyRarityTiers(marketplace, sampleIds = [0, 1, 100, 1000, 5000, 9999]) {
  console.log("╔════════════════════════════════════════════════════╗");
  console.log("║         🔍 Verification (Sample Trumps) 🔍         ║");
  console.log("╚════════════════════════════════════════════════════╝");
  console.log();

  for (const trumpId of sampleIds) {
    try {
      const rarity = await marketplace.getRarityTier(trumpId);
      console.log(`Trump #${trumpId.toString().padStart(4)}: ${rarity}`);
    } catch (error) {
      console.log(`Trump #${trumpId.toString().padStart(4)}: ❌ Error - ${error.message}`);
    }
  }
  console.log();
}

// ============ Execution ============

if (require.main === module) {
  main()
    .then((result) => {
      if (result.failedBatches === 0) {
        process.exit(0);
      } else {
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error("❌ Fatal Error:", error);
      process.exit(1);
    });
}

module.exports = main;
