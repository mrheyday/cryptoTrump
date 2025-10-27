/**
 * Check Balance Script
 * 
 * Checks the ETH balance of the deployer wallet on the specified network.
 * 
 * Usage: npx hardhat run scripts/checkBalance.js --network <network>
 */

const hre = require("hardhat");

async function main() {
  console.log('\n========================================');
  console.log('Balance Checker');
  console.log('========================================\n');

  const [signer] = await hre.ethers.getSigners();
  const address = signer.address;
  const balance = await hre.ethers.provider.getBalance(address);
  const balanceInEth = hre.ethers.formatEther(balance);

  console.log('Network:', hre.network.name);
  console.log('Address:', address);
  console.log('Balance:', balanceInEth, 'ETH');
  
  // Check if balance is sufficient for deployment
  const minBalance = 0.05; // minimum recommended balance
  if (parseFloat(balanceInEth) < minBalance) {
    console.log('\n⚠️  Warning: Balance is low!');
    console.log(`   Recommended minimum: ${minBalance} ETH for deployment`);
  } else {
    console.log('\n✅ Balance is sufficient for deployment');
  }
  
  console.log('\n========================================\n');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
