// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MAGA Token
 * @notice Utility token for the CryptoTrump ecosystem
 * @dev Inspired by Pak's ASH token from Burn.art
 *
 * 🇺🇸 Make A Great Asset! 🇺🇸
 *
 * Features:
 * - Minted by burning CryptoTrump NFTs
 * - Used for naming Trumps, reducing cooldowns, and governance
 * - Inverse yield curve (early burns = more MAGA)
 * - Rarity-based multipliers
 * - Deflationary through utility burns
 */
contract MAGAToken is ERC20, Ownable {

    // ============ Constants ============

    /// @notice Base MAGA reward for burning a Trump
    uint256 public constant BASE_MAGA_REWARD = 100 ether; // 100 MAGA

    /// @notice Maximum total Trumps that can be burned
    uint256 public constant MAX_BURNABLE_TRUMPS = 10000;

    /// @notice Token name
    string private constant TOKEN_NAME = "Make America Great Again";

    /// @notice Token symbol
    string private constant TOKEN_SYMBOL = "MAGA";

    // ============ State Variables ============

    /// @notice Address of the CryptoTrump NFT contract
    address public trumpContract;

    /// @notice Total number of Trumps burned
    uint256 public totalTrumpsBurned;

    /// @notice Mapping of Trump rarity tier to multiplier
    mapping(string => uint256) public rarityMultipliers;

    /// @notice Mapping to track if a specific Trump ID has been burned
    mapping(uint256 => bool) public trumpBurned;

    /// @notice Tracks MAGA earned per address
    mapping(address => uint256) public totalMAGAEarned;

    // ============ Events ============

    /// @notice Emitted when a Trump is burned for MAGA
    event TrumpBurnedForMAGA(
        address indexed burner,
        uint256 indexed trumpId,
        uint256 trumpPower,
        string rarityTier,
        uint256 magaEarned
    );

    /// @notice Emitted when MAGA is burned for utility
    event MAGABurnedForUtility(
        address indexed burner,
        uint256 amount,
        string utility
    );

    /// @notice Emitted when Trump contract is updated
    event TrumpContractUpdated(address indexed oldContract, address indexed newContract);

    /// @notice Emitted when rarity multiplier is updated
    event RarityMultiplierUpdated(string indexed rarityTier, uint256 multiplier);

    // ============ Errors ============

    error OnlyTrumpContract();
    error TrumpAlreadyBurned();
    error MaxBurnReached();
    error InvalidMultiplier();
    error InvalidTrumpContract();

    // ============ Constructor ============

    /**
     * @notice Initialize MAGA token
     * @param _trumpContract Address of CryptoTrump NFT contract
     */
    constructor(address _trumpContract) ERC20(TOKEN_NAME, TOKEN_SYMBOL) Ownable(msg.sender) {
        require(_trumpContract != address(0), "Invalid trump contract");
        trumpContract = _trumpContract;

        // Initialize rarity multipliers (inspired by Pak's differential burn rates)
        rarityMultipliers["Common"] = 1;
        rarityMultipliers["Uncommon"] = 2;
        rarityMultipliers["Rare"] = 3;
        rarityMultipliers["Epic"] = 5;
        rarityMultipliers["Legendary"] = 10;
        rarityMultipliers["Mythic"] = 20;
    }

    // ============ Minting Functions ============

    /**
     * @notice Mint MAGA tokens by burning a Trump NFT
     * @dev Called by CryptoTrump contract only
     * @param burner Address burning the Trump
     * @param trumpId ID of the Trump being burned
     * @param trumpPower Power level of the Trump
     * @param rarityTier Rarity tier of the Trump
     * @return magaAmount Amount of MAGA tokens minted
     */
    function mintFromBurn(
        address burner,
        uint256 trumpId,
        uint256 trumpPower,
        string calldata rarityTier
    ) external returns (uint256 magaAmount) {
        if (msg.sender != trumpContract) revert OnlyTrumpContract();
        if (trumpBurned[trumpId]) revert TrumpAlreadyBurned();
        if (totalTrumpsBurned >= MAX_BURNABLE_TRUMPS) revert MaxBurnReached();

        // Calculate MAGA reward with Pak's inverse yield curve
        magaAmount = calculateMAGAReward(trumpPower, rarityTier);

        // Mark Trump as burned
        trumpBurned[trumpId] = true;
        totalTrumpsBurned++;

        // Track earnings
        totalMAGAEarned[burner] += magaAmount;

        // Mint MAGA tokens
        _mint(burner, magaAmount);

        emit TrumpBurnedForMAGA(burner, trumpId, trumpPower, rarityTier, magaAmount);
    }

    /**
     * @notice Calculate MAGA reward for burning a Trump
     * @dev Implements inverse yield curve (inspired by Pak's Burn.art)
     * @param trumpPower Power level of the Trump
     * @param rarityTier Rarity tier of the Trump
     * @return Amount of MAGA tokens to award
     */
    function calculateMAGAReward(
        uint256 trumpPower,
        string memory rarityTier
    ) public view returns (uint256) {
        // Base reward
        uint256 reward = BASE_MAGA_REWARD;

        // Rarity multiplier
        uint256 rarityMult = rarityMultipliers[rarityTier];
        if (rarityMult == 0) rarityMult = 1; // Default to 1x if not found
        reward = reward * rarityMult;

        // Power multiplier
        if (trumpPower > 0) {
            reward = reward * trumpPower;
        }

        // Inverse yield curve (early burns get bonus)
        // Formula: (MAX_BURNABLE - totalBurned) / 100
        // First burn: 100x bonus, last burn: 0x bonus
        uint256 earlyBurnBonus = (MAX_BURNABLE_TRUMPS - totalTrumpsBurned) / 100;
        if (earlyBurnBonus > 0) {
            reward = reward + (reward * earlyBurnBonus) / 100;
        }

        return reward;
    }

    // ============ Utility Functions ============

    /**
     * @notice Burn MAGA for utility purposes
     * @param amount Amount of MAGA to burn
     * @param utility Description of utility (e.g., "naming", "cooldown")
     */
    function burnForUtility(uint256 amount, string calldata utility) external {
        _burn(msg.sender, amount);
        emit MAGABurnedForUtility(msg.sender, amount, utility);
    }

    // ============ Admin Functions ============

    /**
     * @notice Update Trump contract address
     * @param newTrumpContract New contract address
     */
    function setTrumpContract(address newTrumpContract) external onlyOwner {
        if (newTrumpContract == address(0)) revert InvalidTrumpContract();
        address oldContract = trumpContract;
        trumpContract = newTrumpContract;
        emit TrumpContractUpdated(oldContract, newTrumpContract);
    }

    /**
     * @notice Update rarity multiplier
     * @param rarityTier Rarity tier name
     * @param multiplier New multiplier value
     */
    function setRarityMultiplier(string calldata rarityTier, uint256 multiplier) external onlyOwner {
        if (multiplier == 0 || multiplier > 100) revert InvalidMultiplier();
        rarityMultipliers[rarityTier] = multiplier;
        emit RarityMultiplierUpdated(rarityTier, multiplier);
    }

    // ============ View Functions ============

    /**
     * @notice Get total MAGA earned by an address
     * @param account Address to check
     * @return Total MAGA earned (includes spent/burned)
     */
    function getTotalEarned(address account) external view returns (uint256) {
        return totalMAGAEarned[account];
    }

    /**
     * @notice Get rarity multiplier for a tier
     * @param rarityTier Rarity tier name
     * @return Multiplier value
     */
    function getRarityMultiplier(string calldata rarityTier) external view returns (uint256) {
        return rarityMultipliers[rarityTier];
    }

    /**
     * @notice Check if a Trump has been burned
     * @param trumpId Trump ID to check
     * @return True if burned
     */
    function isTrumpBurned(uint256 trumpId) external view returns (bool) {
        return trumpBurned[trumpId];
    }

    /**
     * @notice Calculate potential MAGA reward for current state
     * @param trumpPower Power level of Trump
     * @param rarityTier Rarity tier
     * @return Estimated MAGA reward
     */
    function estimateReward(
        uint256 trumpPower,
        string calldata rarityTier
    ) external view returns (uint256) {
        return calculateMAGAReward(trumpPower, rarityTier);
    }
}
