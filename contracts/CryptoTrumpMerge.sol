// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./MAGAToken.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CryptoTrumpMerge
 * @notice Merge and burn extension for CryptoTrump NFTs
 * @dev Inspired by Pak's Merge - The $91.8 Million NFT Project
 *
 * 🇺🇸 Merge to Make Them Greater! 🇺🇸
 *
 * Features:
 * - Merge two Trumps into one (True Burn the weaker)
 * - Trump Power system (starts at 1, grows with merges)
 * - Burn Trumps for MAGA tokens
 * - Alpha Trump tracking (most powerful)
 * - Merge history and lineage
 * - Merge cooldown system
 * - Dynamic rarity based on power
 */
contract CryptoTrumpMerge is Ownable, ReentrancyGuard {

    // ============ Constants ============

    /// @notice Cooldown period between merges (7 days)
    uint256 public constant MERGE_COOLDOWN = 7 days;

    /// @notice Cost to reduce cooldown (in MAGA)
    uint256 public constant COOLDOWN_REDUCTION_COST = 100 ether; // 100 MAGA

    /// @notice Maximum power level
    uint256 public constant MAX_POWER_LEVEL = 10000;

    // ============ Interfaces ============

    IERC721 public immutable trumpContract;
    MAGAToken public immutable magaToken;

    // ============ State Variables ============

    /// @notice Total Trumps burned via merge
    uint256 public totalMergeBurns;

    /// @notice Total Trumps burned for MAGA
    uint256 public totalMAGABurns;

    /// @notice Current Alpha Trump (most powerful)
    uint256 public alphaTrumpId;

    /// @notice Current Alpha Trump power
    uint256 public alphaTrumpPower;

    /// @notice Alpha Trump owner
    address public alphaTrumpOwner;

    /// @notice Timestamp when current Alpha status started
    uint256 public alphaSince;

    /// @notice Mapping of Trump power data
    mapping(uint256 => TrumpPower) public trumpPower;

    /// @notice Mapping of last merge time for cooldown
    mapping(uint256 => uint256) public lastMergeTime;

    /// @notice Mapping of rarity tier names
    mapping(uint256 => string) public rarityTiers;

    // ============ Structs ============

    /// @notice Trump power and merge data (inspired by Pak's Merge mass system)
    struct TrumpPower {
        uint256 power;              // Current power level
        uint256 mergeCount;         // Number of merges performed
        uint256[] consumedIds;      // IDs of Trumps merged into this one
        uint256 totalPowerGained;   // Cumulative power absorbed
        uint256 createdAt;          // When power tracking started
        string currentRarity;       // Dynamic rarity tier
    }

    // ============ Events ============

    /// @notice Emitted when two Trumps are merged
    event TrumpsMerged(
        uint256 indexed keepId,
        uint256 indexed burnId,
        address indexed owner,
        uint256 newPower,
        uint256 mergeCount
    );

    /// @notice Emitted when a Trump is burned for MAGA
    event TrumpBurnedForMAGA(
        uint256 indexed trumpId,
        address indexed burner,
        uint256 power,
        string rarity,
        uint256 magaEarned
    );

    /// @notice Emitted when a new Alpha Trump is crowned
    event NewAlphaTrump(
        uint256 indexed trumpId,
        address indexed owner,
        uint256 power,
        uint256 previousAlphaId
    );

    /// @notice Emitted when merge cooldown is reduced
    event CooldownReduced(
        uint256 indexed trumpId,
        address indexed owner,
        uint256 magaBurned
    );

    /// @notice Emitted when rarity tier is updated
    event RarityUpdated(
        uint256 indexed trumpId,
        string oldRarity,
        string newRarity,
        uint256 power
    );

    // ============ Errors ============

    error NotTrumpOwner();
    error SameTrumpMerge();
    error MergeCooldownActive();
    error PowerLevelTooHigh();
    error TrumpNotFound();
    error InsufficientMAGA();
    error InvalidTrumpId();

    // ============ Constructor ============

    /**
     * @notice Initialize merge contract
     * @param _trumpContract CryptoTrump NFT contract address
     * @param _magaToken MAGA token contract address
     */
    constructor(
        address _trumpContract,
        address _magaToken
    ) Ownable(msg.sender) {
        require(_trumpContract != address(0), "Invalid trump contract");
        require(_magaToken != address(0), "Invalid MAGA contract");

        trumpContract = IERC721(_trumpContract);
        magaToken = MAGAToken(_magaToken);

        // Initialize rarity tiers
        rarityTiers[0] = "Common";
        rarityTiers[1] = "Uncommon";
        rarityTiers[2] = "Rare";
        rarityTiers[3] = "Epic";
        rarityTiers[4] = "Legendary";
        rarityTiers[5] = "Mythic";
    }

    // ============ Merge Functions (Inspired by Pak's Merge) ============

    /**
     * @notice Merge two Trumps into one (True Burn mechanism)
     * @dev Inspired by Pak's Merge - combines mass and burns smaller token
     * @param keepId Trump ID to keep and power up
     * @param burnId Trump ID to burn and absorb
     */
    function mergeTrumps(uint256 keepId, uint256 burnId) external nonReentrant {
        // Validation
        if (keepId == burnId) revert SameTrumpMerge();
        if (keepId >= 10000 || burnId >= 10000) revert InvalidTrumpId();
        if (trumpContract.ownerOf(keepId) != msg.sender) revert NotTrumpOwner();
        if (trumpContract.ownerOf(burnId) != msg.sender) revert NotTrumpOwner();

        // Check cooldown
        if (!canMerge(keepId)) revert MergeCooldownActive();

        // Initialize power if first merge
        if (trumpPower[keepId].power == 0) {
            _initializePower(keepId);
        }
        if (trumpPower[burnId].power == 0) {
            _initializePower(burnId);
        }

        // Get power levels
        uint256 keepPower = trumpPower[keepId].power;
        uint256 burnPower = trumpPower[burnId].power;

        // Calculate new power (add both powers)
        uint256 newPower = keepPower + burnPower;
        if (newPower > MAX_POWER_LEVEL) revert PowerLevelTooHigh();

        // Update keep Trump
        trumpPower[keepId].power = newPower;
        trumpPower[keepId].mergeCount++;
        trumpPower[keepId].consumedIds.push(burnId);
        trumpPower[keepId].totalPowerGained += burnPower;
        lastMergeTime[keepId] = block.timestamp;

        // Update rarity based on new power
        string memory oldRarity = trumpPower[keepId].currentRarity;
        string memory newRarity = _calculateRarity(newPower);
        if (keccak256(bytes(oldRarity)) != keccak256(bytes(newRarity))) {
            trumpPower[keepId].currentRarity = newRarity;
            emit RarityUpdated(keepId, oldRarity, newRarity, newPower);
        }

        // Increment burn counter
        totalMergeBurns++;

        // Check for new Alpha
        _checkAndUpdateAlpha(keepId, newPower);

        emit TrumpsMerged(keepId, burnId, msg.sender, newPower, trumpPower[keepId].mergeCount);

        // Note: Actual NFT burn should be done by main contract
        // This contract tracks the logic, main contract handles NFT operations
    }

    /**
     * @notice Burn a Trump for MAGA tokens
     * @dev Inspired by Pak's Burn.art ASH token system
     * @param trumpId Trump ID to burn
     * @return magaEarned Amount of MAGA tokens earned
     */
    function burnTrumpForMAGA(uint256 trumpId) external nonReentrant returns (uint256 magaEarned) {
        if (trumpId >= 10000) revert InvalidTrumpId();
        if (trumpContract.ownerOf(trumpId) != msg.sender) revert NotTrumpOwner();

        // Initialize power if not set
        if (trumpPower[trumpId].power == 0) {
            _initializePower(trumpId);
        }

        // Get Trump data
        uint256 power = trumpPower[trumpId].power;
        string memory rarity = trumpPower[trumpId].currentRarity;

        // Mint MAGA tokens (calculated by MAGA contract)
        magaEarned = magaToken.mintFromBurn(msg.sender, trumpId, power, rarity);

        // Increment burn counter
        totalMAGABurns++;

        // Clear Alpha if this was the Alpha Trump
        if (trumpId == alphaTrumpId) {
            _clearAlpha();
        }

        emit TrumpBurnedForMAGA(trumpId, msg.sender, power, rarity, magaEarned);

        // Note: Actual NFT burn should be done by main contract
        return magaEarned;
    }

    // ============ Cooldown Functions ============

    /**
     * @notice Check if a Trump can merge (cooldown expired)
     * @param trumpId Trump ID to check
     * @return True if can merge
     */
    function canMerge(uint256 trumpId) public view returns (bool) {
        uint256 lastMerge = lastMergeTime[trumpId];
        if (lastMerge == 0) return true; // Never merged
        return block.timestamp >= lastMerge + MERGE_COOLDOWN;
    }

    /**
     * @notice Reduce merge cooldown by burning MAGA
     * @param trumpId Trump ID
     */
    function reduceCooldown(uint256 trumpId) external nonReentrant {
        if (trumpContract.ownerOf(trumpId) != msg.sender) revert NotTrumpOwner();
        if (canMerge(trumpId)) revert("No cooldown active");

        // Burn MAGA from sender
        magaToken.burnForUtility(COOLDOWN_REDUCTION_COST, "cooldown_reduction");

        // Reset cooldown
        lastMergeTime[trumpId] = 0;

        emit CooldownReduced(trumpId, msg.sender, COOLDOWN_REDUCTION_COST);
    }

    /**
     * @notice Get remaining cooldown time
     * @param trumpId Trump ID
     * @return seconds Seconds remaining (0 if can merge)
     */
    function getRemainingCooldown(uint256 trumpId) external view returns (uint256) {
        if (canMerge(trumpId)) return 0;

        uint256 lastMerge = lastMergeTime[trumpId];
        uint256 cooldownEnd = lastMerge + MERGE_COOLDOWN;

        if (block.timestamp >= cooldownEnd) return 0;
        return cooldownEnd - block.timestamp;
    }

    // ============ Internal Functions ============

    /**
     * @notice Initialize power tracking for a Trump
     * @param trumpId Trump ID
     */
    function _initializePower(uint256 trumpId) internal {
        trumpPower[trumpId] = TrumpPower({
            power: 1,
            mergeCount: 0,
            consumedIds: new uint256[](0),
            totalPowerGained: 0,
            createdAt: block.timestamp,
            currentRarity: "Common"
        });
    }

    /**
     * @notice Calculate rarity tier based on power
     * @param power Power level
     * @return Rarity tier name
     */
    function _calculateRarity(uint256 power) internal view returns (string memory) {
        if (power >= 100) return rarityTiers[5]; // Mythic
        if (power >= 50) return rarityTiers[4];  // Legendary
        if (power >= 25) return rarityTiers[3];  // Epic
        if (power >= 10) return rarityTiers[2];  // Rare
        if (power >= 5) return rarityTiers[1];   // Uncommon
        return rarityTiers[0];                    // Common
    }

    /**
     * @notice Check and update Alpha Trump
     * @param trumpId Potential new Alpha
     * @param power Trump's power level
     */
    function _checkAndUpdateAlpha(uint256 trumpId, uint256 power) internal {
        if (power > alphaTrumpPower) {
            uint256 previousAlphaId = alphaTrumpId;

            alphaTrumpId = trumpId;
            alphaTrumpPower = power;
            alphaTrumpOwner = trumpContract.ownerOf(trumpId);
            alphaSince = block.timestamp;

            emit NewAlphaTrump(trumpId, alphaTrumpOwner, power, previousAlphaId);
        }
    }

    /**
     * @notice Clear Alpha status (when Alpha Trump is burned)
     */
    function _clearAlpha() internal {
        alphaTrumpId = 0;
        alphaTrumpPower = 0;
        alphaTrumpOwner = address(0);
        alphaSince = 0;
    }

    // ============ View Functions ============

    /**
     * @notice Get Trump power data
     * @param trumpId Trump ID
     * @return Trump power struct
     */
    function getTrumpPower(uint256 trumpId) external view returns (TrumpPower memory) {
        return trumpPower[trumpId];
    }

    /**
     * @notice Get Trump's consumed IDs (merge history)
     * @param trumpId Trump ID
     * @return Array of consumed Trump IDs
     */
    function getConsumedIds(uint256 trumpId) external view returns (uint256[] memory) {
        return trumpPower[trumpId].consumedIds;
    }

    /**
     * @notice Get Alpha Trump info
     * @return id Alpha Trump ID
     * @return power Alpha Trump power
     * @return owner Alpha Trump owner
     * @return since Timestamp when became Alpha
     */
    function getAlphaInfo() external view returns (
        uint256 id,
        uint256 power,
        address owner,
        uint256 since
    ) {
        return (alphaTrumpId, alphaTrumpPower, alphaTrumpOwner, alphaSince);
    }

    /**
     * @notice Calculate potential MAGA reward for burning a Trump
     * @param trumpId Trump ID
     * @return Estimated MAGA tokens
     */
    function estimateMAGAReward(uint256 trumpId) external view returns (uint256) {
        uint256 power = trumpPower[trumpId].power;
        if (power == 0) power = 1;

        string memory rarity = trumpPower[trumpId].currentRarity;
        if (bytes(rarity).length == 0) rarity = "Common";

        return magaToken.calculateMAGAReward(power, rarity);
    }

    /**
     * @notice Get total burns (merge + MAGA)
     * @return Total number of Trumps burned
     */
    function getTotalBurns() external view returns (uint256) {
        return totalMergeBurns + totalMAGABurns;
    }

    /**
     * @notice Get current supply (accounting for burns)
     * @return Remaining Trump supply
     */
    function getCurrentSupply() external view returns (uint256) {
        return 10000 - totalMergeBurns - totalMAGABurns;
    }
}
