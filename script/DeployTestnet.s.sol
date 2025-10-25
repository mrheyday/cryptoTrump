// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/CryptoTrumpMarketplace.sol";

/**
 * @title DeployTestnetScript
 * @notice Testnet deployment with initial setup
 * @dev Run with: forge script script/DeployTestnet.s.sol:DeployTestnetScript --rpc-url sepolia --broadcast --verify
 */
contract DeployTestnetScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        // Deploy contract
        CryptoTrumpMarketplace cryptoTrump = new CryptoTrumpMarketplace();

        console.log("=== CryptoTrumpMarketplace Testnet Deployment ===");
        console.log("Network: Sepolia");
        console.log("Contract Address:", address(cryptoTrump));
        console.log("Deployer:", deployer);

        // Set base URI (example IPFS)
        string memory baseURI = "ipfs://QmTrumpMetadata/";
        cryptoTrump.setBaseURI(baseURI);
        console.log("Base URI set to:", baseURI);

        // Assign first 10 Trumps to deployer for testing
        console.log("\nAssigning test Trumps to deployer...");
        for (uint256 i = 0; i < 10; i++) {
            cryptoTrump.setInitialOwner(deployer, i);
        }
        console.log("Assigned Trumps 0-9 to deployer");

        // Mark initial distribution as complete
        cryptoTrump.allInitialOwnersAssigned();
        console.log("Initial distribution marked as complete");

        vm.stopBroadcast();

        console.log("\n=== Deployment Complete ===");
        console.log("Deployer balance:", cryptoTrump.balanceOf(deployer));
        console.log("Remaining Trumps:", cryptoTrump.trumpsRemainingToAssign());
        console.log("\nTest it:");
        console.log("- Claim Trump: cast send", address(cryptoTrump), "'getTrump(uint256)' 100");
        console.log("- Offer for sale: cast send", address(cryptoTrump), "'offerTrumpForSale(uint256,uint256)' 0 1000000000000000000");
    }
}
