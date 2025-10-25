/**
 * CryptoTrump Metadata Generator
 * Generates ERC721-compliant metadata JSON files for all Trumps
 */

const fs = require('fs');
const path = require('path');

// Load trait configuration and artwork data
const traitsConfig = require('../../artwork/traits/traits.config.js');

class TrumpMetadataGenerator {
  constructor() {
    this.config = traitsConfig;
    this.metadataDir = path.join(__dirname, '../../artwork/metadata');
    this.artworkDataPath = path.join(__dirname, '../../artwork/artwork-data.json');
    this.baseURI = 'ipfs://YOUR_IPFS_HASH/'; // Will be updated after IPFS upload
  }

  /**
   * Load artwork data
   */
  loadArtworkData() {
    if (!fs.existsSync(this.artworkDataPath)) {
      throw new Error('Artwork data not found. Please generate artwork first.');
    }
    return JSON.parse(fs.readFileSync(this.artworkDataPath, 'utf8'));
  }

  /**
   * Generate metadata for a single Trump
   */
  generateMetadata(artworkData) {
    const { tokenId, traits, rarityScore, rarityTier, special, specialName } = artworkData;

    // Build attributes array
    const attributes = [];

    // Add all trait attributes
    Object.entries(traits).forEach(([traitType, value]) => {
      // Skip "None" values for accessories and effects
      if (value !== 'None') {
        attributes.push({
          trait_type: this.formatTraitType(traitType),
          value: value
        });
      }
    });

    // Add rarity tier
    attributes.push({
      trait_type: 'Rarity Tier',
      value: rarityTier
    });

    // Add rarity score
    attributes.push({
      display_type: 'number',
      trait_type: 'Rarity Score',
      value: rarityScore
    });

    // Add special designation if applicable
    if (special && specialName) {
      attributes.push({
        trait_type: 'Special Edition',
        value: specialName
      });
    }

    // Add generation number
    attributes.push({
      display_type: 'number',
      trait_type: 'Generation',
      value: 1
    });

    // Build metadata object (ERC721 standard + OpenSea extensions)
    const metadata = {
      name: `${this.config.collection.name} #${tokenId}`,
      description: this.generateDescription(tokenId, traits, special, specialName),
      image: `${this.baseURI}images/${tokenId}.svg`,
      external_url: `https://cryptotrump.io/trump/${tokenId}`, // Your project website
      attributes: attributes,

      // Additional metadata
      compiler: 'CryptoTrump Generator v1.0.0',
      date: Date.now(),
      dna: artworkData.hash.substring(0, 16),
    };

    return metadata;
  }

