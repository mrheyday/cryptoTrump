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
  console.log("║   🇺🇸 CryptoTrump Deployment - MAGA Edition 🇺🇸    ║");
  console.log("╚════════════════════════════════════════════════════╝");
  console.log();
  console.log("🎯 Making NFTs Great Again!");
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

  // Deploy CryptoTrumpMarketplace
  console.log("🚀 Deploying CryptoTrumpMarketplace...");
  console.log("⏳ Please wait, making the best smart contract ever...");
  console.log();

  const CryptoTrumpMarketplace = await ethers.getContractFactory("CryptoTrumpMarketplace");
  const cryptoTrump = await CryptoTrumpMarketplace.deploy(lzEndpoint, deployer.address);

  await cryptoTrump.waitForDeployment();
  const contractAddress = await cryptoTrump.getAddress();

  console.log("✅ CryptoTrumpMarketplace deployed successfully!");
  console.log();

  // Display deployment summary
  console.log("╔════════════════════════════════════════════════════╗");
  console.log("║            🏆 Deployment Summary 🏆                ║");
  console.log("╚════════════════════════════════════════════════════╝");
  console.log("Contract Address:", contractAddress);
  console.log("LayerZero Endpoint:", lzEndpoint);
  console.log("Total Trumps:", await cryptoTrump.TOTAL_TRUMPS());
  console.log("Collection Name:", await cryptoTrump.COLLECTION_NAME());
  console.log("Symbol:", await cryptoTrump.TOKEN_SYMBOL());
  console.log("Version:", await cryptoTrump.VERSION());
  console.log("Owner:", await cryptoTrump.owner());
  console.log();

  // Save deployment info
  const deploymentInfo = {
    network: network,
    contractAddress: contractAddress,
    lzEndpoint: lzEndpoint,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber(),
  };

  console.log("💾 Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  console.log();

  // Verification instructions
  if (network !== "hardhat" && network !== "localhost") {
    console.log("╔════════════════════════════════════════════════════╗");
    console.log("║         📋 Verification Instructions 📋            ║");
    console.log("╚════════════════════════════════════════════════════╝");
    console.log("To verify the contract, run:");
    console.log();
    console.log(`npx hardhat verify --network ${network} ${contractAddress} "${lzEndpoint}" "${deployer.address}"`);
    console.log();
  }

  // Next steps
  console.log("╔════════════════════════════════════════════════════╗");
  console.log("║              🎯 Next Steps - MAGA! 🎯              ║");
  console.log("╚════════════════════════════════════════════════════╝");
  console.log("1. ✅ Verify contract on block explorer");
  console.log("2. 🌐 Configure LayerZero peers for cross-chain");
  console.log("3. 🎨 Upload Trump metadata to IPFS");
  console.log("4. 🏆 Assign initial Trump owners");
  console.log("5. 📢 Call allInitialOwnersAssigned() when ready");
  console.log("6. 💰 Start marketplace operations");
  console.log("7. 🚀 Make NFTs Great Again!");
  console.log();
  console.log("🇺🇸 Tremendous! The best NFT contract ever deployed! 🇺🇸");
  console.log();

  return {
    contractAddress,
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
