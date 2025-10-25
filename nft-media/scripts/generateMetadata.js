#!/usr/bin/env node

/**
 * CryptoTrump NFT Metadata Generator
 *
 * Generates 10,000 unique NFT metadata files with proper rarity distribution
 */

const fs = require('fs');
const path = require('path');
const traits = require('../traits/trumpTraits');

// Configuration
const OUTPUT_DIR = path.join(__dirname, '..', 'metadata');
const COLLECTION_SIZE = traits.COLLECTION_SIZE;
const BASE_IPFS_URI = 'ipfs://YOUR_IPFS_HASH_HERE'; // Update after uploading images

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Select a random trait value based on weighted probability
 */
function selectWeightedRandom(traitCategory) {
  const totalWeight = traitCategory.values.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;

  for (const item of traitCategory.values) {
    random -= item.weight;
    if (random <= 0) {
      return item;
    }
  }

  return traitCategory.values[0]; // Fallback
}

/**
 * Generate traits for a single NFT
 */
function generateTraits(tokenId) {
  // Check if this is a special 1-of-1 Trump
  const specialTrump = traits.specialTrumps.find(st => st.id === tokenId);
  if (specialTrump) {
    return {
      isSpecial: true,
      ...specialTrump
    };
  }

  const selectedTraits = {};
  const attributes = [];

  // Generate random trait for each category
  for (const [category, traitData] of Object.entries(traits.traits)) {
    const selected = selectWeightedRandom(traitData);
    selectedTraits[category] = selected.value;

    attributes.push({
      trait_type: traitData.name,
      value: selected.value,
      rarity: selected.rarity
    });
  }

  // Check for special combinations
  let specialBonus = null;
  for (const combo of traits.specialCombinations) {
    let matches = true;
    for (const [key, value] of Object.entries(combo.traits)) {
      if (selectedTraits[key] !== value) {
        matches = false;
        break;
      }
    }
    if (matches) {
      specialBonus = combo.bonus;
      break;
    }
  }

  return {
    isSpecial: false,
    selectedTraits,
    attributes,
    specialBonus
  };
}

/**
 * Calculate overall rarity score
 */
function calculateRarityScore(attributes) {
  const rarityValues = {
    "Common": 1,
    "Uncommon": 2,
    "Rare": 4,
    "Epic": 8,
    "Legendary": 16,
    "Mythic": 32
  };

  let score = 0;
  for (const attr of attributes) {
    score += rarityValues[attr.rarity] || 1;
  }

  return score;
}

/**
 * Determine overall rarity tier
 */
function determineRarityTier(score) {
  if (score >= 100) return "Mythic";
  if (score >= 60) return "Legendary";
  if (score >= 35) return "Epic";
  if (score >= 20) return "Rare";
  if (score >= 10) return "Uncommon";
  return "Common";
}

/**
 * Generate metadata for a single NFT
 */
function generateMetadata(tokenId) {
  const traitData = generateTraits(tokenId);

  if (traitData.isSpecial) {
    // Special 1-of-1 Trump
    return {
      name: `CryptoTrump #${tokenId} - ${traitData.name}`,
      description: traitData.description,
      image: `${BASE_IPFS_URI}/${tokenId}.png`,
      external_url: `https://cryptotrump.io/trump/${tokenId}`,
      attributes: [
        {
          trait_type: "Type",
          value: "Special Edition"
        },
        {
          trait_type: "Rarity",
          value: traitData.rarity
        },
        {
          trait_type: "Unique",
          value: "1 of 1"
        }
      ],
      properties: {
        category: "nft",
        creators: [{
          address: "YOUR_CREATOR_ADDRESS",
          share: 100
        }]
      },
      collection: {
        name: "CryptoTrump",
        family: "Trump"
      }
    };
  }

  // Regular Trump
  const rarityScore = calculateRarityScore(traitData.attributes);
  const rarityTier = determineRarityTier(rarityScore);

  // Add rarity score and tier to attributes
  const finalAttributes = [
    ...traitData.attributes,
    {
      trait_type: "Rarity Tier",
      value: rarityTier
    },
    {
      trait_type: "Rarity Score",
      value: rarityScore,
      display_type: "number"
    }
  ];

  if (traitData.specialBonus) {
    finalAttributes.push({
      trait_type: "Special Bonus",
      value: traitData.specialBonus
    });
  }

  let description = `One of 10,000 unique CryptoTrump NFT collectibles living on the Ethereum blockchain. `;
  description += `This ${rarityTier} Trump features ${traitData.selectedTraits.expression} with ${traitData.selectedTraits.outfit}. `;
  if (traitData.specialBonus) {
    description += `Special Edition: ${traitData.specialBonus}! `;
  }
  description += `Make NFTs Great Again!`;

  return {
    name: `CryptoTrump #${tokenId}`,
    description: description,
    image: `${BASE_IPFS_URI}/${tokenId}.png`,
    external_url: `https://cryptotrump.io/trump/${tokenId}`,
    attributes: finalAttributes,
    properties: {
      category: "nft",
      creators: [{
        address: "YOUR_CREATOR_ADDRESS",
        share: 100
      }]
    },
    collection: {
      name: "CryptoTrump",
      family: "Trump"
    },
    compiler: "CryptoTrump Metadata Generator v1.0"
  };
}

/**
 * Generate all metadata files
 */
function generateAll() {
  console.log(`🇺🇸 CryptoTrump Metadata Generator 🇺🇸`);
  console.log(`Generating ${COLLECTION_SIZE} metadata files...\n`);

  const rarityDistribution = {};
  const startTime = Date.now();

  for (let tokenId = 0; tokenId < COLLECTION_SIZE; tokenId++) {
    const metadata = generateMetadata(tokenId);

    // Track rarity distribution
    const rarityTier = metadata.attributes.find(a => a.trait_type === "Rarity Tier")?.value || "Special";
    rarityDistribution[rarityTier] = (rarityDistribution[rarityTier] || 0) + 1;

    // Write metadata file
    const filename = path.join(OUTPUT_DIR, `${tokenId}.json`);
    fs.writeFileSync(filename, JSON.stringify(metadata, null, 2));

    // Progress indicator
    if ((tokenId + 1) % 1000 === 0) {
      console.log(`✅ Generated ${tokenId + 1}/${COLLECTION_SIZE} metadata files`);
    }
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  console.log(`\n🎉 Successfully generated ${COLLECTION_SIZE} metadata files!`);
  console.log(`⏱️  Time taken: ${duration} seconds\n`);

  console.log(`📊 Rarity Distribution:`);
  for (const [tier, count] of Object.entries(rarityDistribution).sort((a, b) => b[1] - a[1])) {
    const percentage = ((count / COLLECTION_SIZE) * 100).toFixed(2);
    console.log(`   ${tier}: ${count} (${percentage}%)`);
  }

  // Generate collection metadata
  const collectionMetadata = {
    name: "CryptoTrump",
    description: "10,000 unique Trump-themed NFT collectibles with cross-chain capabilities. Make NFTs Great Again!",
    image: `${BASE_IPFS_URI}/collection.png`,
    external_link: "https://cryptotrump.io",
    seller_fee_basis_points: 500, // 5% royalty
    fee_recipient: "YOUR_CREATOR_ADDRESS"
  };

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'collection.json'),
    JSON.stringify(collectionMetadata, null, 2)
  );

  console.log(`\n✅ Collection metadata generated`);
  console.log(`\n🇺🇸 Make NFTs Great Again! 🇺🇸`);
}

// Run generator
if (require.main === module) {
  generateAll();
}

module.exports = { generateMetadata, generateAll };
