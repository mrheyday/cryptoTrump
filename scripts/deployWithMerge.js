const hre = require("hardhat");
const { ethers } = require("hardhat");

/**
 * LayerZero V2 Endpoint Addresses
 */
const LZ_ENDPOINTS = {
  ethereum: "0x1a44076050125825900e736c501f859c50fE728c",
  polygon: "0x1a44076050125825900e736c501f859c50fE728c",
  arbitrum: "0x1a44076050125825900e736c501f859c50fE728c",
  optimism: "0x1a44076050125825900e736c501f859c50fE728c",
  base: "0x1a44076050125825900e736c501f859c50fE728c",
  sepolia: "0x6EDCE65403992e310A62460808c4b910D972f10f",
  mumbai: "0x6EDCE65403992e310A62460808c4b910D972f10f",
};

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = hre.network.name;

  console.log("╔════════════════════════════════════════════════════╗");
  console.log("║   🇺🇸 CryptoTrump Full Deployment - MAGA! 🇺🇸     ║");
  console.log("║      With Pak-Inspired Merge System                ║");
  console.log("╚════════════════════════════════════════════════════╝");
  console.log();
  console.log("🎯 Making NFTs Great Again with Merge & MAGA!");
  console.log();
  console.log("Network:", network);
  console.log("Deployer:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
  console.log();

  // Get LayerZero endpoint
  let lzEndpoint = LZ_ENDPOINTS[network];

  if (!lzEndpoint || network === "hardhat" || network === "localhost") {
    console.log("📡 Deploying Mock LayerZero Endpoint...");
    const MockLZEndpoint = await ethers.getContractFactory("MockLZEndpoint");
    const mockEndpoint = await MockLZEndpoint.deploy();
    await mockEndpoint.waitForDeployment();
    lzEndpoint = await mockEndpoint.getAddress();
    console.log("✅ Mock LZ Endpoint deployed to:", lzEndpoint);
    console.log();
  } else {
    console.log("📡 Using LayerZero Endpoint:", lzEndpoint);
    console.log();
  }

  // ============ Step 1: Deploy CryptoTrumpMarketplace ============
  console.log("╔════════════════════════════════════════════════════╗");
  console.log("║  Step 1/4: Deploying CryptoTrumpMarketplace        ║");
  console.log("╚════════════════════════════════════════════════════╝");
  console.log("🚀 Deploying main NFT contract...");
  console.log("⏳ Please wait, making the best smart contract ever...");
  console.log();

  const CryptoTrumpMarketplace = await ethers.getContractFactory("CryptoTrumpMarketplace");
  const cryptoTrump = await CryptoTrumpMarketplace.deploy(lzEndpoint, deployer.address);

  await cryptoTrump.waitForDeployment();
  const trumpAddress = await cryptoTrump.getAddress();

  console.log("✅ CryptoTrumpMarketplace deployed to:", trumpAddress);
  console.log();

  // ============ Step 2: Deploy MAGAToken ============
  console.log("╔════════════════════════════════════════════════════╗");
  console.log("║  Step 2/4: Deploying MAGA Token                    ║");
  console.log("╚════════════════════════════════════════════════════╝");
  console.log("💰 Deploying MAGA utility token...");
  console.log("⏳ Making assets great again...");
  console.log();

  const MAGAToken = await ethers.getContractFactory("MAGAToken");
  const magaToken = await MAGAToken.deploy(trumpAddress);

  await magaToken.waitForDeployment();
  const magaAddress = await magaToken.getAddress();

  console.log("✅ MAGAToken deployed to:", magaAddress);
  console.log();

  // ============ Step 3: Deploy CryptoTrumpMerge ============
  console.log("╔════════════════════════════════════════════════════╗");
  console.log("║  Step 3/4: Deploying Merge Contract                ║");
  console.log("╚════════════════════════════════════════════════════╝");
  console.log("🔥 Deploying Pak-inspired merge system...");
  console.log("⏳ Implementing True Burn mechanism...");
  console.log();

  const CryptoTrumpMerge = await ethers.getContractFactory("CryptoTrumpMerge");
  const mergeContract = await CryptoTrumpMerge.deploy(trumpAddress, magaAddress);

  await mergeContract.waitForDeployment();
  const mergeAddress = await mergeContract.getAddress();

  console.log("✅ CryptoTrumpMerge deployed to:", mergeAddress);
  console.log();

  // ============ Step 4: Configure Integration ============
  console.log("╔════════════════════════════════════════════════════╗");
  console.log("║  Step 4/4: Configuring Contract Integration        ║");
  console.log("╚════════════════════════════════════════════════════╝");
  console.log("🔧 Setting up contract permissions...");
  console.log();

  // Set merge contract in marketplace (allows merge contract to burn NFTs)
  console.log("1️⃣ Authorizing merge contract to burn Trumps...");
  const setMergeTx = await cryptoTrump.setMergeContract(mergeAddress);
  await setMergeTx.wait();
  console.log("   ✅ Merge contract authorized");

  // Set trump contract in MAGA token (allows merge contract to mint MAGA)
  console.log("2️⃣ Configuring MAGA token permissions...");
  const setTrumpTx = await magaToken.setTrumpContract(mergeAddress);
  await setTrumpTx.wait();
  console.log("   ✅ MAGA minting configured");

  console.log();
  console.log("✅ Integration complete!");
  console.log();

  // ============ Display Deployment Summary ============
  console.log("╔════════════════════════════════════════════════════╗");
  console.log("║            🏆 Deployment Summary 🏆                ║");
  console.log("╚════════════════════════════════════════════════════╝");
  console.log();
  console.log("📝 Contract Addresses:");
  console.log("   CryptoTrumpMarketplace:", trumpAddress);
  console.log("   MAGAToken:             ", magaAddress);
  console.log("   CryptoTrumpMerge:      ", mergeAddress);
  console.log();
  console.log("⚙️  Configuration:");
  console.log("   LayerZero Endpoint:", lzEndpoint);
  console.log("   Total Trumps:", await cryptoTrump.TOTAL_TRUMPS());
  console.log("   Collection Name:", await cryptoTrump.COLLECTION_NAME());
  console.log("   Symbol:", await cryptoTrump.TOKEN_SYMBOL());
  console.log("   Version:", await cryptoTrump.VERSION());
  console.log("   Marketplace Owner:", await cryptoTrump.owner());
  console.log("   MAGA Name:", await magaToken.name());
  console.log("   MAGA Symbol:", await magaToken.symbol());
  console.log("   Base MAGA Reward:", ethers.formatEther(await magaToken.BASE_MAGA_REWARD()), "MAGA");
  console.log("   Merge Cooldown:", (await mergeContract.MERGE_COOLDOWN()) / 86400n, "days");
  console.log("   Max Power Level:", await mergeContract.MAX_POWER_LEVEL());
  console.log();

  // Save deployment info
  const deploymentInfo = {
    network: network,
    contracts: {
      CryptoTrumpMarketplace: trumpAddress,
      MAGAToken: magaAddress,
      CryptoTrumpMerge: mergeAddress,
    },
    lzEndpoint: lzEndpoint,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber(),
  };

  console.log("💾 Deployment Info (JSON):");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  console.log();

  // Verification instructions
  if (network !== "hardhat" && network !== "localhost") {
    console.log("╔════════════════════════════════════════════════════╗");
    console.log("║         📋 Verification Instructions 📋            ║");
    console.log("╚════════════════════════════════════════════════════╝");
    console.log("To verify the contracts, run:");
    console.log();
    console.log("# CryptoTrumpMarketplace");
    console.log(`npx hardhat verify --network ${network} ${trumpAddress} "${lzEndpoint}" "${deployer.address}"`);
    console.log();
    console.log("# MAGAToken");
    console.log(`npx hardhat verify --network ${network} ${magaAddress} "${trumpAddress}"`);
    console.log();
    console.log("# CryptoTrumpMerge");
    console.log(`npx hardhat verify --network ${network} ${mergeAddress} "${trumpAddress}" "${magaAddress}"`);
    console.log();
  }

  // Next steps
  console.log("╔════════════════════════════════════════════════════╗");
  console.log("║         🎯 Next Steps - Make It GREAT! 🎯         ║");
  console.log("╚════════════════════════════════════════════════════╝");
  console.log("1. ✅ Verify contracts on block explorer");
  console.log("2. 🎨 Run script to populate rarity tiers from artwork");
  console.log("3. 🌐 Configure LayerZero peers for cross-chain (optional)");
  console.log("4. 📤 Upload Trump metadata to IPFS");
  console.log("5. 🏆 Assign initial Trump owners");
  console.log("6. 📢 Call allInitialOwnersAssigned() when ready");
  console.log("7. 💰 Enable marketplace operations");
  console.log("8. 🔥 Users can start merging and burning Trumps!");
  console.log("9. 🚀 Make NFTs Great Again!");
  console.log();
  console.log("╔════════════════════════════════════════════════════╗");
  console.log("║        🎮 Merge System Usage Examples 🎮           ║");
  console.log("╚════════════════════════════════════════════════════╝");
  console.log("// Merge two Trumps (power 1 + power 1 = power 2)");
  console.log(`await mergeContract.mergeTrumps(keepId, burnId);`);
  console.log();
  console.log("// Burn Trump for MAGA tokens");
  console.log(`await mergeContract.burnTrumpForMAGA(trumpId);`);
  console.log();
  console.log("// Check Alpha Trump status");
  console.log(`await mergeContract.getAlphaInfo();`);
  console.log();
  console.log("// Reduce merge cooldown with MAGA");
  console.log(`await mergeContract.reduceCooldown(trumpId);`);
  console.log();
  console.log("🇺🇸 Tremendous! The best NFT ecosystem ever deployed! 🇺🇸");
  console.log();

  return {
    trumpAddress,
    magaAddress,
    mergeAddress,
    lzEndpoint,
    deployer: deployer.address,
  };
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = main;
