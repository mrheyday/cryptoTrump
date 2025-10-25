// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title CryptoTrumpMarketplace
 * @notice NFT Marketplace for CryptoTrump - 10,000 unique Trump-themed collectibles
 * @dev Modern implementation with ERC721, cross-chain capabilities, and comprehensive security
 *
 * 🇺🇸 Make NFTs Great Again! 🇺🇸
 *
 * Features:
 * - 10,000 unique Trump-themed digital collectibles
 * - Full ERC721 standard compliance
 * - ERC2981 Royalty Standard (3% royalties)
 * - Custom messages (inspired by Pak's Censored)
 * - Pay-what-you-want minting
 * - Built-in marketplace for buying, selling, and bidding
 * - Solidity 0.8.20 with modern security patterns
 * - OpenZeppelin audited contracts
 * - Pausable for emergency situations
 */
contract CryptoTrumpMarketplace is ERC721, ERC2981, Ownable, ReentrancyGuard, Pausable {

    // ============ Constants ============

    /// @notice Total number of CryptoTrumps - The best number, believe me!
    uint256 public constant TOTAL_TRUMPS = 10000;

    /// @notice Collection name
    string public constant COLLECTION_NAME = "CryptoTrump";

    /// @notice Token symbol - TRUMP!
    string public constant TOKEN_SYMBOL = "TRUMP";

    /// @notice Version number
    string public constant VERSION = "2.0.0";

    /// @notice Maximum message length (inspired by Pak's Censored)
    uint256 public constant MAX_MESSAGE_LENGTH = 72;

    /// @notice Default royalty basis points (3% = 300 basis points)
    uint96 public constant DEFAULT_ROYALTY_BPS = 300;

    // ============ State Variables ============

    /// @notice Counter for the next Trump to be assigned during initial distribution
    uint256 public nextTrumpIndexToAssign;

    /// @notice Flag indicating if all Trumps have been initially assigned
    bool public allTrumpsAssigned;

    /// @notice Number of Trumps remaining to be assigned
    uint256 public trumpsRemainingToAssign;

    /// @notice Mapping of Trump offers for sale
    mapping(uint256 => Offer) public trumpsOfferedForSale;

    /// @notice Mapping of active bids for each Trump
    mapping(uint256 => Bid) public trumpBids;

    /// @notice Mapping of pending withdrawals for each address
    mapping(address => uint256) public pendingWithdrawals;

    /// @notice Base URI for token metadata
    string private _baseTokenURI;

    /// @notice Minimum mint price for pay-what-you-want minting
    uint256 public minimumMintPrice;

    /// @notice Mapping of custom messages for each Trump (inspired by Pak's Censored)
    mapping(uint256 => TrumpMessage) public trumpMessages;

    /// @notice Total contributions from pay-what-you-want minting
    mapping(address => uint256) public totalContributions;

    /// @notice Project treasury address for royalties and contributions
    address public projectTreasury;

    /// @notice Authorized merge contract that can burn NFTs
    address public mergeContract;

    /// @notice Mapping of Trump ID to rarity tier
    mapping(uint256 => string) public trumpRarityTier;

    // ============ Structs ============

    /// @notice Represents an offer to sell a Trump
    struct Offer {
        bool isForSale;
        uint256 trumpIndex;
        address seller;
        uint256 minValue;
        address onlySellTo; // Zero address means anyone can buy
    }

    /// @notice Represents a bid on a Trump
    struct Bid {
        bool hasBid;
        uint256 trumpIndex;
        address bidder;
        uint256 value;
    }

    /// @notice Represents a custom message attached to a Trump (inspired by Pak's Censored)
    struct TrumpMessage {
        string message;        // The custom message (max 72 characters)
        address author;        // Who wrote the message
        uint256 timestamp;     // When it was written
        uint256 valuePaid;     // How much they paid when setting the message
    }

    // ============ Events ============

    /// @notice Emitted when a Trump is assigned to an address
    event TrumpAssigned(address indexed to, uint256 indexed trumpIndex);

    /// @notice Emitted when a Trump is transferred
    event TrumpTransfer(address indexed from, address indexed to, uint256 indexed trumpIndex);

    /// @notice Emitted when a Trump is offered for sale
    event TrumpOffered(uint256 indexed trumpIndex, uint256 minValue, address indexed toAddress);

    /// @notice Emitted when a bid is entered for a Trump
    event TrumpBidEntered(uint256 indexed trumpIndex, uint256 value, address indexed fromAddress);

    /// @notice Emitted when a bid is withdrawn
    event TrumpBidWithdrawn(uint256 indexed trumpIndex, uint256 value, address indexed fromAddress);

    /// @notice Emitted when a Trump is bought
    event TrumpBought(uint256 indexed trumpIndex, uint256 value, address indexed fromAddress, address indexed toAddress);

    /// @notice Emitted when a Trump is removed from sale
    event TrumpNoLongerForSale(uint256 indexed trumpIndex);

    /// @notice Emitted when a custom message is set for a Trump
    event MessageSet(uint256 indexed trumpIndex, address indexed author, string message, uint256 valuePaid);

    /// @notice Emitted when royalty info is updated
    event RoyaltyInfoUpdated(address indexed recipient, uint96 basisPoints);

    /// @notice Emitted when minimum mint price is updated
    event MinimumMintPriceUpdated(uint256 newPrice);

    /// @notice Emitted when a contribution is received
    event ContributionReceived(address indexed contributor, uint256 amount, uint256 indexed trumpIndex);

    /// @notice Emitted when project treasury is updated
    event ProjectTreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);

    /// @notice Emitted when merge contract is updated
    event MergeContractUpdated(address indexed oldMergeContract, address indexed newMergeContract);

    /// @notice Emitted when a Trump is burned
    event TrumpBurned(uint256 indexed trumpId, address indexed burner, string rarityTier);

    /// @notice Emitted when rarity tier is set
    event RarityTierSet(uint256 indexed trumpId, string rarityTier);

    // ============ Errors ============

    error TrumpIndexOutOfRange();
    error AllTrumpsAlreadyAssigned();
    error NotTrumpOwner();
    error TrumpAlreadyAssigned();
    error TrumpsNotYetAssigned();
    error TrumpNotForSale();
    error InsufficientPayment();
    error NotIntendedBuyer();
    error InvalidSeller();
    error BidTooLow();
    error NoBidExists();
    error NotBidder();
    error NoFundsToWithdraw();
    error CannotBidOnOwnTrump();
    error BidMustBePositive();
    error TrumpNotAssigned();
    error InvalidAddress();
    error MessageTooLong();
    error InsufficientMintPayment();
    error InvalidRoyaltyBasisPoints();
    error EmptyMessage();
    error UnauthorizedBurner();
    error TrumpCannotBeBurned();

    // ============ Constructor ============

    /**
     * @notice Initialize the CryptoTrump marketplace
     * @param _treasury Project treasury address for royalties and contributions
     */
    constructor(
        address _treasury
    ) ERC721(COLLECTION_NAME, TOKEN_SYMBOL) Ownable(msg.sender) {
        require(_treasury != address(0), "Invalid treasury address");

        nextTrumpIndexToAssign = 0;
        trumpsRemainingToAssign = TOTAL_TRUMPS;
        allTrumpsAssigned = false;

        // Initialize royalty (3% to project treasury)
        projectTreasury = _treasury;
        _setDefaultRoyalty(_treasury, DEFAULT_ROYALTY_BPS);

        // Set default minimum mint price (can be updated by owner)
        minimumMintPrice = 0.01 ether;
    }

    // ============ Initial Distribution Functions ============

    /**
     * @notice Assign initial ownership of a Trump (only owner, before all assigned)
     * @param to Address to assign the Trump to
     * @param trumpIndex Index of the Trump to assign
     */
    function setInitialOwner(address to, uint256 trumpIndex) external onlyOwner {
        if (allTrumpsAssigned) revert AllTrumpsAlreadyAssigned();
        if (trumpIndex >= TOTAL_TRUMPS) revert TrumpIndexOutOfRange();
        if (to == address(0)) revert InvalidAddress();

        if (_exists(trumpIndex)) {
            address currentOwner = ownerOf(trumpIndex);
            if (currentOwner != to) {
                _transfer(currentOwner, to, trumpIndex);
            }
        } else {
            _safeMint(to, trumpIndex);
            trumpsRemainingToAssign--;
            emit TrumpAssigned(to, trumpIndex);
        }
    }

    /**
     * @notice Batch assign initial owners
     * @param addresses Array of addresses to assign Trumps to
     * @param indices Array of Trump indices to assign
     */
    function setInitialOwners(address[] calldata addresses, uint256[] calldata indices) external onlyOwner {
        require(addresses.length == indices.length, "Array length mismatch");

        for (uint256 i = 0; i < addresses.length; i++) {
            setInitialOwner(addresses[i], indices[i]);
        }
    }

    /**
     * @notice Mark all initial Trump assignments as complete
     */
    function allInitialOwnersAssigned() external onlyOwner {
        allTrumpsAssigned = true;
    }

    /**
     * @notice Claim an unassigned Trump (after initial distribution is complete)
     * @param trumpIndex Index of the Trump to claim
     */
    function getTrump(uint256 trumpIndex) external {
        if (!allTrumpsAssigned) revert TrumpsNotYetAssigned();
        if (trumpsRemainingToAssign == 0) revert AllTrumpsAlreadyAssigned();
        if (trumpIndex >= TOTAL_TRUMPS) revert TrumpIndexOutOfRange();
        if (_exists(trumpIndex)) revert TrumpAlreadyAssigned();

        _safeMint(msg.sender, trumpIndex);
        trumpsRemainingToAssign--;
        emit TrumpAssigned(msg.sender, trumpIndex);
    }

    // ============ Transfer Functions ============

    /**
     * @notice Transfer a Trump to another address (free transfer, no payment)
     * @param to Address to transfer to
     * @param trumpIndex Index of the Trump to transfer
     */
    function transferTrump(address to, uint256 trumpIndex) external {
        if (!allTrumpsAssigned) revert TrumpsNotYetAssigned();
        if (trumpIndex >= TOTAL_TRUMPS) revert TrumpIndexOutOfRange();
        if (ownerOf(trumpIndex) != msg.sender) revert NotTrumpOwner();
        if (to == address(0)) revert InvalidAddress();

        if (trumpsOfferedForSale[trumpIndex].isForSale) {
            _removeTrumpFromSale(trumpIndex);
        }

        _transfer(msg.sender, to, trumpIndex);
        emit TrumpTransfer(msg.sender, to, trumpIndex);

        Bid memory bid = trumpBids[trumpIndex];
        if (bid.hasBid && bid.bidder == to) {
            pendingWithdrawals[to] += bid.value;
            delete trumpBids[trumpIndex];
        }
    }

    /**
     * @notice Override ERC721 transfer to handle marketplace state
     */
    function _afterTokenTransfer(
        address from,
        address to,
        uint256 firstTokenId,
        uint256 batchSize
    ) internal virtual override {
        super._afterTokenTransfer(from, to, firstTokenId, batchSize);

        if (from != address(0) && to != address(0)) {
            if (trumpsOfferedForSale[firstTokenId].isForSale &&
                trumpsOfferedForSale[firstTokenId].seller == from) {
                delete trumpsOfferedForSale[firstTokenId];
            }
        }
    }

    // ============ Sale Functions ============

    /**
     * @notice Offer a Trump for sale to anyone
     * @param trumpIndex Index of the Trump to sell
     * @param minSalePriceInWei Minimum sale price in wei
     */
    function offerTrumpForSale(uint256 trumpIndex, uint256 minSalePriceInWei) external {
        if (!allTrumpsAssigned) revert TrumpsNotYetAssigned();
        if (trumpIndex >= TOTAL_TRUMPS) revert TrumpIndexOutOfRange();
        if (ownerOf(trumpIndex) != msg.sender) revert NotTrumpOwner();

        trumpsOfferedForSale[trumpIndex] = Offer({
            isForSale: true,
            trumpIndex: trumpIndex,
            seller: msg.sender,
            minValue: minSalePriceInWei,
            onlySellTo: address(0)
        });

        emit TrumpOffered(trumpIndex, minSalePriceInWei, address(0));
    }

    /**
     * @notice Offer a Trump for sale to a specific address only
     * @param trumpIndex Index of the Trump to sell
     * @param minSalePriceInWei Minimum sale price in wei
     * @param toAddress Address that is allowed to buy
     */
    function offerTrumpForSaleToAddress(
        uint256 trumpIndex,
        uint256 minSalePriceInWei,
        address toAddress
    ) external {
        if (!allTrumpsAssigned) revert TrumpsNotYetAssigned();
        if (trumpIndex >= TOTAL_TRUMPS) revert TrumpIndexOutOfRange();
        if (ownerOf(trumpIndex) != msg.sender) revert NotTrumpOwner();
        if (toAddress == address(0)) revert InvalidAddress();

        trumpsOfferedForSale[trumpIndex] = Offer({
            isForSale: true,
            trumpIndex: trumpIndex,
            seller: msg.sender,
            minValue: minSalePriceInWei,
            onlySellTo: toAddress
        });

        emit TrumpOffered(trumpIndex, minSalePriceInWei, toAddress);
    }

    /**
     * @notice Buy a Trump that is offered for sale
     * @param trumpIndex Index of the Trump to buy
     */
    function buyTrump(uint256 trumpIndex) external payable nonReentrant whenNotPaused {
        if (!allTrumpsAssigned) revert TrumpsNotYetAssigned();
        if (trumpIndex >= TOTAL_TRUMPS) revert TrumpIndexOutOfRange();

        Offer memory offer = trumpsOfferedForSale[trumpIndex];

        if (!offer.isForSale) revert TrumpNotForSale();
        if (offer.onlySellTo != address(0) && offer.onlySellTo != msg.sender) revert NotIntendedBuyer();
        if (msg.value < offer.minValue) revert InsufficientPayment();

        address seller = offer.seller;
        if (seller != ownerOf(trumpIndex)) revert InvalidSeller();

        _transfer(seller, msg.sender, trumpIndex);
        delete trumpsOfferedForSale[trumpIndex];
        pendingWithdrawals[seller] += msg.value;

        emit TrumpBought(trumpIndex, msg.value, seller, msg.sender);

        Bid memory bid = trumpBids[trumpIndex];
        if (bid.hasBid && bid.bidder == msg.sender) {
            pendingWithdrawals[msg.sender] += bid.value;
            delete trumpBids[trumpIndex];
        }
    }

    /**
     * @notice Remove a Trump from sale
     * @param trumpIndex Index of the Trump to remove from sale
     */
    function trumpNoLongerForSale(uint256 trumpIndex) external {
        if (!allTrumpsAssigned) revert TrumpsNotYetAssigned();
        if (trumpIndex >= TOTAL_TRUMPS) revert TrumpIndexOutOfRange();
        if (ownerOf(trumpIndex) != msg.sender) revert NotTrumpOwner();

        _removeTrumpFromSale(trumpIndex);
    }

    /**
     * @notice Internal function to remove Trump from sale
     */
    function _removeTrumpFromSale(uint256 trumpIndex) internal {
        delete trumpsOfferedForSale[trumpIndex];
        emit TrumpNoLongerForSale(trumpIndex);
    }

    // ============ Bidding Functions ============

    /**
     * @notice Enter a bid for a Trump
     * @param trumpIndex Index of the Trump to bid on
     */
    function enterBidForTrump(uint256 trumpIndex) external payable nonReentrant whenNotPaused {
        if (trumpIndex >= TOTAL_TRUMPS) revert TrumpIndexOutOfRange();
        if (!allTrumpsAssigned) revert TrumpsNotYetAssigned();
        if (!_exists(trumpIndex)) revert TrumpNotAssigned();
        if (ownerOf(trumpIndex) == msg.sender) revert CannotBidOnOwnTrump();
        if (msg.value == 0) revert BidMustBePositive();

        Bid memory existingBid = trumpBids[trumpIndex];
        if (msg.value <= existingBid.value) revert BidTooLow();

        if (existingBid.hasBid && existingBid.value > 0) {
            pendingWithdrawals[existingBid.bidder] += existingBid.value;
        }

        trumpBids[trumpIndex] = Bid({
            hasBid: true,
            trumpIndex: trumpIndex,
            bidder: msg.sender,
            value: msg.value
        });

        emit TrumpBidEntered(trumpIndex, msg.value, msg.sender);
    }

    /**
     * @notice Accept a bid for your Trump
     * @param trumpIndex Index of the Trump
     * @param minPrice Minimum price to accept (protection against bid changes)
     */
    function acceptBidForTrump(uint256 trumpIndex, uint256 minPrice) external nonReentrant whenNotPaused {
        if (trumpIndex >= TOTAL_TRUMPS) revert TrumpIndexOutOfRange();
        if (!allTrumpsAssigned) revert TrumpsNotYetAssigned();
        if (ownerOf(trumpIndex) != msg.sender) revert NotTrumpOwner();

        Bid memory bid = trumpBids[trumpIndex];
        if (!bid.hasBid || bid.value == 0) revert NoBidExists();
        if (bid.value < minPrice) revert BidTooLow();

        address seller = msg.sender;
        address buyer = bid.bidder;
        uint256 amount = bid.value;

        _transfer(seller, buyer, trumpIndex);
        delete trumpsOfferedForSale[trumpIndex];
        delete trumpBids[trumpIndex];
        pendingWithdrawals[seller] += amount;

        emit TrumpBought(trumpIndex, amount, seller, buyer);
    }

    /**
     * @notice Withdraw a bid for a Trump
     * @param trumpIndex Index of the Trump
     */
    function withdrawBidForTrump(uint256 trumpIndex) external nonReentrant {
        if (trumpIndex >= TOTAL_TRUMPS) revert TrumpIndexOutOfRange();
        if (!allTrumpsAssigned) revert TrumpsNotYetAssigned();
        if (!_exists(trumpIndex)) revert TrumpNotAssigned();
        if (ownerOf(trumpIndex) == msg.sender) revert CannotBidOnOwnTrump();

        Bid memory bid = trumpBids[trumpIndex];
        if (!bid.hasBid) revert NoBidExists();
        if (bid.bidder != msg.sender) revert NotBidder();

        uint256 amount = bid.value;
        delete trumpBids[trumpIndex];

        emit TrumpBidWithdrawn(trumpIndex, amount, msg.sender);

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
    }

    // ============ Withdrawal Functions ============

    /**
     * @notice Withdraw accumulated funds from sales
     */
    function withdraw() external nonReentrant {
        if (!allTrumpsAssigned) revert TrumpsNotYetAssigned();

        uint256 amount = pendingWithdrawals[msg.sender];
        if (amount == 0) revert NoFundsToWithdraw();

        pendingWithdrawals[msg.sender] = 0;

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
    }

    // ============ Custom Message Functions (Inspired by Pak's Censored) ============

    /**
     * @notice Set a custom message for your Trump
     * @param trumpIndex Index of the Trump
     * @param message Custom message (max 72 characters, like Pak's Censored)
     */
    function setTrumpMessage(uint256 trumpIndex, string calldata message) external payable nonReentrant whenNotPaused {
        if (trumpIndex >= TOTAL_TRUMPS) revert TrumpIndexOutOfRange();
        if (!_exists(trumpIndex)) revert TrumpNotAssigned();
        if (ownerOf(trumpIndex) != msg.sender) revert NotTrumpOwner();

        bytes memory messageBytes = bytes(message);
        if (messageBytes.length == 0) revert EmptyMessage();
        if (messageBytes.length > MAX_MESSAGE_LENGTH) revert MessageTooLong();

        trumpMessages[trumpIndex] = TrumpMessage({
            message: message,
            author: msg.sender,
            timestamp: block.timestamp,
            valuePaid: msg.value
        });

        if (msg.value > 0) {
            totalContributions[msg.sender] += msg.value;
            (bool success, ) = projectTreasury.call{value: msg.value}("");
            require(success, "Transfer to treasury failed");
            emit ContributionReceived(msg.sender, msg.value, trumpIndex);
        }

        emit MessageSet(trumpIndex, msg.sender, message, msg.value);
    }

    /**
     * @notice Get the custom message for a Trump
     * @param trumpIndex Index of the Trump
     * @return The Trump message struct
     */
    function getTrumpMessage(uint256 trumpIndex) external view returns (TrumpMessage memory) {
        return trumpMessages[trumpIndex];
    }

    /**
     * @notice Mint a Trump with a custom message (pay-what-you-want above minimum)
     * @param trumpIndex Index of the Trump to mint
     * @param message Custom message to attach (max 72 characters)
     */
    function mintWithMessage(uint256 trumpIndex, string calldata message) external payable nonReentrant whenNotPaused {
        if (!allTrumpsAssigned) revert TrumpsNotYetAssigned();
        if (trumpsRemainingToAssign == 0) revert AllTrumpsAlreadyAssigned();
        if (trumpIndex >= TOTAL_TRUMPS) revert TrumpIndexOutOfRange();
        if (_exists(trumpIndex)) revert TrumpAlreadyAssigned();
        if (msg.value < minimumMintPrice) revert InsufficientMintPayment();

        bytes memory messageBytes = bytes(message);
        if (messageBytes.length > 0 && messageBytes.length > MAX_MESSAGE_LENGTH) revert MessageTooLong();

        // Mint the Trump
        _safeMint(msg.sender, trumpIndex);
        trumpsRemainingToAssign--;
        emit TrumpAssigned(msg.sender, trumpIndex);

        // Set message if provided
        if (messageBytes.length > 0) {
            trumpMessages[trumpIndex] = TrumpMessage({
                message: message,
                author: msg.sender,
                timestamp: block.timestamp,
                valuePaid: msg.value
            });
            emit MessageSet(trumpIndex, msg.sender, message, msg.value);
        }

        // Handle payment (pay-what-you-want)
        if (msg.value > 0) {
            totalContributions[msg.sender] += msg.value;
            (bool success, ) = projectTreasury.call{value: msg.value}("");
            require(success, "Transfer to treasury failed");
            emit ContributionReceived(msg.sender, msg.value, trumpIndex);
        }
    }

    // ============ Cross-Chain Functions ============
    // NOTE: Cross-chain functionality will be added in a future version with LayerZero V2
    // For now, standard ERC721 transfers are supported

    // ============ Admin Functions ============

    /**
     * @notice Pause the contract (emergency)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Set base URI for token metadata
     * @param baseURI The base URI string
     */
    function setBaseURI(string calldata baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }

    /**
     * @notice Update royalty information (ERC2981)
     * @param recipient Address to receive royalties
     * @param basisPoints Royalty percentage in basis points (e.g., 300 = 3%)
     */
    function setRoyaltyInfo(address recipient, uint96 basisPoints) external onlyOwner {
        if (recipient == address(0)) revert InvalidAddress();
        if (basisPoints > 10000) revert InvalidRoyaltyBasisPoints(); // Max 100%

        _setDefaultRoyalty(recipient, basisPoints);
        emit RoyaltyInfoUpdated(recipient, basisPoints);
    }

    /**
     * @notice Update minimum mint price for pay-what-you-want minting
     * @param newPrice New minimum price in wei
     */
    function setMinimumMintPrice(uint256 newPrice) external onlyOwner {
        minimumMintPrice = newPrice;
        emit MinimumMintPriceUpdated(newPrice);
    }

    /**
     * @notice Update project treasury address
     * @param newTreasury New treasury address
     */
    function setProjectTreasury(address newTreasury) external onlyOwner {
        if (newTreasury == address(0)) revert InvalidAddress();
        address oldTreasury = projectTreasury;
        projectTreasury = newTreasury;
        emit ProjectTreasuryUpdated(oldTreasury, newTreasury);
    }

    /**
     * @notice Set authorized merge contract
     * @param _mergeContract Address of merge contract
     */
    function setMergeContract(address _mergeContract) external onlyOwner {
        if (_mergeContract == address(0)) revert InvalidAddress();
        address oldMergeContract = mergeContract;
        mergeContract = _mergeContract;
        emit MergeContractUpdated(oldMergeContract, _mergeContract);
    }

    /**
     * @notice Set rarity tier for a Trump (owner or during setup)
     * @param trumpId Trump ID
     * @param rarityTier Rarity tier name
     */
    function setRarityTier(uint256 trumpId, string calldata rarityTier) external onlyOwner {
        if (trumpId >= TOTAL_TRUMPS) revert TrumpIndexOutOfRange();
        trumpRarityTier[trumpId] = rarityTier;
        emit RarityTierSet(trumpId, rarityTier);
    }

    /**
     * @notice Batch set rarity tiers (for initial setup)
     * @param trumpIds Array of Trump IDs
     * @param rarityTiers Array of rarity tier names
     */
    function setRarityTierBatch(
        uint256[] calldata trumpIds,
        string[] calldata rarityTiers
    ) external onlyOwner {
        require(trumpIds.length == rarityTiers.length, "Array length mismatch");

        for (uint256 i = 0; i < trumpIds.length; i++) {
            if (trumpIds[i] < TOTAL_TRUMPS) {
                trumpRarityTier[trumpIds[i]] = rarityTiers[i];
                emit RarityTierSet(trumpIds[i], rarityTiers[i]);
            }
        }
    }

    // ============ Burn Functions (For Merge System) ============

    /**
     * @notice Burn a Trump NFT (only callable by authorized merge contract)
     * @param trumpId Trump ID to burn
     */
    function burnTrump(uint256 trumpId) external nonReentrant {
        if (msg.sender != mergeContract) revert UnauthorizedBurner();
        if (trumpId >= TOTAL_TRUMPS) revert TrumpIndexOutOfRange();
        if (!_exists(trumpId)) revert TrumpNotAssigned();

        // Get rarity before burning
        string memory rarity = trumpRarityTier[trumpId];

        // Remove from sale if listed
        if (trumpsOfferedForSale[trumpId].isForSale) {
            delete trumpsOfferedForSale[trumpId];
        }

        // Return bid if exists
        if (trumpBids[trumpId].hasBid) {
            Bid memory bid = trumpBids[trumpId];
            pendingWithdrawals[bid.bidder] += bid.value;
            delete trumpBids[trumpId];
        }

        // Burn the NFT
        _burn(trumpId);

        emit TrumpBurned(trumpId, tx.origin, rarity);
    }

    // ============ View Functions ============

    /**
     * @notice Get the current offer for a Trump
     * @param trumpIndex Index of the Trump
     * @return The offer struct
     */
    function getTrumpOffer(uint256 trumpIndex) external view returns (Offer memory) {
        return trumpsOfferedForSale[trumpIndex];
    }

    /**
     * @notice Get the current bid for a Trump
     * @param trumpIndex Index of the Trump
     * @return The bid struct
     */
    function getTrumpBid(uint256 trumpIndex) external view returns (Bid memory) {
        return trumpBids[trumpIndex];
    }

    /**
     * @notice Get rarity tier for a Trump
     * @param trumpId Trump ID
     * @return Rarity tier name
     */
    function getRarityTier(uint256 trumpId) external view returns (string memory) {
        if (bytes(trumpRarityTier[trumpId]).length == 0) {
            return "Common"; // Default if not set
        }
        return trumpRarityTier[trumpId];
    }

    /**
     * @notice Check if a token exists
     * @param tokenId Token ID to check
     * @return True if token exists
     */
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    /**
     * @notice Get base URI for token metadata
     */
    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    /**
     * @notice Get token URI
     * @param tokenId Token ID
     * @return Token URI string
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        return super.tokenURI(tokenId);
    }

    /**
     * @notice Check interface support (ERC721 + ERC2981)
     * @param interfaceId Interface identifier
     * @return True if interface is supported
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
