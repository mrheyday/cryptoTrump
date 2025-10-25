const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("CryptoTrumpMarketplace", function () {
  // Fixture to deploy the contract
  async function deployCryptoTrumpFixture() {
    const [owner, addr1, addr2, addr3] = await ethers.getSigners();

    // Deploy a mock LayerZero endpoint
    const MockLZEndpoint = await ethers.getContractFactory("MockLZEndpoint");
    const lzEndpoint = await MockLZEndpoint.deploy();

    // Deploy CryptoTrumpMarketplace
    const CryptoTrumpMarketplace = await ethers.getContractFactory("CryptoTrumpMarketplace");
    const cryptoTrump = await CryptoTrumpMarketplace.deploy(
      await lzEndpoint.getAddress(),
      owner.address
    );

    return { cryptoTrump, lzEndpoint, owner, addr1, addr2, addr3 };
  }

  describe("Deployment", function () {
    it("Should set the correct total supply", async function () {
      const { cryptoTrump } = await loadFixture(deployCryptoTrumpFixture);
      expect(await cryptoTrump.TOTAL_TRUMPS()).to.equal(10000);
    });

    it("Should set the correct collection name", async function () {
      const { cryptoTrump } = await loadFixture(deployCryptoTrumpFixture);
      expect(await cryptoTrump.COLLECTION_NAME()).to.equal("CryptoTrump");
    });

    it("Should set the correct token symbol", async function () {
      const { cryptoTrump } = await loadFixture(deployCryptoTrumpFixture);
      expect(await cryptoTrump.TOKEN_SYMBOL()).to.equal("TRUMP");
    });

    it("Should initialize with no Trumps assigned", async function () {
      const { cryptoTrump } = await loadFixture(deployCryptoTrumpFixture);
      expect(await cryptoTrump.allTrumpsAssigned()).to.equal(false);
      expect(await cryptoTrump.trumpsRemainingToAssign()).to.equal(10000);
    });

    it("Should set the deployer as owner", async function () {
      const { cryptoTrump, owner } = await loadFixture(deployCryptoTrumpFixture);
      expect(await cryptoTrump.owner()).to.equal(owner.address);
    });
  });

  describe("Initial Assignment", function () {
    it("Should allow owner to assign initial Trumps", async function () {
      const { cryptoTrump, addr1 } = await loadFixture(deployCryptoTrumpFixture);

      await expect(cryptoTrump.setInitialOwner(addr1.address, 0))
        .to.emit(cryptoTrump, "TrumpAssigned")
        .withArgs(addr1.address, 0);

      expect(await cryptoTrump.ownerOf(0)).to.equal(addr1.address);
      expect(await cryptoTrump.balanceOf(addr1.address)).to.equal(1);
      expect(await cryptoTrump.trumpsRemainingToAssign()).to.equal(9999);
    });

    it("Should allow batch assignment", async function () {
      const { cryptoTrump, addr1, addr2 } = await loadFixture(deployCryptoTrumpFixture);

      await cryptoTrump.setInitialOwners([addr1.address, addr2.address], [0, 1]);

      expect(await cryptoTrump.ownerOf(0)).to.equal(addr1.address);
      expect(await cryptoTrump.ownerOf(1)).to.equal(addr2.address);
      expect(await cryptoTrump.trumpsRemainingToAssign()).to.equal(9998);
    });

    it("Should revert if non-owner tries to assign", async function () {
      const { cryptoTrump, addr1 } = await loadFixture(deployCryptoTrumpFixture);

      await expect(
        cryptoTrump.connect(addr1).setInitialOwner(addr1.address, 0)
      ).to.be.revertedWithCustomError(cryptoTrump, "OwnableUnauthorizedAccount");
    });

    it("Should revert assignment after all Trumps assigned flag is set", async function () {
      const { cryptoTrump, addr1 } = await loadFixture(deployCryptoTrumpFixture);

      await cryptoTrump.allInitialOwnersAssigned();
      await expect(
        cryptoTrump.setInitialOwner(addr1.address, 0)
      ).to.be.revertedWithCustomError(cryptoTrump, "AllTrumpsAlreadyAssigned");
    });
  });

  describe("Get Trump (Public Claiming)", function () {
    it("Should allow claiming unassigned Trump after distribution ends", async function () {
      const { cryptoTrump, addr1 } = await loadFixture(deployCryptoTrumpFixture);

      await cryptoTrump.allInitialOwnersAssigned();
      await expect(cryptoTrump.connect(addr1).getTrump(100))
        .to.emit(cryptoTrump, "TrumpAssigned")
        .withArgs(addr1.address, 100);

      expect(await cryptoTrump.ownerOf(100)).to.equal(addr1.address);
    });

    it("Should revert if called before all Trumps assigned flag", async function () {
      const { cryptoTrump, addr1 } = await loadFixture(deployCryptoTrumpFixture);

      await expect(
        cryptoTrump.connect(addr1).getTrump(0)
      ).to.be.revertedWithCustomError(cryptoTrump, "TrumpsNotYetAssigned");
    });
  });

  describe("Transfer Trump", function () {
    it("Should transfer Trump from one address to another", async function () {
      const { cryptoTrump, addr1, addr2 } = await loadFixture(deployCryptoTrumpFixture);

      await cryptoTrump.setInitialOwner(addr1.address, 0);
      await cryptoTrump.allInitialOwnersAssigned();

      await expect(cryptoTrump.connect(addr1).transferTrump(addr2.address, 0))
        .to.emit(cryptoTrump, "TrumpTransfer")
        .withArgs(addr1.address, addr2.address, 0);

      expect(await cryptoTrump.ownerOf(0)).to.equal(addr2.address);
    });
  });

  describe("Offer Trump For Sale", function () {
    it("Should allow owner to offer Trump for sale", async function () {
      const { cryptoTrump, addr1 } = await loadFixture(deployCryptoTrumpFixture);

      await cryptoTrump.setInitialOwner(addr1.address, 0);
      await cryptoTrump.allInitialOwnersAssigned();

      const price = ethers.parseEther("1");
      await expect(cryptoTrump.connect(addr1).offerTrumpForSale(0, price))
        .to.emit(cryptoTrump, "TrumpOffered")
        .withArgs(0, price, ethers.ZeroAddress);

      const offer = await cryptoTrump.getTrumpOffer(0);
      expect(offer.isForSale).to.equal(true);
      expect(offer.minValue).to.equal(price);
      expect(offer.seller).to.equal(addr1.address);
    });
  });

  describe("Buy Trump", function () {
    it("Should allow buying a Trump that is for sale", async function () {
      const { cryptoTrump, addr1, addr2 } = await loadFixture(deployCryptoTrumpFixture);

      await cryptoTrump.setInitialOwner(addr1.address, 0);
      await cryptoTrump.allInitialOwnersAssigned();

      const price = ethers.parseEther("1");
      await cryptoTrump.connect(addr1).offerTrumpForSale(0, price);

      await expect(
        cryptoTrump.connect(addr2).buyTrump(0, { value: price })
      ).to.emit(cryptoTrump, "TrumpBought")
        .withArgs(0, price, addr1.address, addr2.address);

      expect(await cryptoTrump.ownerOf(0)).to.equal(addr2.address);
      expect(await cryptoTrump.pendingWithdrawals(addr1.address)).to.equal(price);
    });

    it("Should revert if Trump is not for sale", async function () {
      const { cryptoTrump, addr1, addr2 } = await loadFixture(deployCryptoTrumpFixture);

      await cryptoTrump.setInitialOwner(addr1.address, 0);
      await cryptoTrump.allInitialOwnersAssigned();

      await expect(
        cryptoTrump.connect(addr2).buyTrump(0, { value: ethers.parseEther("1") })
      ).to.be.revertedWithCustomError(cryptoTrump, "TrumpNotForSale");
    });

    it("Should revert if payment is insufficient", async function () {
      const { cryptoTrump, addr1, addr2 } = await loadFixture(deployCryptoTrumpFixture);

      await cryptoTrump.setInitialOwner(addr1.address, 0);
      await cryptoTrump.allInitialOwnersAssigned();

      const price = ethers.parseEther("1");
      await cryptoTrump.connect(addr1).offerTrumpForSale(0, price);

      await expect(
        cryptoTrump.connect(addr2).buyTrump(0, { value: ethers.parseEther("0.5") })
      ).to.be.revertedWithCustomError(cryptoTrump, "InsufficientPayment");
    });
  });

  describe("Bidding", function () {
    it("Should allow entering a bid for a Trump", async function () {
      const { cryptoTrump, addr1, addr2 } = await loadFixture(deployCryptoTrumpFixture);

      await cryptoTrump.setInitialOwner(addr1.address, 0);
      await cryptoTrump.allInitialOwnersAssigned();

      const bidAmount = ethers.parseEther("1");
      await expect(
        cryptoTrump.connect(addr2).enterBidForTrump(0, { value: bidAmount })
      ).to.emit(cryptoTrump, "TrumpBidEntered")
        .withArgs(0, bidAmount, addr2.address);

      const bid = await cryptoTrump.getTrumpBid(0);
      expect(bid.hasBid).to.equal(true);
      expect(bid.value).to.equal(bidAmount);
      expect(bid.bidder).to.equal(addr2.address);
    });

    it("Should refund previous bidder when new higher bid is placed", async function () {
      const { cryptoTrump, addr1, addr2, addr3 } = await loadFixture(deployCryptoTrumpFixture);

      await cryptoTrump.setInitialOwner(addr1.address, 0);
      await cryptoTrump.allInitialOwnersAssigned();

      const bid1 = ethers.parseEther("1");
      const bid2 = ethers.parseEther("2");

      await cryptoTrump.connect(addr2).enterBidForTrump(0, { value: bid1 });
      await cryptoTrump.connect(addr3).enterBidForTrump(0, { value: bid2 });

      expect(await cryptoTrump.pendingWithdrawals(addr2.address)).to.equal(bid1);
    });

    it("Should allow owner to accept a bid", async function () {
      const { cryptoTrump, addr1, addr2 } = await loadFixture(deployCryptoTrumpFixture);

      await cryptoTrump.setInitialOwner(addr1.address, 0);
      await cryptoTrump.allInitialOwnersAssigned();

      const bidAmount = ethers.parseEther("1");
      await cryptoTrump.connect(addr2).enterBidForTrump(0, { value: bidAmount });

      await expect(
        cryptoTrump.connect(addr1).acceptBidForTrump(0, bidAmount)
      ).to.emit(cryptoTrump, "TrumpBought")
        .withArgs(0, bidAmount, addr1.address, addr2.address);

      expect(await cryptoTrump.ownerOf(0)).to.equal(addr2.address);
      expect(await cryptoTrump.pendingWithdrawals(addr1.address)).to.equal(bidAmount);
    });
  });

  describe("Withdrawals", function () {
    it("Should allow withdrawal of pending funds", async function () {
      const { cryptoTrump, addr1, addr2 } = await loadFixture(deployCryptoTrumpFixture);

      await cryptoTrump.setInitialOwner(addr1.address, 0);
      await cryptoTrump.allInitialOwnersAssigned();

      const price = ethers.parseEther("1");
      await cryptoTrump.connect(addr1).offerTrumpForSale(0, price);
      await cryptoTrump.connect(addr2).buyTrump(0, { value: price });

      const balanceBefore = await ethers.provider.getBalance(addr1.address);
      const tx = await cryptoTrump.connect(addr1).withdraw();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const balanceAfter = await ethers.provider.getBalance(addr1.address);
      expect(balanceAfter).to.equal(balanceBefore + price - gasUsed);
      expect(await cryptoTrump.pendingWithdrawals(addr1.address)).to.equal(0);
    });

    it("Should revert if no funds to withdraw", async function () {
      const { cryptoTrump, addr1 } = await loadFixture(deployCryptoTrumpFixture);

      await cryptoTrump.allInitialOwnersAssigned();

      await expect(
        cryptoTrump.connect(addr1).withdraw()
      ).to.be.revertedWithCustomError(cryptoTrump, "NoFundsToWithdraw");
    });
  });

  describe("Pausable", function () {
    it("Should allow owner to pause and unpause", async function () {
      const { cryptoTrump } = await loadFixture(deployCryptoTrumpFixture);

      await cryptoTrump.pause();
      expect(await cryptoTrump.paused()).to.equal(true);

      await cryptoTrump.unpause();
      expect(await cryptoTrump.paused()).to.equal(false);
    });

    it("Should prevent buying when paused", async function () {
      const { cryptoTrump, addr1, addr2 } = await loadFixture(deployCryptoTrumpFixture);

      await cryptoTrump.setInitialOwner(addr1.address, 0);
      await cryptoTrump.allInitialOwnersAssigned();
      await cryptoTrump.connect(addr1).offerTrumpForSale(0, ethers.parseEther("1"));

      await cryptoTrump.pause();

      await expect(
        cryptoTrump.connect(addr2).buyTrump(0, { value: ethers.parseEther("1") })
      ).to.be.revertedWithCustomError(cryptoTrump, "EnforcedPause");
    });
  });

  describe("Make NFTs Great Again", function () {
    it("Should have tremendous tokenomics", async function () {
      const { cryptoTrump } = await loadFixture(deployCryptoTrumpFixture);

      const totalTrumps = await cryptoTrump.TOTAL_TRUMPS();
      expect(totalTrumps).to.equal(10000);

      // Believe me, 10,000 is the best number!
    });

    it("Should have the best name and symbol", async function () {
      const { cryptoTrump } = await loadFixture(deployCryptoTrumpFixture);

      expect(await cryptoTrump.COLLECTION_NAME()).to.equal("CryptoTrump");
      expect(await cryptoTrump.TOKEN_SYMBOL()).to.equal("TRUMP");

      // Nobody has better names than we do!
    });
  });
});