  /**
   * Format trait type for display
   */
  formatTraitType(traitType) {
    // Convert camelCase to Title Case
    return traitType
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  /**
   * Generate description text
   */
  generateDescription(tokenId, traits, special, specialName) {
    let description = `${this.config.collection.description}`;

    if (special && specialName) {
      description += `\n\n🌟 SPECIAL EDITION: ${specialName}`;
      description += `\nThis is one of the rare special edition CryptoTrumps with a unique guaranteed trait combination!`;
    }

    description += `\n\nTrump #${tokenId} features ${this.describeTraits(traits)}.`;

    description += `\n\n🇺🇸 Make NFTs Great Again! 🇺🇸`;
    description += `\n\nBuilt on the Ethereum blockchain with cross-chain capabilities powered by LayerZero V2.`;

    return description;
  }

  /**
   * Describe traits in natural language
   */
  describeTraits(traits) {
    const parts = [];

    if (traits.hairStyle) {
      parts.push(`a ${traits.hairStyle.toLowerCase()}`);
    }

    if (traits.expression) {
      parts.push(`${traits.expression.toLowerCase()} expression`);
    }

    if (traits.outfit) {
      parts.push(`wearing a ${traits.outfit.toLowerCase()}`);
    }

    if (traits.background) {
      parts.push(`against a ${traits.background.toLowerCase()} background`);
    }

    if (traits.accessory && traits.accessory !== 'None') {
      parts.push(`with ${traits.accessory.toLowerCase()}`);
    }

    return parts.join(', ');
  }

  /**
   * Generate metadata for all Trumps
   */
  async generateAll() {
    console.log(`📝 Starting CryptoTrump Metadata Generation...`);

    // Load artwork data
    const artworkData = this.loadArtworkData();
    console.log(`📊 Loaded data for ${artworkData.length} Trumps\n`);

    const startTime = Date.now();
    let generatedCount = 0;

    for (const data of artworkData) {
      // Generate metadata
      const metadata = this.generateMetadata(data);

      // Save metadata file
      const filename = `${data.tokenId}.json`;
      const filepath = path.join(this.metadataDir, filename);
      fs.writeFileSync(filepath, JSON.stringify(metadata, null, 2));

      generatedCount++;

      // Progress indicator
      if (generatedCount % 100 === 0) {
        const progress = (generatedCount / artworkData.length * 100).toFixed(1);
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`✅ Generated ${generatedCount}/${artworkData.length} (${progress}%) - ${elapsed}s elapsed`);
      }
    }

    // Generate collection metadata
    await this.generateCollectionMetadata(artworkData);

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n🎉 Metadata generation complete!`);
    console.log(`⏱️  Total time: ${totalTime}s`);
    console.log(`📁 Metadata saved to: ${this.metadataDir}`);
    console.log(`📊 Generated ${generatedCount} metadata files`);

    return generatedCount;
  }

  /**
   * Generate collection-level metadata
   */
  async generateCollectionMetadata(artworkData) {
    // Calculate collection stats
    const stats = this.calculateCollectionStats(artworkData);

    const collectionMetadata = {
      name: this.config.collection.name,
      description: `${this.config.collection.description}\n\nA collection of ${this.config.collection.totalSupply} unique, programmatically generated Trump-themed NFTs living on the Ethereum blockchain.`,
      image: `${this.baseURI}collection.png`, // Collection banner image
      external_link: 'https://cryptotrump.io',
      seller_fee_basis_points: 500, // 5% royalty
      fee_recipient: '0x0000000000000000000000000000000000000000', // Update with actual address

      // Collection stats
      stats: stats,

      // Social links
      twitter_username: 'CryptoTrump',
      discord_url: 'https://discord.gg/cryptotrump',

      // Contract info
      contract_address: '0x0000000000000000000000000000000000000000', // Update after deployment
      chain: 'ethereum',
    };

    const filepath = path.join(this.metadataDir, 'collection.json');
    fs.writeFileSync(filepath, JSON.stringify(collectionMetadata, null, 2));

    console.log(`📊 Collection metadata saved`);
  }

  /**
   * Calculate collection statistics
   */
  calculateCollectionStats(artworkData) {
    const stats = {
      total: artworkData.length,
      rarityTiers: {},
      specialEditions: 0,
      averageRarityScore: 0,
      traitDistribution: {},
    };

    let totalRarity = 0;

    artworkData.forEach(data => {
      // Rarity tiers
      stats.rarityTiers[data.rarityTier] = (stats.rarityTiers[data.rarityTier] || 0) + 1;

      // Special editions
      if (data.special) {
        stats.specialEditions++;
      }

      // Average rarity
      totalRarity += data.rarityScore;

      // Trait distribution
      Object.entries(data.traits).forEach(([type, value]) => {
        if (!stats.traitDistribution[type]) {
          stats.traitDistribution[type] = {};
        }
        stats.traitDistribution[type][value] = (stats.traitDistribution[type][value] || 0) + 1;
      });
    });

    stats.averageRarityScore = Math.round((totalRarity / artworkData.length) * 100) / 100;

    return stats;
  }

  /**
   * Update base URI (after IPFS upload)
   */
  updateBaseURI(newBaseURI) {
    console.log(`🔄 Updating base URI to: ${newBaseURI}`);
    this.baseURI = newBaseURI;

    // Regenerate all metadata with new base URI
    return this.generateAll();
  }
}

// Main execution
if (require.main === module) {
  const generator = new TrumpMetadataGenerator();
  generator.generateAll().catch(console.error);
}

module.exports = TrumpMetadataGenerator;
