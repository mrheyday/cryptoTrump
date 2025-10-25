// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ICryptoTrumpMarketplace
 * @notice Interface for CryptoTrumpMarketplace functions used by merge contract
 */
interface ICryptoTrumpMarketplace {
    /**
     * @notice Burn a Trump NFT
     * @param trumpId Trump ID to burn
     */
    function burnTrump(uint256 trumpId) external;

    /**
     * @notice Get rarity tier for a Trump
     * @param trumpId Trump ID
     * @return Rarity tier name
     */
    function getRarityTier(uint256 trumpId) external view returns (string memory);

    /**
     * @notice Get Trump owner (ERC721 standard)
     * @param tokenId Token ID
     * @return Owner address
     */
    function ownerOf(uint256 tokenId) external view returns (address);
}
