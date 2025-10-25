const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Full System Integration Tests", function () {
  // Comprehensive fixture with full ecosystem
  async function deployFullEcosystemFixture() {
    const [owner, alice, bob, charlie, dave] = await ethers.getSigners();

    // Deploy Mock LayerZero Endpoint
    const MockLZEndpoint = await ethers.getContractFactory("MockLZEndpoint");
    const lzEndpoint = await MockLZEndpoint.deploy();

    // Deploy CryptoTrumpMarketplace
    const CryptoTrumpMarketplace = await ethers.getContractFactory("CryptoTrumpMarketplace");
    const trumpContract = await CryptoTrumpMarketplace.deploy(
      await lzEndpoint.getAddress(),
      owner.address
    );

    // Deploy MAGAToken
    const MAGAToken = await ethers.getContractFactory("MAGAToken");
    const magaToken = await MAGAToken.deploy(await trumpContract.getAddress());

    // Deploy CryptoTrumpMerge
    const CryptoTrumpMerge = await ethers.getContractFactory("CryptoTrumpMerge");
    const mergeContract = await CryptoTrumpMerge.deploy(
      await trumpContract.getAddress(),
      await magaToken.getAddress()
    );

    // Configure integration
    await trumpContract.setMergeContract(await mergeContract.getAddress());
    await magaToken.setTrumpContract(await mergeContract.getAddress());

    // Enable public claiming
    await trumpContract.allInitialOwnersAssigned();

    return {
      trumpContract,
      magaToken,
      mergeContract,
      lzEndpoint,
      owner,
      alice,
      bob,
      charlie,
      dave,
    };
  }

  describe("End-to-End User Journey", function () {
    it("Should support complete user flow: claim → merge → burn for MAGA", async function () {
      const { trumpContract, magaToken, mergeContract, alice } = await loadFixture(
        deployFullEcosystemFixture
      );

      // Step 1: Alice claims three Trumps
      await trumpContract.connect(alice).getTrump(1);
      await trumpContract.connect(alice).getTrump(2);
      await trumpContract.connect(alice).getTrump(3);

      expect(await trumpContract.balanceOf(alice.address)).to.equal(3);

      // Step 2: Set rarity tiers
      await trumpContract.setRarityTier(1, "Common");
      await trumpContract.setRarityTier(2, "Uncommon");
      await trumpContract.setRarityTier(3, "Rare");

      // Step 3: Alice merges Trump 2 into Trump 1
      await mergeContract.connect(alice).mergeTrumps(1, 2);

      // Trump 1 should now have power 2
      const power1 = await mergeContract.getTrumpPower(1);
      expect(power1.power).to.equal(2);

      // Alice should now have 2 Trumps (Trump 2 was burned)
      expect(await trumpContract.balanceOf(alice.address)).to.equal(2);

      // Step 4: Alice burns Trump 3 for MAGA
      const magaBalanceBefore = await magaToken.balanceOf(alice.address);
      await mergeContract.connect(alice).burnTrumpForMAGA(3);

      const magaBalanceAfter = await magaToken.balanceOf(alice.address);
      expect(magaBalanceAfter).to.be.greaterThan(magaBalanceBefore);

      // Alice should now have 1 Trump and some MAGA
      expect(await trumpContract.balanceOf(alice.address)).to.equal(1);
      expect(await magaToken.balanceOf(alice.address)).to.be.greaterThan(0);
    });

    it("Should support marketplace listing and sale after merge", async function () {
      const { trumpContract, mergeContract, alice, bob } = await loadFixture(
        deployFullEcosystemFixture
      );

      // Alice gets and merges Trumps
      await trumpContract.connect(alice).getTrump(1);
      await trumpContract.connect(alice).getTrump(2);
      await trumpContract.setRarityTier(1, "Common");
      await trumpContract.setRarityTier(2, "Common");

      await mergeContract.connect(alice).mergeTrumps(1, 2);

      // Alice lists merged Trump for sale
      const price = ethers.parseEther("1.0");
      await trumpContract.connect(alice).offerTrumpForSale(1, price);

      // Bob buys the merged Trump
      await trumpContract.connect(bob).buyTrump(1, { value: price });

      // Bob should now own the merged Trump with power 2
      expect(await trumpContract.ownerOf(1)).to.equal(bob.address);
      const power = await mergeContract.getTrumpPower(1);
      expect(power.power).to.equal(2);
    });

    it("Should support bidding on merged Trumps", async function () {
      const { trumpContract, mergeContract, alice, bob } = await loadFixture(
        deployFullEcosystemFixture
      );

      // Alice creates merged Trump
      await trumpContract.connect(alice).getTrump(1);
      await trumpContract.connect(alice).getTrump(2);
      await trumpContract.setRarityTier(1, "Common");
      await trumpContract.setRarityTier(2, "Common");

      await mergeContract.connect(alice).mergeTrumps(1, 2);

      // Bob places bid on merged Trump
      const bidAmount = ethers.parseEther("1.5");
      await trumpContract.connect(bob).enterBidForTrump(1, { value: bidAmount });

      // Alice accepts bid
      await trumpContract.connect(alice).acceptBidForTrump(1, bidAmount);

      // Bob should own the merged Trump
      expect(await trumpContract.ownerOf(1)).to.equal(bob.address);
    });
  });

  describe("Multi-User Competition Scenarios", function () {
    it("Should track Alpha Trump competition between users", async function () {
      const { trumpContract, mergeContract, alice, bob, charlie } = await loadFixture(
        deployFullEcosystemFixture
      );

      // Alice creates power 2 Trump
      await trumpContract.connect(alice).getTrump(1);
      await trumpContract.connect(alice).getTrump(2);
      await trumpContract.setRarityTier(1, "Common");
      await trumpContract.setRarityTier(2, "Common");
      await mergeContract.connect(alice).mergeTrumps(1, 2);

      let alphaInfo = await mergeContract.getAlphaInfo();
      expect(alphaInfo.trumpId).to.equal(1);
      expect(alphaInfo.owner).to.equal(alice.address);

      // Bob creates power 3 Trump - becomes new Alpha
      await trumpContract.connect(bob).getTrump(3);
      await trumpContract.connect(bob).getTrump(4);
      await trumpContract.connect(bob).getTrump(5);
      await trumpContract.setRarityTier(3, "Common");
      await trumpContract.setRarityTier(4, "Common");
      await trumpContract.setRarityTier(5, "Common");

      await mergeContract.connect(bob).mergeTrumps(3, 4);
      await time.increase(7 * 24 * 60 * 60 + 1);
      await mergeContract.connect(bob).mergeTrumps(3, 5);

      alphaInfo = await mergeContract.getAlphaInfo();
      expect(alphaInfo.trumpId).to.equal(3);
      expect(alphaInfo.power).to.equal(3);
      expect(alphaInfo.owner).to.equal(bob.address);

      // Charlie creates power 4 Trump - becomes new Alpha
      await trumpContract.connect(charlie).getTrump(6);
      await trumpContract.connect(charlie).getTrump(7);
      await trumpContract.connect(charlie).getTrump(8);
      await trumpContract.connect(charlie).getTrump(9);
      await trumpContract.setRarityTier(6, "Common");
      await trumpContract.setRarityTier(7, "Common");
      await trumpContract.setRarityTier(8, "Common");
      await trumpContract.setRarityTier(9, "Common");

      await mergeContract.connect(charlie).mergeTrumps(6, 7);
      await time.increase(7 * 24 * 60 * 60 + 1);
      await mergeContract.connect(charlie).mergeTrumps(6, 8);
      await time.increase(7 * 24 * 60 * 60 + 1);
      await mergeContract.connect(charlie).mergeTrumps(6, 9);

      alphaInfo = await mergeContract.getAlphaInfo();
      expect(alphaInfo.trumpId).to.equal(6);
      expect(alphaInfo.power).to.equal(4);
      expect(alphaInfo.owner).to.equal(charlie.address);
    });

    it("Should demonstrate inverse yield curve with multiple users", async function () {
      const { trumpContract, magaToken, mergeContract, alice, bob, charlie } = await loadFixture(
        deployFullEcosystemFixture
      );

      // Alice burns first (gets highest bonus)
      await trumpContract.connect(alice).getTrump(1);
      await trumpContract.setRarityTier(1, "Common");
      await mergeContract.connect(alice).burnTrumpForMAGA(1);
      const aliceReward = await magaToken.balanceOf(alice.address);

      // Bob burns second (gets slightly less bonus)
      await trumpContract.connect(bob).getTrump(2);
      await trumpContract.setRarityTier(2, "Common");
      await mergeContract.connect(bob).burnTrumpForMAGA(2);
      const bobReward = await magaToken.balanceOf(bob.address);

      // Early burn bonus should be decreasing
      expect(aliceReward).to.be.greaterThanOrEqual(bobReward);

      // Check total burns
      expect(await magaToken.totalTrumpsBurned()).to.equal(2);
      expect(await mergeContract.totalMAGABurns()).to.equal(2);
    });
  });

  describe("Complex Merge Chains", function () {
    it("Should support building a super-powered Trump through multiple merges", async function () {
      const { trumpContract, mergeContract, alice } = await loadFixture(
        deployFullEcosystemFixture
      );

      // Alice gets 8 Trumps
      const trumpIds = [];
      for (let i = 1; i <= 8; i++) {
        await trumpContract.connect(alice).getTrump(i);
        await trumpContract.setRarityTier(i, "Common");
        trumpIds.push(i);
      }

      // Build merge tree:
      // 1 ← 2 (power 2)
      // 3 ← 4 (power 2)
      // 5 ← 6 (power 2)
      // 7 ← 8 (power 2)
      await mergeContract.connect(alice).mergeTrumps(1, 2);
      await mergeContract.connect(alice).mergeTrumps(3, 4);
      await mergeContract.connect(alice).mergeTrumps(5, 6);
      await mergeContract.connect(alice).mergeTrumps(7, 8);

      await time.increase(7 * 24 * 60 * 60 + 1);

      // 1 ← 3 (power 4)
      // 5 ← 7 (power 4)
      await mergeContract.connect(alice).mergeTrumps(1, 3);
      await mergeContract.connect(alice).mergeTrumps(5, 7);

      await time.increase(7 * 24 * 60 * 60 + 1);

      // 1 ← 5 (power 8)
      await mergeContract.connect(alice).mergeTrumps(1, 5);

      const finalPower = await mergeContract.getTrumpPower(1);
      expect(finalPower.power).to.equal(8);
      expect(finalPower.mergeCount).to.equal(3);
      expect(finalPower.consumedIds.length).to.equal(3);

      // Should be Alpha Trump
      const alphaInfo = await mergeContract.getAlphaInfo();
      expect(alphaInfo.trumpId).to.equal(1);
      expect(alphaInfo.power).to.equal(8);
    });

    it("Should track merge history and consumed IDs correctly", async function () {
      const { trumpContract, mergeContract, alice } = await loadFixture(
        deployFullEcosystemFixture
      );

      for (let i = 1; i <= 5; i++) {
        await trumpContract.connect(alice).getTrump(i);
        await trumpContract.setRarityTier(i, "Common");
      }

      await mergeContract.connect(alice).mergeTrumps(1, 2);
      await time.increase(7 * 24 * 60 * 60 + 1);
      await mergeContract.connect(alice).mergeTrumps(1, 3);
      await time.increase(7 * 24 * 60 * 60 + 1);
      await mergeContract.connect(alice).mergeTrumps(1, 4);
      await time.increase(7 * 24 * 60 * 60 + 1);
      await mergeContract.connect(alice).mergeTrumps(1, 5);

      const power = await mergeContract.getTrumpPower(1);
      expect(power.power).to.equal(5);
      expect(power.mergeCount).to.equal(4);
      expect(power.totalPowerGained).to.equal(4); // Gained 1 from each merge
      expect(power.consumedIds).to.deep.equal([2n, 3n, 4n, 5n]);
    });
  });

  describe("Rarity Tier Integration", function () {
    it("Should give more MAGA for rarer Trumps", async function () {
      const { trumpContract, magaToken, mergeContract, alice, bob } = await loadFixture(
        deployFullEcosystemFixture
      );

      // Alice burns Common Trump
      await trumpContract.connect(alice).getTrump(1);
      await trumpContract.setRarityTier(1, "Common");
      await mergeContract.connect(alice).burnTrumpForMAGA(1);
      const commonReward = await magaToken.balanceOf(alice.address);

      // Bob burns Legendary Trump
      await trumpContract.connect(bob).getTrump(2);
      await trumpContract.setRarityTier(2, "Legendary");
      await mergeContract.connect(bob).burnTrumpForMAGA(2);
      const legendaryReward = await magaToken.balanceOf(bob.address);

      // Legendary should give significantly more MAGA
      expect(legendaryReward).to.be.greaterThan(commonReward * 10n);
    });

    it("Should calculate dynamic rarity based on power level", async function () {
      const { trumpContract, mergeContract, alice } = await loadFixture(
        deployFullEcosystemFixture
      );

      // Create Trump with various power levels and check rarity
      for (let i = 1; i <= 30; i++) {
        await trumpContract.connect(alice).getTrump(i);
        await trumpContract.setRarityTier(i, "Common");
      }

      // Build power 1-10 (Common range)
      let currentId = 1;
      for (let i = 2; i <= 10; i++) {
        if (i > 2) await time.increase(7 * 24 * 60 * 60 + 1);
        await mergeContract.connect(alice).mergeTrumps(currentId, i);
      }

      let power = await mergeContract.getTrumpPower(currentId);
      expect(power.power).to.equal(10);
      expect(power.currentRarity).to.equal("Common");

      // Merge more to reach Uncommon (11-25)
      for (let i = 11; i <= 15; i++) {
        await time.increase(7 * 24 * 60 * 60 + 1);
        await mergeContract.connect(alice).mergeTrumps(currentId, i);
      }

      power = await mergeContract.getTrumpPower(currentId);
      expect(power.power).to.equal(15);
      expect(power.currentRarity).to.equal("Uncommon");
    });
  });

  describe("MAGA Token Economy", function () {
    it("Should allow using MAGA to reduce cooldowns", async function () {
      const { trumpContract, magaToken, mergeContract, alice } = await loadFixture(
        deployFullEcosystemFixture
      );

      // Alice gets MAGA by burning a Trump
      await trumpContract.connect(alice).getTrump(1);
      await trumpContract.connect(alice).getTrump(2);
      await trumpContract.connect(alice).getTrump(3);
      await trumpContract.connect(alice).getTrump(4);

      await trumpContract.setRarityTier(1, "Legendary"); // Get lots of MAGA
      await trumpContract.setRarityTier(2, "Common");
      await trumpContract.setRarityTier(3, "Common");
      await trumpContract.setRarityTier(4, "Common");

      await mergeContract.connect(alice).burnTrumpForMAGA(1);

      // Alice merges Trumps
      await mergeContract.connect(alice).mergeTrumps(2, 3);

      // Check cooldown
      const cooldownBefore = await mergeContract.getCooldownRemaining(2);
      expect(cooldownBefore).to.be.greaterThan(0);

      // Reduce cooldown with MAGA
      const cost = await mergeContract.COOLDOWN_REDUCTION_COST();
      await magaToken.connect(alice).approve(await mergeContract.getAddress(), cost);
      await mergeContract.connect(alice).reduceCooldown(2);

      // Cooldown should be reduced by 1 day
      const cooldownAfter = await mergeContract.getCooldownRemaining(2);
      expect(cooldownAfter).to.be.lessThan(cooldownBefore);
      expect(cooldownBefore - cooldownAfter).to.equal(24 * 60 * 60); // 1 day
    });

    it("Should support MAGA transfer between users", async function () {
      const { trumpContract, magaToken, mergeContract, alice, bob } = await loadFixture(
        deployFullEcosystemFixture
      );

      // Alice earns MAGA
      await trumpContract.connect(alice).getTrump(1);
      await trumpContract.setRarityTier(1, "Common");
      await mergeContract.connect(alice).burnTrumpForMAGA(1);

      const aliceBalance = await magaToken.balanceOf(alice.address);
      expect(aliceBalance).to.be.greaterThan(0);

      // Alice sends MAGA to Bob
      await magaToken.connect(alice).transfer(bob.address, aliceBalance / 2n);

      expect(await magaToken.balanceOf(bob.address)).to.equal(aliceBalance / 2n);
      expect(await magaToken.balanceOf(alice.address)).to.equal(aliceBalance / 2n);
    });
  });

  describe("Royalties Integration", function () {
    it("Should enforce 3% royalty on marketplace sales", async function () {
      const { trumpContract, alice, bob, owner } = await loadFixture(
        deployFullEcosystemFixture
      );

      // Alice gets Trump and lists for sale
      await trumpContract.connect(alice).getTrump(1);
      const price = ethers.parseEther("10.0");
      await trumpContract.connect(alice).offerTrumpForSale(1, price);

      // Check royalty info
      const royaltyInfo = await trumpContract.royaltyInfo(1, price);
      expect(royaltyInfo.receiver).to.equal(owner.address); // Treasury
      expect(royaltyInfo.royaltyAmount).to.equal(price * 3n / 100n); // 3%

      // Bob buys Trump
      const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);
      await trumpContract.connect(bob).buyTrump(1, { value: price });

      // Owner (treasury) should have received 3% royalty
      const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);
      const royaltyReceived = ownerBalanceAfter - ownerBalanceBefore;
      expect(royaltyReceived).to.equal(price * 3n / 100n);
    });
  });

  describe("Custom Messages", function () {
    it("Should allow setting custom messages on Trumps", async function () {
      const { trumpContract, alice } = await loadFixture(deployFullEcosystemFixture);

      await trumpContract.connect(alice).getTrump(1);

      const message = "Make NFTs Great Again!";
      await trumpContract.connect(alice).setTrumpMessage(1, message);

      expect(await trumpContract.getTrumpMessage(1)).to.equal(message);
    });

    it("Should preserve custom messages through merges", async function () {
      const { trumpContract, mergeContract, alice } = await loadFixture(
        deployFullEcosystemFixture
      );

      await trumpContract.connect(alice).getTrump(1);
      await trumpContract.connect(alice).getTrump(2);

      await trumpContract.setRarityTier(1, "Common");
      await trumpContract.setRarityTier(2, "Common");

      const message = "Super Powered Trump!";
      await trumpContract.connect(alice).setTrumpMessage(1, message);

      // Merge should preserve message on kept Trump
      await mergeContract.connect(alice).mergeTrumps(1, 2);

      expect(await trumpContract.getTrumpMessage(1)).to.equal(message);
    });
  });

  describe("System Statistics", function () {
    it("Should track global statistics correctly", async function () {
      const { trumpContract, mergeContract, magaToken, alice, bob } = await loadFixture(
        deployFullEcosystemFixture
      );

      // Alice does some merges
      await trumpContract.connect(alice).getTrump(1);
      await trumpContract.connect(alice).getTrump(2);
      await trumpContract.connect(alice).getTrump(3);
      await trumpContract.setRarityTier(1, "Common");
      await trumpContract.setRarityTier(2, "Common");
      await trumpContract.setRarityTier(3, "Common");

      await mergeContract.connect(alice).mergeTrumps(1, 2);
      await mergeContract.connect(alice).burnTrumpForMAGA(3);

      // Bob does some burns
      await trumpContract.connect(bob).getTrump(4);
      await trumpContract.connect(bob).getTrump(5);
      await trumpContract.setRarityTier(4, "Rare");
      await trumpContract.setRarityTier(5, "Epic");

      await mergeContract.connect(bob).burnTrumpForMAGA(4);
      await mergeContract.connect(bob).burnTrumpForMAGA(5);

      // Check statistics
      const stats = await mergeContract.getMergeStats();
      expect(stats.totalMergeBurns).to.equal(1); // One Trump burned via merge
      expect(stats.totalMAGABurns).to.equal(3); // Three Trumps burned for MAGA
      expect(stats.totalBurns).to.equal(4); // Total of 4 burns

      expect(await magaToken.totalTrumpsBurned()).to.equal(3); // MAGA only counts direct burns
    });
  });

  describe("Pause Emergency Scenarios", function () {
    it("Should allow pausing all systems in emergency", async function () {
      const { trumpContract, mergeContract, magaToken, alice } = await loadFixture(
        deployFullEcosystemFixture
      );

      await trumpContract.connect(alice).getTrump(1);
      await trumpContract.connect(alice).getTrump(2);
      await trumpContract.setRarityTier(1, "Common");
      await trumpContract.setRarityTier(2, "Common");

      // Pause everything
      await trumpContract.pause();
      await mergeContract.pause();
      await magaToken.pause();

      // All operations should fail
      await expect(
        trumpContract.connect(alice).getTrump(3)
      ).to.be.revertedWithCustomError(trumpContract, "EnforcedPause");

      await expect(
        mergeContract.connect(alice).mergeTrumps(1, 2)
      ).to.be.revertedWithCustomError(mergeContract, "EnforcedPause");

      // Unpause
      await trumpContract.unpause();
      await mergeContract.unpause();
      await magaToken.unpause();

      // Operations should work again
      await expect(mergeContract.connect(alice).mergeTrumps(1, 2)).to.emit(
        mergeContract,
        "TrumpsMerged"
      );
    });
  });
});
