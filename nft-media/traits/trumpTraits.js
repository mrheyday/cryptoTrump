/**
 * CryptoTrump NFT Traits Definition
 *
 * This file defines all possible traits and their rarities for the 10,000 CryptoTrump NFTs
 */

module.exports = {
  // Total collection size
  COLLECTION_SIZE: 10000,

  // Trait categories and their possible values with rarity weights
  traits: {

    // Background (10% weight in overall rarity)
    background: {
      name: "Background",
      values: [
        { value: "American Flag", weight: 15, rarity: "Common" },
        { value: "Gold Curtain", weight: 12, rarity: "Common" },
        { value: "Red Velvet", weight: 12, rarity: "Common" },
        { value: "Blue Sky", weight: 10, rarity: "Common" },
        { value: "White House", weight: 8, rarity: "Uncommon" },
        { value: "Trump Tower", weight: 8, rarity: "Uncommon" },
        { value: "Mar-a-Lago", weight: 7, rarity: "Uncommon" },
        { value: "Golden Sunset", weight: 6, rarity: "Rare" },
        { value: "Presidential Seal", weight: 5, rarity: "Rare" },
        { value: "NYC Skyline", weight: 5, rarity: "Rare" },
        { value: "Air Force One", weight: 4, rarity: "Epic" },
        { value: "Oval Office", weight: 3, rarity: "Epic" },
        { value: "Space Force", weight: 2, rarity: "Legendary" },
        { value: "Mount Rushmore", weight: 2, rarity: "Legendary" },
        { value: "Golden Trump Tower", weight: 1, rarity: "Mythic" }
      ]
    },

    // Expression (20% weight)
    expression: {
      name: "Expression",
      values: [
        { value: "Confident Smile", weight: 20, rarity: "Common" },
        { value: "Thumbs Up", weight: 18, rarity: "Common" },
        { value: "Pointing", weight: 15, rarity: "Common" },
        { value: "Serious", weight: 12, rarity: "Common" },
        { value: "Winking", weight: 10, rarity: "Uncommon" },
        { value: "Peace Sign", weight: 8, rarity: "Uncommon" },
        { value: "Fist Pump", weight: 7, rarity: "Rare" },
        { value: "Double Thumbs Up", weight: 5, rarity: "Rare" },
        { value: "You're Fired", weight: 3, rarity: "Epic" },
        { value: "America First Gesture", weight: 2, rarity: "Legendary" }
      ]
    },

    // Hair Style (15% weight)
    hairStyle: {
      name: "Hair Style",
      values: [
        { value: "Classic Blonde", weight: 30, rarity: "Common" },
        { value: "Windswept", weight: 20, rarity: "Common" },
        { value: "Perfect Coif", weight: 15, rarity: "Uncommon" },
        { value: "Golden Locks", weight: 12, rarity: "Uncommon" },
        { value: "Presidential", weight: 10, rarity: "Rare" },
        { value: "Pompadour", weight: 6, rarity: "Rare" },
        { value: "Slicked Back", weight: 4, rarity: "Epic" },
        { value: "Rainbow Patriot", weight: 2, rarity: "Legendary" },
        { value: "Golden Crown Hair", weight: 1, rarity: "Mythic" }
      ]
    },

    // Outfit (20% weight)
    outfit: {
      name: "Outfit",
      values: [
        { value: "Red Tie", weight: 25, rarity: "Common" },
        { value: "Blue Suit", weight: 20, rarity: "Common" },
        { value: "Black Suit White Tie", weight: 15, rarity: "Common" },
        { value: "Navy Suit Red Tie", weight: 12, rarity: "Uncommon" },
        { value: "Tuxedo", weight: 10, rarity: "Uncommon" },
        { value: "Golf Outfit", weight: 8, rarity: "Rare" },
        { value: "MAGA Hat & Suit", weight: 5, rarity: "Rare" },
        { value: "Presidential Suit", weight: 3, rarity: "Epic" },
        { value: "Gold Suit", weight: 1.5, rarity: "Legendary" },
        { value: "Diamond Encrusted Suit", weight: 0.5, rarity: "Mythic" }
      ]
    },

    // Accessories (15% weight)
    accessories: {
      name: "Accessories",
      values: [
        { value: "None", weight: 30, rarity: "Common" },
        { value: "American Flag Pin", weight: 20, rarity: "Common" },
        { value: "Gold Watch", weight: 15, rarity: "Uncommon" },
        { value: "Presidential Pin", weight: 12, rarity: "Uncommon" },
        { value: "MAGA Hat", weight: 10, rarity: "Rare" },
        { value: "Aviator Sunglasses", weight: 6, rarity: "Rare" },
        { value: "Gold Chain", weight: 4, rarity: "Epic" },
        { value: "Presidential Medal", weight: 2, rarity: "Legendary" },
        { value: "Golden Crown", weight: 1, rarity: "Mythic" }
      ]
    },

    // Special Effects (10% weight)
    specialEffects: {
      name: "Special Effects",
      values: [
        { value: "None", weight: 60, rarity: "Common" },
        { value: "Patriotic Glow", weight: 15, rarity: "Uncommon" },
        { value: "Golden Aura", weight: 10, rarity: "Rare" },
        { value: "American Flag Overlay", weight: 7, rarity: "Rare" },
        { value: "Fireworks", weight: 4, rarity: "Epic" },
        { value: "Lightning", weight: 2, rarity: "Legendary" },
        { value: "Presidential Halo", weight: 1.5, rarity: "Legendary" },
        { value: "Holographic", weight: 0.5, rarity: "Mythic" }
      ]
    },

    // Border (5% weight)
    border: {
      name: "Border",
      values: [
        { value: "None", weight: 50, rarity: "Common" },
        { value: "Silver", weight: 20, rarity: "Common" },
        { value: "Gold", weight: 15, rarity: "Uncommon" },
        { value: "American Flag", weight: 8, rarity: "Rare" },
        { value: "Diamond", weight: 4, rarity: "Epic" },
        { value: "Presidential", weight: 2, rarity: "Legendary" },
        { value: "Animated Rainbow", weight: 1, rarity: "Mythic" }
      ]
    },

    // Edition (5% weight)
    edition: {
      name: "Edition",
      values: [
        { value: "Standard", weight: 90, rarity: "Common" },
        { value: "First Edition", weight: 5, rarity: "Epic" },
        { value: "Founders Edition", weight: 3, rarity: "Legendary" },
        { value: "1 of 1 Special", weight: 2, rarity: "Mythic" }
      ]
    }
  },

  // Rarity tiers
  rarityTiers: {
    "Common": {
      color: "#FFFFFF",
      probability: 0.50, // 50%
      description: "Standard CryptoTrump"
    },
    "Uncommon": {
      color: "#00FF00",
      probability: 0.25, // 25%
      description: "Slightly rare CryptoTrump"
    },
    "Rare": {
      color: "#0099FF",
      probability: 0.15, // 15%
      description: "Rare CryptoTrump"
    },
    "Epic": {
      color: "#9966FF",
      probability: 0.07, // 7%
      description: "Epic CryptoTrump"
    },
    "Legendary": {
      color: "#FF6600",
      probability: 0.025, // 2.5%
      description: "Legendary CryptoTrump"
    },
    "Mythic": {
      color: "#FF0000",
      probability: 0.005, // 0.5%
      description: "Mythic CryptoTrump - Ultra Rare!"
    }
  },

  // Special 1-of-1 Trumps (IDs 0-99 reserved)
  specialTrumps: [
    {
      id: 0,
      name: "The Original Trump",
      description: "The very first CryptoTrump - Genesis Edition",
      rarity: "Mythic",
      unique: true
    },
    {
      id: 1,
      name: "Golden Trump",
      description: "100% Gold everything - The most tremendous!",
      rarity: "Mythic",
      unique: true
    },
    {
      id: 2,
      name: "Presidential Trump",
      description: "Official Presidential Edition",
      rarity: "Mythic",
      unique: true
    },
    {
      id: 45,
      name: "45th President Trump",
      description: "Commemorating the 45th President",
      rarity: "Mythic",
      unique: true
    },
    {
      id: 47,
      name: "47th President Trump",
      description: "Future Presidential Edition",
      rarity: "Mythic",
      unique: true
    }
  ],

  // Trait combinations that create special NFTs
  specialCombinations: [
    {
      name: "All Gold",
      traits: {
        background: "Golden Trump Tower",
        outfit: "Gold Suit",
        accessories: "Golden Crown",
        specialEffects: "Golden Aura"
      },
      bonus: "Ultimate Gold Edition"
    },
    {
      name: "Presidential",
      traits: {
        background: "Oval Office",
        outfit: "Presidential Suit",
        accessories: "Presidential Medal",
        specialEffects: "Presidential Halo"
      },
      bonus: "Commander-in-Chief Edition"
    },
    {
      name: "American Hero",
      traits: {
        background: "American Flag",
        outfit: "Navy Suit Red Tie",
        accessories: "American Flag Pin",
        border: "American Flag"
      },
      bonus: "Patriotic Edition"
    }
  ]
};
