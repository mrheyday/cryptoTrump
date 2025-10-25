// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@layerzerolabs/lz-evm-oapp-v2/contracts/oft/OFT721.sol";

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
 * - Cross-chain transfers via LayerZero V2
 * - Built-in marketplace for buying, selling, and bidding
 * - Solidity 0.8.20 with modern security patterns
 * - OpenZeppelin audited contracts
 * - Pausable for emergency situations
 */
contract CryptoTrumpMarketplace is OFT721, ReentrancyGuard, Pausable {

    // ============ Constants ============

    /// @notice Total number of CryptoTrumps - The best number, believe me!
    uint256 public constant TOTAL_TRUMPS = 10000;

    /// @notice Collection name
    string public constant COLLECTION_NAME = "CryptoTrump";

    /// @notice Token symbol - TRUMP!
    string public constant TOKEN_SYMBOL = "TRUMP";

    /// @notice Version number
    string public constant VERSION = "1.0.0";

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

    /// @notice Emitted when a cross-chain transfer is initiated
    event CrossChainTransferInitiated(uint256 indexed trumpIndex, address indexed from, uint32 indexed dstEid, address to);

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

    // ============ Constructor ============

    /**
     * @notice Initialize the CryptoTrump marketplace with cross-chain capabilities
     * @param _lzEndpoint LayerZero endpoint address for cross-chain messaging
     * @param _delegate Address that can configure LayerZero settings
     */
    constructor(
        address _lzEndpoint,
        address _delegate
    ) OFT721(COLLECTION_NAME, TOKEN_SYMBOL, _lzEndpoint, _delegate) {
        nextTrumpIndexToAssign = 0;
        trumpsRemainingToAssign = TOTAL_TRUMPS;
        allTrumpsAssigned = false;
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

    // ============ Cross-Chain Functions ============

    /**
     * @notice Send a Trump to another chain
     * @param trumpIndex Index of the Trump to send
     * @param dstEid Destination chain endpoint ID
     * @param to Recipient address on destination chain
     * @param options LayerZero message options
     */
    function sendTrumpCrossChain(
        uint256 trumpIndex,
        uint32 dstEid,
        address to,
        bytes calldata options
    ) external payable nonReentrant whenNotPaused {
        if (trumpIndex >= TOTAL_TRUMPS) revert TrumpIndexOutOfRange();
        if (ownerOf(trumpIndex) != msg.sender) revert NotTrumpOwner();
        if (to == address(0)) revert InvalidAddress();

        if (trumpsOfferedForSale[trumpIndex].isForSale) {
            _removeTrumpFromSale(trumpIndex);
        }

        if (trumpBids[trumpIndex].hasBid) {
            Bid memory bid = trumpBids[trumpIndex];
            pendingWithdrawals[bid.bidder] += bid.value;
            delete trumpBids[trumpIndex];
        }

        bytes32 toBytes32 = bytes32(uint256(uint160(to)));

        send(
            SendParam({
                dstEid: dstEid,
                to: toBytes32,
                tokenId: trumpIndex,
                extraOptions: options,
                composeMsg: "",
                oftCmd: ""
            }),
            MessagingFee({nativeFee: msg.value, lzTokenFee: 0}),
            payable(msg.sender)
        );

        emit CrossChainTransferInitiated(trumpIndex, msg.sender, dstEid, to);
    }

    /**
     * @notice Quote the fee for cross-chain transfer
     * @param trumpIndex Index of the Trump
     * @param dstEid Destination endpoint ID
     * @param to Recipient address
     * @param options LayerZero options
     * @return fee The messaging fee required
     */
    function quoteSendTrump(
        uint256 trumpIndex,
        uint32 dstEid,
        address to,
        bytes calldata options
    ) external view returns (MessagingFee memory fee) {
        bytes32 toBytes32 = bytes32(uint256(uint160(to)));

        return quoteSend(
            SendParam({
                dstEid: dstEid,
                to: toBytes32,
                tokenId: trumpIndex,
                extraOptions: options,
                composeMsg: "",
                oftCmd: ""
            }),
            false
        );
    }

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
}
