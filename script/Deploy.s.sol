// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/CryptoTrumpMarketplace.sol";

/**
 * @title DeployScript
 * @notice Foundry deployment script for CryptoTrumpMarketplace
 * @dev Run with: forge script script/Deploy.s.sol:DeployScript --rpc-url <RPC_URL> --broadcast
 */
contract DeployScript is Script {
    function run() external {
        // Get deployer private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);

        // Deploy CryptoTrumpMarketplace
        CryptoTrumpMarketplace cryptoTrump = new CryptoTrumpMarketplace();

        console.log("CryptoTrumpMarketplace deployed at:", address(cryptoTrump));
        console.log("Deployer:", msg.sender);
        console.log("Total Trumps:", cryptoTrump.TOTAL_TRUMPS());

        // Stop broadcasting
        vm.stopBroadcast();

        // Log deployment info
        console.log("\n=== Deployment Complete ===");
        console.log("Contract Address:", address(cryptoTrump));
        console.log("Collection Name:", cryptoTrump.COLLECTION_NAME());
        console.log("Token Symbol:", cryptoTrump.TOKEN_SYMBOL());
        console.log("Owner:", cryptoTrump.owner());
        console.log("\nNext steps:");
        console.log("1. Verify contract: forge verify-contract <ADDRESS> CryptoTrumpMarketplace");
        console.log("2. Set base URI: cast send <ADDRESS> 'setBaseURI(string)' <URI>");
        console.log("3. Assign initial Trumps: cast send <ADDRESS> 'setInitialOwner(address,uint256)' <TO> <INDEX>");
    }
}
