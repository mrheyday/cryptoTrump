const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("MAGAToken", function () {
  // Fixture to deploy the contracts
  async function deployMAGATokenFixture() {
    const [owner, trumpContract, user1, user2, user3] = await ethers.getSigners();

    // Deploy MAGAToken with trumpContract address
    const MAGAToken = await ethers.getContractFactory("MAGAToken");
    const magaToken = await MAGAToken.deploy(trumpContract.address);

    return { magaToken, owner, trumpContract, user1, user2, user3 };
  }

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      const { magaToken } = await loadFixture(deployMAGATokenFixture);
      expect(await magaToken.name()).to.equal("Make America Great Again");
      expect(await magaToken.symbol()).to.equal("MAGA");
    });

    it("Should set the correct decimals", async function () {
      const { magaToken } = await loadFixture(deployMAGATokenFixture);
      expect(await magaToken.decimals()).to.equal(18);
    });

    it("Should initialize with zero total supply", async function () {
      const { magaToken } = await loadFixture(deployMAGATokenFixture);
      expect(await magaToken.totalSupply()).to.equal(0);
    });

    it("Should set the deployer as owner", async function () {
      const { magaToken, owner } = await loadFixture(deployMAGATokenFixture);
      expect(await magaToken.owner()).to.equal(owner.address);
    });

    it("Should set the trump contract address", async function () {
      const { magaToken, trumpContract } = await loadFixture(deployMAGATokenFixture);
      expect(await magaToken.trumpContract()).to.equal(trumpContract.address);
    });

    it("Should initialize constants correctly", async function () {
      const { magaToken } = await loadFixture(deployMAGATokenFixture);
      expect(await magaToken.BASE_MAGA_REWARD()).to.equal(ethers.parseEther("100"));
      expect(await magaToken.MAX_BURNABLE_TRUMPS()).to.equal(10000);
    });
  });

  describe("Rarity Multipliers", function () {
    it("Should have correct default rarity multipliers", async function () {
      const { magaToken } = await loadFixture(deployMAGATokenFixture);

      expect(await magaToken.rarityMultipliers("Common")).to.equal(1);
      expect(await magaToken.rarityMultipliers("Uncommon")).to.equal(2);
      expect(await magaToken.rarityMultipliers("Rare")).to.equal(5);
      expect(await magaToken.rarityMultipliers("Epic")).to.equal(10);
      expect(await magaToken.rarityMultipliers("Legendary")).to.equal(15);
      expect(await magaToken.rarityMultipliers("Mythic")).to.equal(20);
    });

    it("Should allow owner to update rarity multipliers", async function () {
      const { magaToken, owner } = await loadFixture(deployMAGATokenFixture);

      await expect(magaToken.setRarityMultiplier("Common", 3))
        .to.emit(magaToken, "RarityMultiplierUpdated")
        .withArgs("Common", 3);

      expect(await magaToken.rarityMultipliers("Common")).to.equal(3);
    });

    it("Should revert if non-owner tries to update rarity multipliers", async function () {
      const { magaToken, user1 } = await loadFixture(deployMAGATokenFixture);

      await expect(
        magaToken.connect(user1).setRarityMultiplier("Common", 3)
      ).to.be.revertedWithCustomError(magaToken, "OwnableUnauthorizedAccount");
    });

    it("Should allow owner to update multiple rarity multipliers in batch", async function () {
      const { magaToken } = await loadFixture(deployMAGATokenFixture);

      const rarities = ["Common", "Rare", "Mythic"];
      const multipliers = [2, 8, 25];

      await magaToken.setRarityMultiplierBatch(rarities, multipliers);

      expect(await magaToken.rarityMultipliers("Common")).to.equal(2);
      expect(await magaToken.rarityMultipliers("Rare")).to.equal(8);
      expect(await magaToken.rarityMultipliers("Mythic")).to.equal(25);
    });

    it("Should revert batch update if arrays have different lengths", async function () {
      const { magaToken } = await loadFixture(deployMAGATokenFixture);

      const rarities = ["Common", "Rare"];
      const multipliers = [2, 8, 25]; // Mismatched length

      await expect(
        magaToken.setRarityMultiplierBatch(rarities, multipliers)
      ).to.be.revertedWithCustomError(magaToken, "ArrayLengthMismatch");
    });
  });

  describe("Trump Contract Management", function () {
    it("Should allow owner to update trump contract", async function () {
      const { magaToken, user1 } = await loadFixture(deployMAGATokenFixture);

      await expect(magaToken.setTrumpContract(user1.address))
        .to.emit(magaToken, "TrumpContractUpdated")
        .withArgs(user1.address);

      expect(await magaToken.trumpContract()).to.equal(user1.address);
    });

    it("Should revert if non-owner tries to update trump contract", async function () {
      const { magaToken, user1, user2 } = await loadFixture(deployMAGATokenFixture);

      await expect(
        magaToken.connect(user1).setTrumpContract(user2.address)
      ).to.be.revertedWithCustomError(magaToken, "OwnableUnauthorizedAccount");
    });

    it("Should revert if setting trump contract to zero address", async function () {
      const { magaToken } = await loadFixture(deployMAGATokenFixture);

      await expect(
        magaToken.setTrumpContract(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid trump contract");
    });
  });

  describe("MAGA Reward Calculation", function () {
    it("Should calculate correct reward for Common Trump with power 1", async function () {
      const { magaToken } = await loadFixture(deployMAGATokenFixture);

      const reward = await magaToken.calculateMAGAReward(1, "Common");
      // Base: 100 MAGA * 1 (Common) * 1 (power) + early burn bonus
      // Early burn bonus: (10000 - 0) / 100 = 100% bonus
      // Expected: 100 * 1 * 1 + 100% = 200 MAGA
      expect(reward).to.equal(ethers.parseEther("200"));
    });

    it("Should calculate correct reward for Legendary Trump with power 5", async function () {
      const { magaToken } = await loadFixture(deployMAGATokenFixture);

      const reward = await magaToken.calculateMAGAReward(5, "Legendary");
      // Base: 100 MAGA * 15 (Legendary) * 5 (power) = 7500
      // Early burn bonus: (10000 - 0) / 100 = 100% bonus
      // Expected: 7500 + 7500 = 15000 MAGA
      expect(reward).to.equal(ethers.parseEther("15000"));
    });

    it("Should calculate correct reward for Mythic Trump with power 10", async function () {
      const { magaToken } = await loadFixture(deployMAGATokenFixture);

      const reward = await magaToken.calculateMAGAReward(10, "Mythic");
      // Base: 100 MAGA * 20 (Mythic) * 10 (power) = 20000
      // Early burn bonus: 100%
      // Expected: 40000 MAGA
      expect(reward).to.equal(ethers.parseEther("40000"));
    });

    it("Should calculate reward with unknown rarity as 1x multiplier", async function () {
      const { magaToken } = await loadFixture(deployMAGATokenFixture);

      const reward = await magaToken.calculateMAGAReward(1, "Unknown");
      // Unknown rarity defaults to 1x multiplier
      expect(reward).to.equal(ethers.parseEther("200")); // Same as Common
    });

    it("Should handle zero power correctly", async function () {
      const { magaToken } = await loadFixture(deployMAGATokenFixture);

      const reward = await magaToken.calculateMAGAReward(0, "Common");
      // Power 0 should still give base reward
      expect(reward).to.equal(ethers.parseEther("0"));
    });

    it("Should reduce early burn bonus as totalBurned increases", async function () {
      const { magaToken, trumpContract } = await loadFixture(deployMAGATokenFixture);

      // Simulate 5000 burns
      for (let i = 0; i < 5000; i++) {
        await magaToken.connect(trumpContract).mintFromBurn(trumpContract.address, 1, "Common");
      }

      const reward = await magaToken.calculateMAGAReward(1, "Common");
      // Base: 100 MAGA
      // Early burn bonus: (10000 - 5000) / 100 = 50% bonus
      // Expected: 100 + 50 = 150 MAGA
      expect(reward).to.equal(ethers.parseEther("150"));
    });
  });

  describe("Minting from Burns", function () {
    it("Should allow trump contract to mint MAGA", async function () {
      const { magaToken, trumpContract, user1 } = await loadFixture(deployMAGATokenFixture);

      const reward = await magaToken.calculateMAGAReward(1, "Common");

      await expect(
        magaToken.connect(trumpContract).mintFromBurn(user1.address, 1, "Common")
      )
        .to.emit(magaToken, "MAGAMinted")
        .withArgs(user1.address, reward, 1, "Common", 1);

      expect(await magaToken.balanceOf(user1.address)).to.equal(reward);
      expect(await magaToken.totalSupply()).to.equal(reward);
      expect(await magaToken.totalTrumpsBurned()).to.equal(1);
    });

    it("Should revert if non-trump-contract tries to mint", async function () {
      const { magaToken, user1 } = await loadFixture(deployMAGATokenFixture);

      await expect(
        magaToken.connect(user1).mintFromBurn(user1.address, 1, "Common")
      ).to.be.revertedWithCustomError(magaToken, "UnauthorizedMinter");
    });

    it("Should revert if minting to zero address", async function () {
      const { magaToken, trumpContract } = await loadFixture(deployMAGATokenFixture);

      await expect(
        magaToken.connect(trumpContract).mintFromBurn(ethers.ZeroAddress, 1, "Common")
      ).to.be.revertedWithCustomError(magaToken, "InvalidRecipient");
    });

    it("Should track total burns correctly across multiple mints", async function () {
      const { magaToken, trumpContract, user1, user2 } = await loadFixture(deployMAGATokenFixture);

      await magaToken.connect(trumpContract).mintFromBurn(user1.address, 1, "Common");
      await magaToken.connect(trumpContract).mintFromBurn(user2.address, 2, "Rare");
      await magaToken.connect(trumpContract).mintFromBurn(user1.address, 3, "Legendary");

      expect(await magaToken.totalTrumpsBurned()).to.equal(3);
    });

    it("Should calculate decreasing rewards with inverse yield curve", async function () {
      const { magaToken, trumpContract, user1 } = await loadFixture(deployMAGATokenFixture);

      // First burn - full early bonus
      await magaToken.connect(trumpContract).mintFromBurn(user1.address, 1, "Common");
      const firstReward = await magaToken.balanceOf(user1.address);

      // Burn 1000 more times
      for (let i = 1; i < 1000; i++) {
        await magaToken.connect(trumpContract).mintFromBurn(user1.address, 1, "Common");
      }

      const balanceAfter1000 = await magaToken.balanceOf(user1.address);
      const lastReward = balanceAfter1000 - (firstReward * 999n);

      // Last reward should be less than first due to inverse yield curve
      expect(lastReward).to.be.lessThan(firstReward);
    });
  });

  describe("Burn Statistics", function () {
    it("Should track burn history correctly", async function () {
      const { magaToken, trumpContract, user1 } = await loadFixture(deployMAGATokenFixture);

      await magaToken.connect(trumpContract).mintFromBurn(user1.address, 1, "Common");
      await magaToken.connect(trumpContract).mintFromBurn(user1.address, 5, "Rare");

      const history = await magaToken.getBurnHistory(user1.address);
      expect(history.length).to.equal(2);
      expect(history[0].trumpPower).to.equal(1);
      expect(history[0].rarityTier).to.equal("Common");
      expect(history[1].trumpPower).to.equal(5);
      expect(history[1].rarityTier).to.equal("Rare");
    });

    it("Should return total MAGA earned from burns", async function () {
      const { magaToken, trumpContract, user1 } = await loadFixture(deployMAGATokenFixture);

      await magaToken.connect(trumpContract).mintFromBurn(user1.address, 1, "Common");
      await magaToken.connect(trumpContract).mintFromBurn(user1.address, 2, "Rare");

      const totalEarned = await magaToken.getTotalMAGAFromBurns(user1.address);
      const balance = await magaToken.balanceOf(user1.address);

      expect(totalEarned).to.equal(balance);
    });

    it("Should return burn count per address", async function () {
      const { magaToken, trumpContract, user1, user2 } = await loadFixture(deployMAGATokenFixture);

      await magaToken.connect(trumpContract).mintFromBurn(user1.address, 1, "Common");
      await magaToken.connect(trumpContract).mintFromBurn(user1.address, 2, "Rare");
      await magaToken.connect(trumpContract).mintFromBurn(user2.address, 3, "Epic");

      expect(await magaToken.getBurnCount(user1.address)).to.equal(2);
      expect(await magaToken.getBurnCount(user2.address)).to.equal(1);
    });
  });

  describe("Standard ERC20 Functions", function () {
    it("Should allow transfers between addresses", async function () {
      const { magaToken, trumpContract, user1, user2 } = await loadFixture(deployMAGATokenFixture);

      await magaToken.connect(trumpContract).mintFromBurn(user1.address, 1, "Common");
      const balance = await magaToken.balanceOf(user1.address);

      await expect(magaToken.connect(user1).transfer(user2.address, balance / 2n))
        .to.emit(magaToken, "Transfer")
        .withArgs(user1.address, user2.address, balance / 2n);

      expect(await magaToken.balanceOf(user2.address)).to.equal(balance / 2n);
    });

    it("Should allow approve and transferFrom", async function () {
      const { magaToken, trumpContract, user1, user2 } = await loadFixture(deployMAGATokenFixture);

      await magaToken.connect(trumpContract).mintFromBurn(user1.address, 1, "Common");
      const balance = await magaToken.balanceOf(user1.address);

      await magaToken.connect(user1).approve(user2.address, balance);
      await magaToken.connect(user2).transferFrom(user1.address, user2.address, balance / 2n);

      expect(await magaToken.balanceOf(user2.address)).to.equal(balance / 2n);
    });
  });

  describe("Pause Functionality", function () {
    it("Should allow owner to pause and unpause", async function () {
      const { magaToken } = await loadFixture(deployMAGATokenFixture);

      await magaToken.pause();
      expect(await magaToken.paused()).to.equal(true);

      await magaToken.unpause();
      expect(await magaToken.paused()).to.equal(false);
    });

    it("Should prevent transfers when paused", async function () {
      const { magaToken, trumpContract, user1, user2 } = await loadFixture(deployMAGATokenFixture);

      await magaToken.connect(trumpContract).mintFromBurn(user1.address, 1, "Common");
      await magaToken.pause();

      await expect(
        magaToken.connect(user1).transfer(user2.address, ethers.parseEther("50"))
      ).to.be.revertedWithCustomError(magaToken, "EnforcedPause");
    });

    it("Should prevent minting when paused", async function () {
      const { magaToken, trumpContract, user1 } = await loadFixture(deployMAGATokenFixture);

      await magaToken.pause();

      await expect(
        magaToken.connect(trumpContract).mintFromBurn(user1.address, 1, "Common")
      ).to.be.revertedWithCustomError(magaToken, "EnforcedPause");
    });

    it("Should revert if non-owner tries to pause", async function () {
      const { magaToken, user1 } = await loadFixture(deployMAGATokenFixture);

      await expect(
        magaToken.connect(user1).pause()
      ).to.be.revertedWithCustomError(magaToken, "OwnableUnauthorizedAccount");
    });
  });

  describe("Edge Cases", function () {
    it("Should handle maximum power level", async function () {
      const { magaToken, trumpContract, user1 } = await loadFixture(deployMAGATokenFixture);

      const reward = await magaToken.calculateMAGAReward(10000, "Mythic");
      await magaToken.connect(trumpContract).mintFromBurn(user1.address, 10000, "Mythic");

      expect(await magaToken.balanceOf(user1.address)).to.equal(reward);
    });

    it("Should handle all 10,000 Trumps being burned", async function () {
      const { magaToken, trumpContract, user1 } = await loadFixture(deployMAGATokenFixture);

      // Simulate burning all 10,000 Trumps
      for (let i = 0; i < 100; i++) {
        await magaToken.connect(trumpContract).mintFromBurn(user1.address, 1, "Common");
      }

      expect(await magaToken.totalTrumpsBurned()).to.equal(100);

      // Early burn bonus should be reduced
      const reward = await magaToken.calculateMAGAReward(1, "Common");
      // (10000 - 100) / 100 = 99% bonus
      expect(reward).to.equal(ethers.parseEther("199"));
    });

    it("Should return empty burn history for address that never burned", async function () {
      const { magaToken, user1 } = await loadFixture(deployMAGATokenFixture);

      const history = await magaToken.getBurnHistory(user1.address);
      expect(history.length).to.equal(0);
    });
  });
});
