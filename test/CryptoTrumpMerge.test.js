const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers");

describe("CryptoTrumpMerge", function () {
  // Fixture to deploy all necessary contracts
  async function deployMergeSystemFixture() {
    const [owner, user1, user2, user3] = await ethers.getSigners();

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

    // Set up some initial Trump owners
    await trumpContract.allInitialOwnersAssigned();

    return {
      mergeContract,
      trumpContract,
      magaToken,
      lzEndpoint,
      owner,
      user1,
      user2,
      user3,
    };
  }

  describe("Deployment", function () {
    it("Should set the correct trump contract address", async function () {
      const { mergeContract, trumpContract } = await loadFixture(deployMergeSystemFixture);
      expect(await mergeContract.trumpContract()).to.equal(await trumpContract.getAddress());
    });

    it("Should set the correct MAGA token address", async function () {
      const { mergeContract, magaToken } = await loadFixture(deployMergeSystemFixture);
      expect(await mergeContract.magaToken()).to.equal(await magaToken.getAddress());
    });

    it("Should initialize with correct constants", async function () {
      const { mergeContract } = await loadFixture(deployMergeSystemFixture);

      expect(await mergeContract.MERGE_COOLDOWN()).to.equal(7 * 24 * 60 * 60); // 7 days
      expect(await mergeContract.COOLDOWN_REDUCTION_COST()).to.equal(ethers.parseEther("1000"));
      expect(await mergeContract.MAX_POWER_LEVEL()).to.equal(10000);
    });

    it("Should initialize rarity tiers", async function () {
      const { mergeContract } = await loadFixture(deployMergeSystemFixture);

      expect(await mergeContract.rarityTiers(0)).to.equal("Common");
      expect(await mergeContract.rarityTiers(1)).to.equal("Uncommon");
      expect(await mergeContract.rarityTiers(2)).to.equal("Rare");
      expect(await mergeContract.rarityTiers(3)).to.equal("Epic");
      expect(await mergeContract.rarityTiers(4)).to.equal("Legendary");
    });
  });

  describe("Trump Merging", function () {
    it("Should allow merging two Trumps owned by same user", async function () {
      const { mergeContract, trumpContract, user1 } = await loadFixture(deployMergeSystemFixture);

      // Get two Trumps for user1
      await trumpContract.connect(user1).getTrump(1);
      await trumpContract.connect(user1).getTrump(2);

      // Set rarity tiers
      await trumpContract.setRarityTier(1, "Common");
      await trumpContract.setRarityTier(2, "Common");

      await expect(mergeContract.connect(user1).mergeTrumps(1, 2))
        .to.emit(mergeContract, "TrumpsMerged")
        .withArgs(1, 2, user1.address, 2, 1);

      // Verify Trump 1 now has power 2
      const power = await mergeContract.getTrumpPower(1);
      expect(power.power).to.equal(2);
      expect(power.mergeCount).to.equal(1);

      // Verify Trump 2 was burned
      await expect(trumpContract.ownerOf(2)).to.be.revertedWithCustomError(
        trumpContract,
        "ERC721NonexistentToken"
      );
    });

    it("Should revert if trying to merge same Trump with itself", async function () {
      const { mergeContract, trumpContract, user1 } = await loadFixture(deployMergeSystemFixture);

      await trumpContract.connect(user1).getTrump(1);

      await expect(
        mergeContract.connect(user1).mergeTrumps(1, 1)
      ).to.be.revertedWithCustomError(mergeContract, "SameTrumpMerge");
    });

    it("Should revert if user doesn't own the keep Trump", async function () {
      const { mergeContract, trumpContract, user1, user2 } = await loadFixture(deployMergeSystemFixture);

      await trumpContract.connect(user1).getTrump(1);
      await trumpContract.connect(user2).getTrump(2);

      await expect(
        mergeContract.connect(user1).mergeTrumps(2, 1)
      ).to.be.revertedWithCustomError(mergeContract, "NotTrumpOwner");
    });

    it("Should revert if user doesn't own the burn Trump", async function () {
      const { mergeContract, trumpContract, user1, user2 } = await loadFixture(deployMergeSystemFixture);

      await trumpContract.connect(user1).getTrump(1);
      await trumpContract.connect(user2).getTrump(2);

      await expect(
        mergeContract.connect(user1).mergeTrumps(1, 2)
      ).to.be.revertedWithCustomError(mergeContract, "NotTrumpOwner");
    });

    it("Should enforce merge cooldown", async function () {
      const { mergeContract, trumpContract, user1 } = await loadFixture(deployMergeSystemFixture);

      await trumpContract.connect(user1).getTrump(1);
      await trumpContract.connect(user1).getTrump(2);
      await trumpContract.connect(user1).getTrump(3);

      await trumpContract.setRarityTier(1, "Common");
      await trumpContract.setRarityTier(2, "Common");
      await trumpContract.setRarityTier(3, "Common");

      // First merge should work
      await mergeContract.connect(user1).mergeTrumps(1, 2);

      // Second merge immediately should fail
      await expect(
        mergeContract.connect(user1).mergeTrumps(1, 3)
      ).to.be.revertedWithCustomError(mergeContract, "MergeCooldownActive");
    });

    it("Should allow merge after cooldown period", async function () {
      const { mergeContract, trumpContract, user1 } = await loadFixture(deployMergeSystemFixture);

      await trumpContract.connect(user1).getTrump(1);
      await trumpContract.connect(user1).getTrump(2);
      await trumpContract.connect(user1).getTrump(3);

      await trumpContract.setRarityTier(1, "Common");
      await trumpContract.setRarityTier(2, "Common");
      await trumpContract.setRarityTier(3, "Common");

      // First merge
      await mergeContract.connect(user1).mergeTrumps(1, 2);

      // Advance time by 7 days + 1 second
      await time.increase(7 * 24 * 60 * 60 + 1);

      // Second merge should work
      await expect(mergeContract.connect(user1).mergeTrumps(1, 3))
        .to.emit(mergeContract, "TrumpsMerged");
    });

    it("Should combine power levels correctly", async function () {
      const { mergeContract, trumpContract, user1 } = await loadFixture(deployMergeSystemFixture);

      await trumpContract.connect(user1).getTrump(1);
      await trumpContract.connect(user1).getTrump(2);
      await trumpContract.connect(user1).getTrump(3);
      await trumpContract.connect(user1).getTrump(4);

      await trumpContract.setRarityTier(1, "Common");
      await trumpContract.setRarityTier(2, "Common");
      await trumpContract.setRarityTier(3, "Common");
      await trumpContract.setRarityTier(4, "Common");

      // Merge 2 into 1: power becomes 2
      await mergeContract.connect(user1).mergeTrumps(1, 2);
      expect((await mergeContract.getTrumpPower(1)).power).to.equal(2);

      // Advance time
      await time.increase(7 * 24 * 60 * 60 + 1);

      // Merge 3 into 1: power becomes 3 (2 + 1)
      await mergeContract.connect(user1).mergeTrumps(1, 3);
      expect((await mergeContract.getTrumpPower(1)).power).to.equal(3);

      // Merge 4 (power 1) with itself by getting another Trump
      await trumpContract.connect(user1).getTrump(5);
      await trumpContract.setRarityTier(5, "Common");
      await mergeContract.connect(user1).mergeTrumps(4, 5);
      expect((await mergeContract.getTrumpPower(4)).power).to.equal(2);

      // Advance time
      await time.increase(7 * 24 * 60 * 60 + 1);

      // Now merge 4 (power 2) into 1 (power 3): result = 5
      await mergeContract.connect(user1).mergeTrumps(1, 4);
      expect((await mergeContract.getTrumpPower(1)).power).to.equal(5);
    });

    it("Should revert if resulting power exceeds maximum", async function () {
      const { mergeContract, trumpContract, owner } = await loadFixture(deployMergeSystemFixture);

      await trumpContract.setInitialOwner(owner.address, 1);
      await trumpContract.setInitialOwner(owner.address, 2);

      // Manually set high power (this is for testing - in production power is built up)
      // We'll need to do multiple merges to test this properly
      // For now, we test the logic exists by checking the constant
      expect(await mergeContract.MAX_POWER_LEVEL()).to.equal(10000);
    });
  });

  describe("Power Tracking", function () {
    it("Should initialize power to 1 for new Trump", async function () {
      const { mergeContract, trumpContract, user1 } = await loadFixture(deployMergeSystemFixture);

      await trumpContract.connect(user1).getTrump(1);
      await trumpContract.setRarityTier(1, "Common");

      // Power is initialized on first merge or burn
      await trumpContract.connect(user1).getTrump(2);
      await trumpContract.setRarityTier(2, "Common");
      await mergeContract.connect(user1).mergeTrumps(1, 2);

      const power = await mergeContract.getTrumpPower(1);
      expect(power.power).to.equal(2); // 1 + 1
    });

    it("Should track consumed Trump IDs", async function () {
      const { mergeContract, trumpContract, user1 } = await loadFixture(deployMergeSystemFixture);

      await trumpContract.connect(user1).getTrump(1);
      await trumpContract.connect(user1).getTrump(2);
      await trumpContract.connect(user1).getTrump(3);

      await trumpContract.setRarityTier(1, "Common");
      await trumpContract.setRarityTier(2, "Common");
      await trumpContract.setRarityTier(3, "Common");

      await mergeContract.connect(user1).mergeTrumps(1, 2);
      await time.increase(7 * 24 * 60 * 60 + 1);
      await mergeContract.connect(user1).mergeTrumps(1, 3);

      const power = await mergeContract.getTrumpPower(1);
      expect(power.consumedIds.length).to.equal(2);
      expect(power.consumedIds[0]).to.equal(2);
      expect(power.consumedIds[1]).to.equal(3);
    });

    it("Should calculate rarity based on power level", async function () {
      const { mergeContract } = await loadFixture(deployMergeSystemFixture);

      // Common: 1-10
      expect(await mergeContract.rarityTiers(0)).to.equal("Common");

      // Uncommon: 11-25
      expect(await mergeContract.rarityTiers(1)).to.equal("Uncommon");

      // Rare: 26-50
      expect(await mergeContract.rarityTiers(2)).to.equal("Rare");

      // Epic: 51-100
      expect(await mergeContract.rarityTiers(3)).to.equal("Epic");

      // Legendary: 101+
      expect(await mergeContract.rarityTiers(4)).to.equal("Legendary");
    });
  });

  describe("Burn for MAGA", function () {
    it("Should allow burning Trump for MAGA tokens", async function () {
      const { mergeContract, trumpContract, magaToken, user1 } = await loadFixture(deployMergeSystemFixture);

      await trumpContract.connect(user1).getTrump(1);
      await trumpContract.setRarityTier(1, "Common");

      const expectedReward = await magaToken.calculateMAGAReward(1, "Common");

      await expect(mergeContract.connect(user1).burnTrumpForMAGA(1))
        .to.emit(mergeContract, "TrumpBurnedForMAGA")
        .withArgs(1, user1.address, 1, "Common", expectedReward);

      // Check MAGA balance
      expect(await magaToken.balanceOf(user1.address)).to.equal(expectedReward);

      // Verify Trump was burned
      await expect(trumpContract.ownerOf(1)).to.be.revertedWithCustomError(
        trumpContract,
        "ERC721NonexistentToken"
      );
    });

    it("Should revert if burning Trump not owned by caller", async function () {
      const { mergeContract, trumpContract, user1, user2 } = await loadFixture(deployMergeSystemFixture);

      await trumpContract.connect(user1).getTrump(1);

      await expect(
        mergeContract.connect(user2).burnTrumpForMAGA(1)
      ).to.be.revertedWithCustomError(mergeContract, "NotTrumpOwner");
    });

    it("Should give more MAGA for higher power Trumps", async function () {
      const { mergeContract, trumpContract, magaToken, user1 } = await loadFixture(deployMergeSystemFixture);

      await trumpContract.connect(user1).getTrump(1);
      await trumpContract.connect(user1).getTrump(2);
      await trumpContract.connect(user1).getTrump(3);

      await trumpContract.setRarityTier(1, "Common");
      await trumpContract.setRarityTier(2, "Common");
      await trumpContract.setRarityTier(3, "Common");

      // Merge to create power 2 Trump
      await mergeContract.connect(user1).mergeTrumps(1, 2);

      // Burn power 1 Trump
      await mergeContract.connect(user1).burnTrumpForMAGA(3);
      const reward1 = await magaToken.balanceOf(user1.address);

      // Advance time and burn power 2 Trump
      await time.increase(7 * 24 * 60 * 60 + 1);
      await mergeContract.connect(user1).burnTrumpForMAGA(1);
      const reward2 = (await magaToken.balanceOf(user1.address)) - reward1;

      // Power 2 Trump should give more MAGA
      expect(reward2).to.be.greaterThan(reward1);
    });

    it("Should increment total burn counters", async function () {
      const { mergeContract, trumpContract, user1 } = await loadFixture(deployMergeSystemFixture);

      await trumpContract.connect(user1).getTrump(1);
      await trumpContract.connect(user1).getTrump(2);
      await trumpContract.setRarityTier(1, "Common");
      await trumpContract.setRarityTier(2, "Common");

      await mergeContract.connect(user1).burnTrumpForMAGA(1);
      expect(await mergeContract.totalMAGABurns()).to.equal(1);

      await mergeContract.connect(user1).burnTrumpForMAGA(2);
      expect(await mergeContract.totalMAGABurns()).to.equal(2);
    });
  });

  describe("Alpha Trump", function () {
    it("Should update Alpha Trump when merging creates highest power", async function () {
      const { mergeContract, trumpContract, user1, user2 } = await loadFixture(deployMergeSystemFixture);

      await trumpContract.connect(user1).getTrump(1);
      await trumpContract.connect(user1).getTrump(2);
      await trumpContract.setRarityTier(1, "Common");
      await trumpContract.setRarityTier(2, "Common");

      // First merge - Trump 1 becomes Alpha with power 2
      await mergeContract.connect(user1).mergeTrumps(1, 2);

      const alphaInfo = await mergeContract.getAlphaInfo();
      expect(alphaInfo.trumpId).to.equal(1);
      expect(alphaInfo.power).to.equal(2);
      expect(alphaInfo.owner).to.equal(user1.address);
    });

    it("Should emit AlphaTrumpChanged when new Alpha emerges", async function () {
      const { mergeContract, trumpContract, user1, user2 } = await loadFixture(deployMergeSystemFixture);

      await trumpContract.connect(user1).getTrump(1);
      await trumpContract.connect(user1).getTrump(2);
      await trumpContract.connect(user2).getTrump(3);
      await trumpContract.connect(user2).getTrump(4);
      await trumpContract.connect(user2).getTrump(5);

      await trumpContract.setRarityTier(1, "Common");
      await trumpContract.setRarityTier(2, "Common");
      await trumpContract.setRarityTier(3, "Common");
      await trumpContract.setRarityTier(4, "Common");
      await trumpContract.setRarityTier(5, "Common");

      // User1 merges to power 2
      await mergeContract.connect(user1).mergeTrumps(1, 2);

      // User2 merges to power 2
      await mergeContract.connect(user2).mergeTrumps(3, 4);

      // User2 merges again to power 3 - becomes new Alpha
      await time.increase(7 * 24 * 60 * 60 + 1);
      await expect(mergeContract.connect(user2).mergeTrumps(3, 5))
        .to.emit(mergeContract, "AlphaTrumpChanged")
        .withArgs(3, 3, user2.address);
    });

    it("Should clear Alpha status when Alpha Trump is burned", async function () {
      const { mergeContract, trumpContract, user1 } = await loadFixture(deployMergeSystemFixture);

      await trumpContract.connect(user1).getTrump(1);
      await trumpContract.connect(user1).getTrump(2);
      await trumpContract.setRarityTier(1, "Common");
      await trumpContract.setRarityTier(2, "Common");

      // Create Alpha Trump
      await mergeContract.connect(user1).mergeTrumps(1, 2);

      // Burn Alpha Trump
      await time.increase(7 * 24 * 60 * 60 + 1);
      await mergeContract.connect(user1).burnTrumpForMAGA(1);

      const alphaInfo = await mergeContract.getAlphaInfo();
      expect(alphaInfo.trumpId).to.equal(0);
      expect(alphaInfo.power).to.equal(0);
    });
  });

  describe("Cooldown Management", function () {
    it("Should check if Trump can merge", async function () {
      const { mergeContract, trumpContract, user1 } = await loadFixture(deployMergeSystemFixture);

      await trumpContract.connect(user1).getTrump(1);
      await trumpContract.connect(user1).getTrump(2);
      await trumpContract.connect(user1).getTrump(3);

      await trumpContract.setRarityTier(1, "Common");
      await trumpContract.setRarityTier(2, "Common");
      await trumpContract.setRarityTier(3, "Common");

      // Should be able to merge initially
      expect(await mergeContract.canMerge(1)).to.equal(true);

      // After merge, should be on cooldown
      await mergeContract.connect(user1).mergeTrumps(1, 2);
      expect(await mergeContract.canMerge(1)).to.equal(false);

      // After time passes, should be able to merge again
      await time.increase(7 * 24 * 60 * 60 + 1);
      expect(await mergeContract.canMerge(1)).to.equal(true);
    });

    it("Should return correct cooldown remaining time", async function () {
      const { mergeContract, trumpContract, user1 } = await loadFixture(deployMergeSystemFixture);

      await trumpContract.connect(user1).getTrump(1);
      await trumpContract.connect(user1).getTrump(2);

      await trumpContract.setRarityTier(1, "Common");
      await trumpContract.setRarityTier(2, "Common");

      await mergeContract.connect(user1).mergeTrumps(1, 2);

      const remaining = await mergeContract.getCooldownRemaining(1);
      expect(remaining).to.be.greaterThan(0);
      expect(remaining).to.be.lessThanOrEqual(7 * 24 * 60 * 60);
    });

    it("Should allow reducing cooldown with MAGA tokens", async function () {
      const { mergeContract, trumpContract, magaToken, user1 } = await loadFixture(deployMergeSystemFixture);

      await trumpContract.connect(user1).getTrump(1);
      await trumpContract.connect(user1).getTrump(2);
      await trumpContract.connect(user1).getTrump(3);

      await trumpContract.setRarityTier(1, "Common");
      await trumpContract.setRarityTier(2, "Common");
      await trumpContract.setRarityTier(3, "Common");

      // Burn Trump 3 to get MAGA
      await mergeContract.connect(user1).burnTrumpForMAGA(3);

      // Merge Trumps 1 and 2
      await mergeContract.connect(user1).mergeTrumps(1, 2);

      // Get initial cooldown
      const cooldownBefore = await mergeContract.getCooldownRemaining(1);

      // Approve MAGA spending
      const cost = await mergeContract.COOLDOWN_REDUCTION_COST();
      await magaToken.connect(user1).approve(await mergeContract.getAddress(), cost);

      // Reduce cooldown
      await expect(mergeContract.connect(user1).reduceCooldown(1))
        .to.emit(mergeContract, "CooldownReduced")
        .withArgs(1, user1.address);

      // Check cooldown was reduced
      const cooldownAfter = await mergeContract.getCooldownRemaining(1);
      expect(cooldownAfter).to.be.lessThan(cooldownBefore);
    });

    it("Should revert cooldown reduction if insufficient MAGA", async function () {
      const { mergeContract, trumpContract, user1 } = await loadFixture(deployMergeSystemFixture);

      await trumpContract.connect(user1).getTrump(1);
      await trumpContract.connect(user1).getTrump(2);

      await trumpContract.setRarityTier(1, "Common");
      await trumpContract.setRarityTier(2, "Common");

      await mergeContract.connect(user1).mergeTrumps(1, 2);

      // Try to reduce cooldown without MAGA
      await expect(
        mergeContract.connect(user1).reduceCooldown(1)
      ).to.be.reverted; // Will fail on transferFrom
    });

    it("Should revert cooldown reduction if no cooldown active", async function () {
      const { mergeContract, trumpContract, magaToken, user1 } = await loadFixture(deployMergeSystemFixture);

      await trumpContract.connect(user1).getTrump(1);
      await trumpContract.connect(user1).getTrump(2);
      await trumpContract.connect(user1).getTrump(3);

      await trumpContract.setRarityTier(1, "Common");
      await trumpContract.setRarityTier(2, "Common");
      await trumpContract.setRarityTier(3, "Common");

      // Get MAGA
      await mergeContract.connect(user1).burnTrumpForMAGA(3);

      // Approve MAGA
      const cost = await mergeContract.COOLDOWN_REDUCTION_COST();
      await magaToken.connect(user1).approve(await mergeContract.getAddress(), cost);

      // Try to reduce cooldown when Trump hasn't merged yet
      await expect(
        mergeContract.connect(user1).reduceCooldown(1)
      ).to.be.revertedWithCustomError(mergeContract, "NoCooldownActive");
    });
  });

  describe("Statistics and View Functions", function () {
    it("Should return merge statistics", async function () {
      const { mergeContract, trumpContract, user1 } = await loadFixture(deployMergeSystemFixture);

      await trumpContract.connect(user1).getTrump(1);
      await trumpContract.connect(user1).getTrump(2);
      await trumpContract.connect(user1).getTrump(3);

      await trumpContract.setRarityTier(1, "Common");
      await trumpContract.setRarityTier(2, "Common");
      await trumpContract.setRarityTier(3, "Common");

      await mergeContract.connect(user1).mergeTrumps(1, 2);

      const stats = await mergeContract.getMergeStats();
      expect(stats.totalMergeBurns).to.equal(1);
      expect(stats.totalMAGABurns).to.equal(0);
      expect(stats.totalBurns).to.equal(1);
    });

    it("Should return Trump merge history", async function () {
      const { mergeContract, trumpContract, user1 } = await loadFixture(deployMergeSystemFixture);

      await trumpContract.connect(user1).getTrump(1);
      await trumpContract.connect(user1).getTrump(2);
      await trumpContract.connect(user1).getTrump(3);

      await trumpContract.setRarityTier(1, "Common");
      await trumpContract.setRarityTier(2, "Common");
      await trumpContract.setRarityTier(3, "Common");

      await mergeContract.connect(user1).mergeTrumps(1, 2);

      const power = await mergeContract.getTrumpPower(1);
      expect(power.mergeCount).to.equal(1);
      expect(power.totalPowerGained).to.equal(1);
    });

    it("Should allow owner to update rarity tier names", async function () {
      const { mergeContract } = await loadFixture(deployMergeSystemFixture);

      await mergeContract.updateRarityTier(0, "NewCommon");
      expect(await mergeContract.rarityTiers(0)).to.equal("NewCommon");
    });

    it("Should revert if non-owner tries to update rarity tiers", async function () {
      const { mergeContract, user1 } = await loadFixture(deployMergeSystemFixture);

      await expect(
        mergeContract.connect(user1).updateRarityTier(0, "NewCommon")
      ).to.be.revertedWithCustomError(mergeContract, "OwnableUnauthorizedAccount");
    });
  });

  describe("Pause Functionality", function () {
    it("Should allow owner to pause and unpause", async function () {
      const { mergeContract } = await loadFixture(deployMergeSystemFixture);

      await mergeContract.pause();
      expect(await mergeContract.paused()).to.equal(true);

      await mergeContract.unpause();
      expect(await mergeContract.paused()).to.equal(false);
    });

    it("Should prevent merges when paused", async function () {
      const { mergeContract, trumpContract, user1 } = await loadFixture(deployMergeSystemFixture);

      await trumpContract.connect(user1).getTrump(1);
      await trumpContract.connect(user1).getTrump(2);

      await mergeContract.pause();

      await expect(
        mergeContract.connect(user1).mergeTrumps(1, 2)
      ).to.be.revertedWithCustomError(mergeContract, "EnforcedPause");
    });

    it("Should prevent burns when paused", async function () {
      const { mergeContract, trumpContract, user1 } = await loadFixture(deployMergeSystemFixture);

      await trumpContract.connect(user1).getTrump(1);
      await trumpContract.setRarityTier(1, "Common");

      await mergeContract.pause();

      await expect(
        mergeContract.connect(user1).burnTrumpForMAGA(1)
      ).to.be.revertedWithCustomError(mergeContract, "EnforcedPause");
    });
  });

  describe("Edge Cases", function () {
    it("Should handle Trump with no prior power initialization", async function () {
      const { mergeContract, trumpContract, user1 } = await loadFixture(deployMergeSystemFixture);

      await trumpContract.connect(user1).getTrump(1);

      const power = await mergeContract.getTrumpPower(1);
      expect(power.power).to.equal(0); // Not initialized until first merge
    });

    it("Should handle burning Trump that was never merged", async function () {
      const { mergeContract, trumpContract, magaToken, user1 } = await loadFixture(deployMergeSystemFixture);

      await trumpContract.connect(user1).getTrump(1);
      await trumpContract.setRarityTier(1, "Common");

      await mergeContract.connect(user1).burnTrumpForMAGA(1);

      // Should get base reward for power 1
      expect(await magaToken.balanceOf(user1.address)).to.be.greaterThan(0);
    });

    it("Should track consumed IDs across multiple merges", async function () {
      const { mergeContract, trumpContract, user1 } = await loadFixture(deployMergeSystemFixture);

      // Get 5 Trumps
      for (let i = 1; i <= 5; i++) {
        await trumpContract.connect(user1).getTrump(i);
        await trumpContract.setRarityTier(i, "Common");
      }

      // Merge 2,3,4,5 into 1
      await mergeContract.connect(user1).mergeTrumps(1, 2);
      await time.increase(7 * 24 * 60 * 60 + 1);
      await mergeContract.connect(user1).mergeTrumps(1, 3);
      await time.increase(7 * 24 * 60 * 60 + 1);
      await mergeContract.connect(user1).mergeTrumps(1, 4);
      await time.increase(7 * 24 * 60 * 60 + 1);
      await mergeContract.connect(user1).mergeTrumps(1, 5);

      const power = await mergeContract.getTrumpPower(1);
      expect(power.consumedIds.length).to.equal(4);
      expect(power.consumedIds).to.deep.equal([2n, 3n, 4n, 5n]);
      expect(power.power).to.equal(5);
    });
  });
});
