// CryptoTrump Trait System Configuration
// Defines all traits and their rarity weights for 10,000 unique Trumps

module.exports = {
  // Collection metadata
  collection: {
    name: "CryptoTrump",
    description: "One of 10,000 unique Trump-themed collectibles",
    symbol: "TRUMP",
    totalSupply: 10000,
  },

  // Trait categories with rarity weights (higher weight = more common)
  traits: {
    // Background (10 variants)
    background: [
      { name: "American Flag", weight: 20, color: "#B22234" },
      { name: "Gold Luxe", weight: 15, color: "#FFD700" },
      { name: "Presidential Blue", weight: 18, color: "#003366" },
      { name: "MAGA Red", weight: 20, color: "#FF0000" },
      { name: "Marble Elegance", weight: 12, color: "#F5F5DC" },
      { name: "Trump Tower Gold", weight: 10, color: "#DAA520" },
      { name: "Wall Grey", weight: 15, color: "#808080" },
      { name: "Twitter Blue", weight: 12, color: "#1DA1F2" },
      { name: "Dollar Green", weight: 10, color: "#355E3B" },
      { name: "Diamond Rare", weight: 3, color: "#B9F2FF" }, // Rare
    ],

    // Skin Tone (5 variants)
    skinTone: [
      { name: "Classic Tan", weight: 30, color: "#FFB347" },
      { name: "Golden Glow", weight: 25, color: "#FFA500" },
      { name: "Presidential Bronze", weight: 20, color: "#CD7F32" },
      { name: "Tropical Orange", weight: 15, color: "#FF8C00" },
      { name: "Ultra Rare Gold", weight: 10, color: "#FFD700" }, // Rare
    ],

    // Hair Style (12 variants)
    hairStyle: [
      { name: "Classic Combover", weight: 25, color: "#FFD700" },
      { name: "Golden Swoop", weight: 20, color: "#FFA500" },
      { name: "Wind Blown", weight: 18, color: "#FFD700" },
      { name: "Power Flow", weight: 15, color: "#DAA520" },
      { name: "Slicked Back", weight: 12, color: "#FFD700" },
      { name: "Volume Max", weight: 10, color: "#FFA500" },
      { name: "Presidential Wave", weight: 8, color: "#FFD700" },
      { name: "Gravity Defying", weight: 6, color: "#FFA500" },
      { name: "Platinum Blonde", weight: 5, color: "#F0E68C" },
      { name: "Silver Fox", weight: 3, color: "#C0C0C0" }, // Rare
      { name: "Rainbow Mane", weight: 2, color: "#FF6B6B" }, // Very Rare
      { name: "Golden Crown", weight: 1, color: "#FFD700" }, // Ultra Rare
    ],

    // Expression (15 variants)
    expression: [
      { name: "Thumbs Up", weight: 20 },
      { name: "Confident Smirk", weight: 18 },
      { name: "You're Fired", weight: 15 },
      { name: "Winning Smile", weight: 15 },
      { name: "Serious Business", weight: 12 },
      { name: "Accordion Hands", weight: 10 },
      { name: "Peace Sign", weight: 10 },
      { name: "Power Stance", weight: 8 },
      { name: "Pointing Finger", weight: 7 },
      { name: "Fist Pump", weight: 6 },
      { name: "Air Kiss", weight: 5 },
      { name: "Wink", weight: 4 },
      { name: "Shrug", weight: 3 },
      { name: "OK Sign", weight: 2 },
      { name: "Legendary Pose", weight: 1 }, // Ultra Rare
    ],

    // Outfit (20 variants)
    outfit: [
      { name: "Classic Red Tie", weight: 20, color: "#FF0000" },
      { name: "Blue Power Suit", weight: 18, color: "#003366" },
      { name: "Black Tuxedo", weight: 15, color: "#000000" },
      { name: "Casual Golf", weight: 12, color: "#FFFFFF" },
      { name: "Navy Business", weight: 12, color: "#000080" },
      { name: "Charcoal Grey", weight: 10, color: "#36454F" },
      { name: "Pin Stripe", weight: 8, color: "#2F4F4F" },
      { name: "MAGA Rally", weight: 8, color: "#FF0000" },
      { name: "Gold Accents", weight: 7, color: "#FFD700" },
      { name: "Presidential", weight: 6, color: "#003366" },
      { name: "Aviator Jacket", weight: 5, color: "#8B4513" },
      { name: "Patriot Colors", weight: 5, color: "#B22234" },
      { name: "Luxury White", weight: 4, color: "#FFFFFF" },
      { name: "Commander Chief", weight: 3, color: "#000080" },
      { name: "Golden Blazer", weight: 2, color: "#DAA520" },
      { name: "Diamond Suit", weight: 2, color: "#B9F2FF" },
      { name: "Stars & Stripes", weight: 2, color: "#3C3B6E" },
      { name: "Bitcoin Orange", weight: 1, color: "#FF9900" }, // Crypto Rare
      { name: "Ethereum Purple", weight: 1, color: "#8C7AE6" }, // Crypto Rare
      { name: "Legendary Gold", weight: 1, color: "#FFD700" }, // Ultra Rare
    ],

    // Accessories (25 variants - can be none)
    accessory: [
      { name: "None", weight: 30 },
      { name: "MAGA Hat", weight: 15, color: "#FF0000" },
      { name: "American Flag Pin", weight: 12 },
      { name: "Gold Watch", weight: 10, color: "#FFD700" },
      { name: "Aviator Sunglasses", weight: 8 },
      { name: "Presidential Seal", weight: 7 },
      { name: "Dollar Bills", weight: 6 },
      { name: "Gold Chain", weight: 5, color: "#FFD700" },
      { name: "Microphone", weight: 4 },
      { name: "Twitter Bird", weight: 4, color: "#1DA1F2" },
      { name: "Smartphone", weight: 3 },
      { name: "Golf Club", weight: 3 },
      { name: "Trophy", weight: 3, color: "#FFD700" },
      { name: "Briefcase", weight: 2 },
      { name: "Bitcoin Symbol", weight: 2, color: "#FF9900" },
      { name: "Ethereum Logo", weight: 2, color: "#8C7AE6" },
      { name: "NFT Badge", weight: 2 },
      { name: "Crown", weight: 2, color: "#FFD700" },
      { name: "Scepter", weight: 1, color: "#FFD700" },
      { name: "Laser Eyes", weight: 1, color: "#FF0000" }, // Meme Rare
      { name: "Diamond Hands", weight: 1, color: "#B9F2FF" },
      { name: "Rocket", weight: 1 },
      { name: "Pepe Friend", weight: 1, color: "#90EE90" }, // Meme Rare
      { name: "Doge Companion", weight: 1, color: "#FFD700" }, // Meme Rare
      { name: "Legendary Aura", weight: 1, color: "#FFD700" }, // Ultra Rare
    ],

    // Special Effects (15 variants - most are none)
    specialEffect: [
      { name: "None", weight: 70 },
      { name: "Winning Glow", weight: 8, color: "#FFD700" },
      { name: "American Sparkles", weight: 6 },
      { name: "Gold Shimmer", weight: 5, color: "#FFD700" },
      { name: "Presidential Aura", weight: 4, color: "#003366" },
      { name: "Dollar Rain", weight: 3 },
      { name: "Crypto Glow", weight: 2, color: "#FF9900" },
      { name: "Diamond Shine", weight: 2, color: "#B9F2FF" },
      { name: "Fire Background", weight: 1, color: "#FF4500" },
      { name: "Lightning Bolts", weight: 1, color: "#FFFF00" },
      { name: "Rainbow Trail", weight: 1 },
      { name: "Holographic", weight: 1 },
      { name: "Neon Outline", weight: 1, color: "#00FF00" },
      { name: "Space Background", weight: 1, color: "#000033" },
      { name: "Legendary Cosmic", weight: 1 }, // Ultra Rare
    ],

    // Rarity Tier (calculated based on trait combinations)
    rarityTier: [
      { name: "Common", range: [0, 5000] },
      { name: "Uncommon", range: [5000, 7500] },
      { name: "Rare", range: [7500, 9000] },
      { name: "Epic", range: [9000, 9700] },
      { name: "Legendary", range: [9700, 9950] },
      { name: "Mythic", range: [9950, 10000] },
    ],
  },

  // Rarity calculation weights
  rarityWeights: {
    background: 1.0,
    skinTone: 0.8,
    hairStyle: 1.5,
    expression: 1.2,
    outfit: 1.3,
    accessory: 2.0,
    specialEffect: 3.0,
  },

  // Special combinations (guaranteed rare)
  specialCombinations: [
    {
      name: "The President",
      traits: {
        background: "Presidential Blue",
        expression: "Power Stance",
        outfit: "Presidential",
        accessory: "Presidential Seal",
      },
      guaranteed: [1], // Token ID 1
    },
    {
      name: "The Billionaire",
      traits: {
        background: "Gold Luxe",
        outfit: "Legendary Gold",
        accessory: "Gold Chain",
        specialEffect: "Gold Shimmer",
      },
      guaranteed: [100, 1000, 5000], // Special token IDs
    },
    {
      name: "The Crypto King",
      traits: {
        background: "Diamond Rare",
        outfit: "Bitcoin Orange",
        accessory: "Bitcoin Symbol",
        specialEffect: "Crypto Glow",
      },
      guaranteed: [777, 6969], // Lucky numbers
    },
    {
      name: "The Meme Lord",
      traits: {
        expression: "Legendary Pose",
        accessory: "Laser Eyes",
        specialEffect: "Legendary Cosmic",
      },
      guaranteed: [420, 1337, 9999], // Meme numbers
    },
  ],
};
