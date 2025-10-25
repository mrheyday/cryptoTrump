// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../../src/CryptoTrumpMarketplace.sol";

/**
 * @title CryptoTrumpMarketplaceTest
 * @notice Comprehensive test suite for CryptoTrumpMarketplace
 * @dev Uses Foundry's testing framework
 */
contract CryptoTrumpMarketplaceTest is Test {
    CryptoTrumpMarketplace public cryptoTrump;

    address public owner;
    address public user1;
    address public user2;
    address public user3;

    // Events for testing
    event TrumpAssigned(address indexed to, uint256 indexed trumpIndex);
    event TrumpTransfer(address indexed from, address indexed to, uint256 indexed trumpIndex);
    event TrumpOffered(uint256 indexed trumpIndex, uint256 minValue, address indexed toAddress);
    event TrumpBidEntered(uint256 indexed trumpIndex, uint256 value, address indexed fromAddress);
    event TrumpBidWithdrawn(uint256 indexed trumpIndex, uint256 value, address indexed fromAddress);
    event TrumpBought(uint256 indexed trumpIndex, uint256 value, address indexed fromAddress, address indexed toAddress);
    event TrumpNoLongerForSale(uint256 indexed trumpIndex);

    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        user3 = makeAddr("user3");

        // Deploy contract
        cryptoTrump = new CryptoTrumpMarketplace();

        // Fund test accounts
        vm.deal(user1, 100 ether);
        vm.deal(user2, 100 ether);
        vm.deal(user3, 100 ether);
    }

    // ============ Deployment Tests ============

    function test_Deployment_TotalSupply() public view {
        assertEq(cryptoTrump.TOTAL_TRUMPS(), 10000);
    }

    function test_Deployment_CollectionName() public view {
        assertEq(cryptoTrump.COLLECTION_NAME(), "CryptoTrump");
    }

    function test_Deployment_TokenSymbol() public view {
        assertEq(cryptoTrump.TOKEN_SYMBOL(), "TRUMP");
    }

    function test_Deployment_InitialState() public view {
        assertEq(cryptoTrump.allTrumpsAssigned(), false);
        assertEq(cryptoTrump.trumpsRemainingToAssign(), 10000);
    }

    function test_Deployment_Owner() public view {
        assertEq(cryptoTrump.owner(), owner);
    }

    function test_Deployment_Name() public view {
        assertEq(cryptoTrump.name(), "CryptoTrump");
    }

    function test_Deployment_Symbol() public view {
        assertEq(cryptoTrump.symbol(), "TRUMP");
    }

    // ============ Initial Assignment Tests ============

    function test_InitialAssignment_OwnerCanAssign() public {
        vm.expectEmit(true, true, false, true);
        emit TrumpAssigned(user1, 0);

        cryptoTrump.setInitialOwner(user1, 0);

        assertEq(cryptoTrump.ownerOf(0), user1);
        assertEq(cryptoTrump.balanceOf(user1), 1);
        assertEq(cryptoTrump.trumpsRemainingToAssign(), 9999);
    }

    function test_InitialAssignment_BatchAssign() public {
        address[] memory addresses = new address[](3);
        addresses[0] = user1;
        addresses[1] = user2;
        addresses[2] = user3;

        uint256[] memory indices = new uint256[](3);
        indices[0] = 0;
        indices[1] = 1;
        indices[2] = 2;

        cryptoTrump.setInitialOwners(addresses, indices);

        assertEq(cryptoTrump.ownerOf(0), user1);
        assertEq(cryptoTrump.ownerOf(1), user2);
        assertEq(cryptoTrump.ownerOf(2), user3);
        assertEq(cryptoTrump.trumpsRemainingToAssign(), 9997);
    }

    function test_InitialAssignment_RevertNonOwner() public {
        vm.prank(user1);
        vm.expectRevert(abi.encodeWithSignature("OwnableUnauthorizedAccount(address)", user1));
        cryptoTrump.setInitialOwner(user1, 0);
    }

    function test_InitialAssignment_RevertAfterAssignmentEnds() public {
        cryptoTrump.allInitialOwnersAssigned();

        vm.expectRevert(CryptoTrumpMarketplace.AllTrumpsAlreadyAssigned.selector);
        cryptoTrump.setInitialOwner(user1, 0);
    }

    function test_InitialAssignment_RevertInvalidIndex() public {
        vm.expectRevert(CryptoTrumpMarketplace.TrumpIndexOutOfRange.selector);
        cryptoTrump.setInitialOwner(user1, 10000);
    }

    function test_InitialAssignment_RevertZeroAddress() public {
        vm.expectRevert(CryptoTrumpMarketplace.InvalidAddress.selector);
        cryptoTrump.setInitialOwner(address(0), 0);
    }

    // ============ Public Claiming Tests ============

    function test_PublicClaim_AfterDistributionEnds() public {
        cryptoTrump.allInitialOwnersAssigned();

        vm.prank(user1);
        vm.expectEmit(true, true, false, true);
        emit TrumpAssigned(user1, 100);
        cryptoTrump.getTrump(100);

        assertEq(cryptoTrump.ownerOf(100), user1);
        assertEq(cryptoTrump.trumpsRemainingToAssign(), 9999);
    }

    function test_PublicClaim_RevertBeforeDistributionEnds() public {
        vm.prank(user1);
        vm.expectRevert(CryptoTrumpMarketplace.TrumpsNotYetAssigned.selector);
        cryptoTrump.getTrump(100);
    }

    function test_PublicClaim_RevertAlreadyAssigned() public {
        cryptoTrump.setInitialOwner(user1, 100);
        cryptoTrump.allInitialOwnersAssigned();

        vm.prank(user2);
        vm.expectRevert(CryptoTrumpMarketplace.TrumpAlreadyAssigned.selector);
        cryptoTrump.getTrump(100);
    }

    // ============ Transfer Tests ============

    function test_Transfer_BasicTransfer() public {
        cryptoTrump.setInitialOwner(user1, 0);
        cryptoTrump.allInitialOwnersAssigned();

        vm.prank(user1);
        vm.expectEmit(true, true, true, true);
        emit TrumpTransfer(user1, user2, 0);
        cryptoTrump.transferTrump(user2, 0);

        assertEq(cryptoTrump.ownerOf(0), user2);
        assertEq(cryptoTrump.balanceOf(user1), 0);
        assertEq(cryptoTrump.balanceOf(user2), 1);
    }

    function test_Transfer_RevertNotOwner() public {
        cryptoTrump.setInitialOwner(user1, 0);
        cryptoTrump.allInitialOwnersAssigned();

        vm.prank(user2);
        vm.expectRevert(CryptoTrumpMarketplace.NotTrumpOwner.selector);
        cryptoTrump.transferTrump(user2, 0);
    }

    function test_Transfer_RevertZeroAddress() public {
        cryptoTrump.setInitialOwner(user1, 0);
        cryptoTrump.allInitialOwnersAssigned();

        vm.prank(user1);
        vm.expectRevert(CryptoTrumpMarketplace.InvalidAddress.selector);
        cryptoTrump.transferTrump(address(0), 0);
    }

    // ============ Marketplace Sale Tests ============

    function test_Sale_OfferForSale() public {
        cryptoTrump.setInitialOwner(user1, 0);
        cryptoTrump.allInitialOwnersAssigned();

        vm.prank(user1);
        vm.expectEmit(true, false, false, true);
        emit TrumpOffered(0, 1 ether, address(0));
        cryptoTrump.offerTrumpForSale(0, 1 ether);

        (bool isForSale, uint256 trumpIndex, address seller, uint256 minValue, address onlySellTo) =
            cryptoTrump.trumpsOfferedForSale(0);

        assertTrue(isForSale);
        assertEq(trumpIndex, 0);
        assertEq(seller, user1);
        assertEq(minValue, 1 ether);
        assertEq(onlySellTo, address(0));
    }

    function test_Sale_OfferToSpecificAddress() public {
        cryptoTrump.setInitialOwner(user1, 0);
        cryptoTrump.allInitialOwnersAssigned();

        vm.prank(user1);
        cryptoTrump.offerTrumpForSaleToAddress(0, 1 ether, user2);

        (,,,, address onlySellTo) = cryptoTrump.trumpsOfferedForSale(0);
        assertEq(onlySellTo, user2);
    }

    function test_Sale_BuyTrump() public {
        cryptoTrump.setInitialOwner(user1, 0);
        cryptoTrump.allInitialOwnersAssigned();

        vm.prank(user1);
        cryptoTrump.offerTrumpForSale(0, 1 ether);

        vm.prank(user2);
        vm.expectEmit(true, true, true, true);
        emit TrumpBought(0, 1 ether, user1, user2);
        cryptoTrump.buyTrump{value: 1 ether}(0);

        assertEq(cryptoTrump.ownerOf(0), user2);
        assertEq(cryptoTrump.pendingWithdrawals(user1), 1 ether);
    }

    function test_Sale_RevertInsufficientPayment() public {
        cryptoTrump.setInitialOwner(user1, 0);
        cryptoTrump.allInitialOwnersAssigned();

        vm.prank(user1);
        cryptoTrump.offerTrumpForSale(0, 1 ether);

        vm.prank(user2);
        vm.expectRevert(CryptoTrumpMarketplace.InsufficientPayment.selector);
        cryptoTrump.buyTrump{value: 0.5 ether}(0);
    }

    function test_Sale_RevertNotForSale() public {
        cryptoTrump.setInitialOwner(user1, 0);
        cryptoTrump.allInitialOwnersAssigned();

        vm.prank(user2);
        vm.expectRevert(CryptoTrumpMarketplace.TrumpNotForSale.selector);
        cryptoTrump.buyTrump{value: 1 ether}(0);
    }

    function test_Sale_RemoveFromSale() public {
        cryptoTrump.setInitialOwner(user1, 0);
        cryptoTrump.allInitialOwnersAssigned();

        vm.prank(user1);
        cryptoTrump.offerTrumpForSale(0, 1 ether);

        vm.prank(user1);
        vm.expectEmit(true, false, false, true);
        emit TrumpNoLongerForSale(0);
        cryptoTrump.trumpNoLongerForSale(0);

        (bool isForSale,,,,) = cryptoTrump.trumpsOfferedForSale(0);
        assertFalse(isForSale);
    }

    // ============ Bidding Tests ============

    function test_Bidding_PlaceBid() public {
        cryptoTrump.setInitialOwner(user1, 0);
        cryptoTrump.allInitialOwnersAssigned();

        vm.prank(user2);
        vm.expectEmit(true, false, false, true);
        emit TrumpBidEntered(0, 1 ether, user2);
        cryptoTrump.enterBidForTrump{value: 1 ether}(0);

        (bool hasBid, uint256 trumpIndex, address bidder, uint256 value) =
            cryptoTrump.trumpBids(0);

        assertTrue(hasBid);
        assertEq(trumpIndex, 0);
        assertEq(bidder, user2);
        assertEq(value, 1 ether);
    }

    function test_Bidding_AcceptBid() public {
        cryptoTrump.setInitialOwner(user1, 0);
        cryptoTrump.allInitialOwnersAssigned();

        vm.prank(user2);
        cryptoTrump.enterBidForTrump{value: 1 ether}(0);

        vm.prank(user1);
        cryptoTrump.acceptBidForTrump(0, 1 ether);

        assertEq(cryptoTrump.ownerOf(0), user2);
        assertEq(cryptoTrump.pendingWithdrawals(user1), 1 ether);
    }

    function test_Bidding_WithdrawBid() public {
        cryptoTrump.setInitialOwner(user1, 0);
        cryptoTrump.allInitialOwnersAssigned();

        vm.prank(user2);
        cryptoTrump.enterBidForTrump{value: 1 ether}(0);

        uint256 balanceBefore = user2.balance;

        vm.prank(user2);
        vm.expectEmit(true, false, false, true);
        emit TrumpBidWithdrawn(0, 1 ether, user2);
        cryptoTrump.withdrawBidForTrump(0);

        assertEq(user2.balance, balanceBefore + 1 ether);
        (bool hasBid,,,) = cryptoTrump.trumpBids(0);
        assertFalse(hasBid);
    }

    function test_Bidding_RevertBidOnOwnTrump() public {
        cryptoTrump.setInitialOwner(user1, 0);
        cryptoTrump.allInitialOwnersAssigned();

        vm.prank(user1);
        vm.expectRevert(CryptoTrumpMarketplace.CannotBidOnOwnTrump.selector);
        cryptoTrump.enterBidForTrump{value: 1 ether}(0);
    }

    function test_Bidding_RevertZeroBid() public {
        cryptoTrump.setInitialOwner(user1, 0);
        cryptoTrump.allInitialOwnersAssigned();

        vm.prank(user2);
        vm.expectRevert(CryptoTrumpMarketplace.BidMustBePositive.selector);
        cryptoTrump.enterBidForTrump{value: 0}(0);
    }

    function test_Bidding_HigherBidReplacesLower() public {
        cryptoTrump.setInitialOwner(user1, 0);
        cryptoTrump.allInitialOwnersAssigned();

        // First bid
        vm.prank(user2);
        cryptoTrump.enterBidForTrump{value: 1 ether}(0);

        // Higher bid
        vm.prank(user3);
        cryptoTrump.enterBidForTrump{value: 2 ether}(0);

        // Check user2 can withdraw
        assertEq(cryptoTrump.pendingWithdrawals(user2), 1 ether);

        // Check new bid is from user3
        (,, address bidder, uint256 value) = cryptoTrump.trumpBids(0);
        assertEq(bidder, user3);
        assertEq(value, 2 ether);
    }

    // ============ Withdrawal Tests ============

    function test_Withdrawal_WithdrawSaleProceeds() public {
        cryptoTrump.setInitialOwner(user1, 0);
        cryptoTrump.allInitialOwnersAssigned();

        vm.prank(user1);
        cryptoTrump.offerTrumpForSale(0, 1 ether);

        vm.prank(user2);
        cryptoTrump.buyTrump{value: 1 ether}(0);

        uint256 balanceBefore = user1.balance;

        vm.prank(user1);
        cryptoTrump.withdraw();

        assertEq(user1.balance, balanceBefore + 1 ether);
        assertEq(cryptoTrump.pendingWithdrawals(user1), 0);
    }

    function test_Withdrawal_RevertNoFunds() public {
        cryptoTrump.allInitialOwnersAssigned();

        vm.prank(user1);
        vm.expectRevert(CryptoTrumpMarketplace.NoFundsToWithdraw.selector);
        cryptoTrump.withdraw();
    }

    // ============ Pausable Tests ============

    function test_Pause_OwnerCanPause() public {
        cryptoTrump.pause();
        assertTrue(cryptoTrump.paused());
    }

    function test_Pause_OwnerCanUnpause() public {
        cryptoTrump.pause();
        cryptoTrump.unpause();
        assertFalse(cryptoTrump.paused());
    }

    function test_Pause_BuyingPausedWhenPaused() public {
        cryptoTrump.setInitialOwner(user1, 0);
        cryptoTrump.allInitialOwnersAssigned();

        vm.prank(user1);
        cryptoTrump.offerTrumpForSale(0, 1 ether);

        cryptoTrump.pause();

        vm.prank(user2);
        vm.expectRevert(abi.encodeWithSignature("EnforcedPause()"));
        cryptoTrump.buyTrump{value: 1 ether}(0);
    }

    function test_Pause_BiddingPausedWhenPaused() public {
        cryptoTrump.setInitialOwner(user1, 0);
        cryptoTrump.allInitialOwnersAssigned();

        cryptoTrump.pause();

        vm.prank(user2);
        vm.expectRevert(abi.encodeWithSignature("EnforcedPause()"));
        cryptoTrump.enterBidForTrump{value: 1 ether}(0);
    }

    // ============ Admin Tests ============

    function test_Admin_SetBaseURI() public {
        cryptoTrump.setBaseURI("ipfs://QmTest/");

        cryptoTrump.setInitialOwner(user1, 0);

        string memory uri = cryptoTrump.tokenURI(0);
        assertEq(uri, "ipfs://QmTest/0");
    }

    // ============ Fuzz Tests ============

    function testFuzz_InitialAssignment(uint256 trumpIndex) public {
        trumpIndex = bound(trumpIndex, 0, 9999);

        cryptoTrump.setInitialOwner(user1, trumpIndex);
        assertEq(cryptoTrump.ownerOf(trumpIndex), user1);
    }

    function testFuzz_SalePrice(uint256 price) public {
        price = bound(price, 0.01 ether, 1000 ether);

        cryptoTrump.setInitialOwner(user1, 0);
        cryptoTrump.allInitialOwnersAssigned();

        vm.prank(user1);
        cryptoTrump.offerTrumpForSale(0, price);

        vm.prank(user2);
        cryptoTrump.buyTrump{value: price}(0);

        assertEq(cryptoTrump.pendingWithdrawals(user1), price);
    }

    function testFuzz_BidAmount(uint256 bidAmount) public {
        bidAmount = bound(bidAmount, 0.01 ether, 100 ether);

        cryptoTrump.setInitialOwner(user1, 0);
        cryptoTrump.allInitialOwnersAssigned();

        vm.deal(user2, bidAmount + 1 ether);

        vm.prank(user2);
        cryptoTrump.enterBidForTrump{value: bidAmount}(0);

        (,, address bidder, uint256 value) = cryptoTrump.trumpBids(0);
        assertEq(bidder, user2);
        assertEq(value, bidAmount);
    }
}
