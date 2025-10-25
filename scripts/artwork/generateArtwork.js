/**
 * CryptoTrump Artwork Generator
 * Generates 10,000 unique Trump-themed NFT artworks using SVG
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Load trait configuration
const traitsConfig = require('../../artwork/traits/traits.config.js');

class TrumpArtworkGenerator {
  constructor() {
    this.config = traitsConfig;
    this.generatedCombinations = new Set();
    this.artworkDir = path.join(__dirname, '../../artwork/images');
    this.metadataDir = path.join(__dirname, '../../artwork/metadata');
  }

  /**
   * Weighted random selection
   */
  weightedRandom(items) {
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;

    for (const item of items) {
      random -= item.weight;
      if (random <= 0) {
        return item;
      }
    }

    return items[items.length - 1];
  }

  /**
   * Generate unique trait combination
   */
  generateTraits(tokenId) {
    // Check for special combinations
    const specialCombo = this.config.specialCombinations.find(combo =>
      combo.guaranteed.includes(tokenId)
    );

    if (specialCombo) {
      return this.generateSpecialTraits(specialCombo, tokenId);
    }

    // Generate random traits
    let traits;
    let hash;
    let attempts = 0;
    const maxAttempts = 1000;

    do {
      traits = {
        background: this.weightedRandom(this.config.traits.background),
        skinTone: this.weightedRandom(this.config.traits.skinTone),
        hairStyle: this.weightedRandom(this.config.traits.hairStyle),
        expression: this.weightedRandom(this.config.traits.expression),
        outfit: this.weightedRandom(this.config.traits.outfit),
        accessory: this.weightedRandom(this.config.traits.accessory),
        specialEffect: this.weightedRandom(this.config.traits.specialEffect),
      };

      hash = this.hashTraits(traits);
      attempts++;

      if (attempts >= maxAttempts) {
        console.warn(`Max attempts reached for token ${tokenId}, using current combination`);
        break;
      }
    } while (this.generatedCombinations.has(hash));

    this.generatedCombinations.add(hash);
    return { traits, hash, tokenId, special: false };
  }

  /**
   * Generate special trait combination
   */
  generateSpecialTraits(specialCombo, tokenId) {
    const traits = {
      background: this.config.traits.background.find(t => t.name === specialCombo.traits.background) || this.weightedRandom(this.config.traits.background),
      skinTone: this.config.traits.skinTone.find(t => t.name === specialCombo.traits.skinTone) || this.weightedRandom(this.config.traits.skinTone),
      hairStyle: this.config.traits.hairStyle.find(t => t.name === specialCombo.traits.hairStyle) || this.weightedRandom(this.config.traits.hairStyle),
      expression: this.config.traits.expression.find(t => t.name === specialCombo.traits.expression) || this.weightedRandom(this.config.traits.expression),
      outfit: this.config.traits.outfit.find(t => t.name === specialCombo.traits.outfit) || this.weightedRandom(this.config.traits.outfit),
      accessory: this.config.traits.accessory.find(t => t.name === specialCombo.traits.accessory) || this.weightedRandom(this.config.traits.accessory),
      specialEffect: this.config.traits.specialEffect.find(t => t.name === specialCombo.traits.specialEffect) || this.weightedRandom(this.config.traits.specialEffect),
    };

    const hash = this.hashTraits(traits);
    this.generatedCombinations.add(hash);

    return { traits, hash, tokenId, special: true, specialName: specialCombo.name };
  }

  /**
   * Create hash of trait combination for uniqueness checking
   */
  hashTraits(traits) {
    const traitString = Object.values(traits).map(t => t.name).join('|');
    return crypto.createHash('sha256').update(traitString).digest('hex');
  }

  /**
   * Calculate rarity score
   */
  calculateRarityScore(traits) {
    let score = 0;

    Object.entries(traits).forEach(([category, trait]) => {
      const weight = this.config.rarityWeights[category] || 1.0;
      const traitRarity = 1 / (trait.weight || 1);
      score += traitRarity * weight * 100;
    });

    return Math.round(score * 100) / 100;
  }

  /**
   * Determine rarity tier based on score
   */
  getRarityTier(tokenId) {
    for (const tier of this.config.traits.rarityTier) {
      if (tokenId >= tier.range[0] && tokenId < tier.range[1]) {
        return tier.name;
      }
    }
    return 'Common';
  }

  /**
   * Generate SVG artwork
   */
  generateSVG(tokenId, traits, specialName) {
    const width = 1000;
    const height = 1000;

    // Background
    const bgColor = traits.background.color || '#FF0000';

    // Create SVG with all layers
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
  <defs>
    <!-- Gradients -->
    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FFD700;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FFA500;stop-opacity:1" />
    </linearGradient>

    <radialGradient id="skinGradient">
      <stop offset="0%" style="stop-color:${traits.skinTone.color};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${this.darkenColor(traits.skinTone.color, 20)};stop-opacity:1" />
    </radialGradient>

    <linearGradient id="hairGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${traits.hairStyle.color};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${this.darkenColor(traits.hairStyle.color, 10)};stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Background Layer -->
  <rect width="${width}" height="${height}" fill="${bgColor}"/>
  ${this.generateBackgroundPattern(traits.background.name, width, height)}

  <!-- Body/Outfit Layer -->
  ${this.generateOutfit(traits.outfit, width, height)}

  <!-- Face/Skin Layer -->
  ${this.generateFace(traits.skinTone, traits.expression, width, height)}

  <!-- Hair Layer -->
  ${this.generateHair(traits.hairStyle, width, height)}

  <!-- Accessory Layer -->
  ${traits.accessory.name !== 'None' ? this.generateAccessory(traits.accessory, width, height) : ''}

  <!-- Special Effect Layer -->
  ${traits.specialEffect.name !== 'None' ? this.generateSpecialEffect(traits.specialEffect, width, height) : ''}

  <!-- Token ID Text -->
  <text x="${width - 50}" y="${height - 30}" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="white" text-anchor="end" opacity="0.7">
    #${tokenId}
  </text>

  ${specialName ? `<text x="50" y="50" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#FFD700" opacity="0.9">${specialName}</text>` : ''}
</svg>`;

    return svg;
  }

  /**
   * Generate background pattern
   */
  generateBackgroundPattern(bgName, width, height) {
    if (bgName.includes('Flag')) {
      return `
        <!-- American Flag Stripes -->
        <g opacity="0.3">
          ${Array.from({length: 13}, (_, i) =>
            i % 2 === 0 ? `<rect y="${i * (height/13)}" width="${width}" height="${height/13}" fill="white"/>` : ''
          ).join('')}
        </g>`;
    } else if (bgName.includes('Diamond') || bgName.includes('Legendary')) {
      return `
        <!-- Diamond Pattern -->
        <g opacity="0.2">
          <circle cx="${width/2}" cy="${height/2}" r="300" fill="none" stroke="white" stroke-width="2"/>
          <circle cx="${width/2}" cy="${height/2}" r="400" fill="none" stroke="white" stroke-width="2"/>
        </g>`;
    }
    return '';
  }

  /**
   * Generate outfit/body
   */
  generateOutfit(outfit, width, height) {
    const outfitColor = outfit.color || '#000000';
    const centerX = width / 2;
    const shoulderY = height * 0.55;

    return `
      <g id="outfit">
        <!-- Suit Shoulders -->
        <rect x="${centerX - 250}" y="${shoulderY}" width="500" height="400" fill="${outfitColor}" rx="20"/>

        <!-- Tie -->
        <polygon points="${centerX},${shoulderY + 50} ${centerX - 40},${shoulderY + 80} ${centerX},${shoulderY + 300} ${centerX + 40},${shoulderY + 80}" fill="${outfit.name.includes('Red') ? '#CC0000' : '#003366'}" />

        <!-- Shirt -->
        <rect x="${centerX - 100}" y="${shoulderY + 20}" width="200" height="100" fill="white"/>

        <!-- Suit Lapels -->
        <polygon points="${centerX - 100},${shoulderY + 40} ${centerX - 200},${shoulderY + 200} ${centerX - 150},${shoulderY + 250} ${centerX - 80},${shoulderY + 80}" fill="${this.darkenColor(outfitColor, 15)}" />
        <polygon points="${centerX + 100},${shoulderY + 40} ${centerX + 200},${shoulderY + 200} ${centerX + 150},${shoulderY + 250} ${centerX + 80},${shoulderY + 80}" fill="${this.darkenColor(outfitColor, 15)}" />
      </g>`;
  }

  /**
   * Generate face
   */
  generateFace(skinTone, expression, width, height) {
    const centerX = width / 2;
    const faceY = height * 0.35;

    return `
      <g id="face">
        <!-- Head -->
        <ellipse cx="${centerX}" cy="${faceY}" rx="180" ry="220" fill="url(#skinGradient)"/>

        <!-- Eyes -->
        <ellipse cx="${centerX - 50}" cy="${faceY - 20}" rx="15" ry="20" fill="white"/>
        <ellipse cx="${centerX + 50}" cy="${faceY - 20}" rx="15" ry="20" fill="white"/>
        <circle cx="${centerX - 50}" cy="${faceY - 15}" r="8" fill="#003366"/>
        <circle cx="${centerX + 50}" cy="${faceY - 15}" r="8" fill="#003366"/>

        <!-- Nose -->
        <path d="M ${centerX - 10},${faceY + 20} Q ${centerX},${faceY + 40} ${centerX + 10},${faceY + 20}" fill="none" stroke="${this.darkenColor(skinTone.color, 15)}" stroke-width="2"/>

        <!-- Mouth -->
        ${this.generateMouth(expression, centerX, faceY)}

        <!-- Eyebrows -->
        <path d="M ${centerX - 70},${faceY - 50} Q ${centerX - 50},${faceY - 60} ${centerX - 30},${faceY - 50}" fill="none" stroke="${this.darkenColor(skinTone.color, 30)}" stroke-width="4" stroke-linecap="round"/>
        <path d="M ${centerX + 70},${faceY - 50} Q ${centerX + 50},${faceY - 60} ${centerX + 30},${faceY - 50}" fill="none" stroke="${this.darkenColor(skinTone.color, 30)}" stroke-width="4" stroke-linecap="round"/>
      </g>`;
  }

  /**
   * Generate mouth based on expression
   */
  generateMouth(expression, centerX, faceY) {
    const mouthY = faceY + 60;

    if (expression.name.includes('Smile') || expression.name.includes('Winning')) {
      return `<path d="M ${centerX - 40},${mouthY} Q ${centerX},${mouthY + 20} ${centerX + 40},${mouthY}" fill="none" stroke="#8B4513" stroke-width="3" stroke-linecap="round"/>`;
    } else if (expression.name.includes('Serious')) {
      return `<line x1="${centerX - 40}" y1="${mouthY}" x2="${centerX + 40}" y2="${mouthY}" stroke="#8B4513" stroke-width="3" stroke-linecap="round"/>`;
    } else if (expression.name.includes('Smirk')) {
      return `<path d="M ${centerX - 40},${mouthY} Q ${centerX + 10},${mouthY + 15} ${centerX + 40},${mouthY - 5}" fill="none" stroke="#8B4513" stroke-width="3" stroke-linecap="round"/>`;
    }
    return `<path d="M ${centerX - 40},${mouthY} Q ${centerX},${mouthY + 10} ${centerX + 40},${mouthY}" fill="none" stroke="#8B4513" stroke-width="3" stroke-linecap="round"/>`;
  }

  /**
   * Generate hair
   */
  generateHair(hairStyle, width, height) {
    const centerX = width / 2;
    const hairY = height * 0.22;

    return `
      <g id="hair">
        <!-- Main Hair Mass -->
        <ellipse cx="${centerX}" cy="${hairY}" rx="200" ry="80" fill="url(#hairGradient)"/>

        <!-- Signature Swoop -->
        <path d="M ${centerX - 180},${hairY} Q ${centerX - 100},${hairY - 60} ${centerX + 50},${hairY - 40} Q ${centerX + 150},${hairY - 30} ${centerX + 180},${hairY + 10}"
              fill="url(#hairGradient)" opacity="0.9"/>

        <!-- Hair Texture Lines -->
        <path d="M ${centerX - 150},${hairY - 20} Q ${centerX - 80},${hairY - 50} ${centerX},${hairY - 35}"
              fill="none" stroke="${this.darkenColor(hairStyle.color, 20)}" stroke-width="2" opacity="0.6"/>
        <path d="M ${centerX - 100},${hairY - 10} Q ${centerX - 30},${hairY - 45} ${centerX + 40},${hairY - 30}"
              fill="none" stroke="${this.darkenColor(hairStyle.color, 20)}" stroke-width="2" opacity="0.6"/>

        ${hairStyle.name.includes('Wind') ? `
          <!-- Wind Blown Effect -->
          <path d="M ${centerX + 180},${hairY + 10} Q ${centerX + 250},${hairY - 20} ${centerX + 280},${hairY + 30}"
                fill="url(#hairGradient)" opacity="0.8"/>
        ` : ''}
      </g>`;
  }

  /**
   * Generate accessory
   */
  generateAccessory(accessory, width, height) {
    const centerX = width / 2;

    if (accessory.name.includes('MAGA Hat')) {
      return `
        <g id="accessory">
          <ellipse cx="${centerX}" cy="${height * 0.15}" rx="180" ry="30" fill="${accessory.color || '#FF0000'}"/>
          <path d="M ${centerX - 200},${height * 0.15} Q ${centerX},${height * 0.12} ${centerX + 200},${height * 0.15}"
                fill="${accessory.color || '#FF0000'}"/>
          <text x="${centerX}" y="${height * 0.16}" font-family="Arial, sans-serif" font-size="24" font-weight="bold"
                fill="white" text-anchor="middle">MAGA</text>
        </g>`;
    } else if (accessory.name.includes('Sunglasses')) {
      const eyeY = height * 0.33;
      return `
        <g id="accessory">
          <rect x="${centerX - 90}" y="${eyeY - 20}" width="70" height="40" rx="10" fill="#000000" opacity="0.8"/>
          <rect x="${centerX + 20}" y="${eyeY - 20}" width="70" height="40" rx="10" fill="#000000" opacity="0.8"/>
          <line x1="${centerX - 20}" y1="${eyeY}" x2="${centerX + 20}" y2="${eyeY}" stroke="#000000" stroke-width="3"/>
        </g>`;
    } else if (accessory.name.includes('Gold') || accessory.name.includes('Watch') || accessory.name.includes('Chain')) {
      return `
        <g id="accessory">
          <circle cx="${width * 0.25}" cy="${height * 0.65}" r="25" fill="url(#goldGradient)" opacity="0.9"/>
          <text x="${width * 0.25}" y="${height * 0.67}" font-family="Arial, sans-serif" font-size="16" font-weight="bold"
                fill="#8B4513" text-anchor="middle">$</text>
        </g>`;
    } else if (accessory.name.includes('Bitcoin')) {
      return `
        <g id="accessory">
          <circle cx="${width * 0.8}" cy="${height * 0.3}" r="40" fill="#FF9900"/>
          <text x="${width * 0.8}" y="${height * 0.32}" font-family="Arial, sans-serif" font-size="40" font-weight="bold"
                fill="white" text-anchor="middle">₿</text>
        </g>`;
    } else if (accessory.name.includes('Laser Eyes')) {
      const eyeY = height * 0.33;
      return `
        <g id="accessory">
          <line x1="${centerX - 50}" y1="${eyeY - 15}" x2="${centerX - 250}" y2="${eyeY - 100}"
                stroke="#FF0000" stroke-width="8" opacity="0.8"/>
          <line x1="${centerX + 50}" y1="${eyeY - 15}" x2="${centerX + 250}" y2="${eyeY - 100}"
                stroke="#FF0000" stroke-width="8" opacity="0.8"/>
          <circle cx="${centerX - 50}" cy="${eyeY - 15}" r="12" fill="#FF0000" opacity="0.9"/>
          <circle cx="${centerX + 50}" cy="${eyeY - 15}" r="12" fill="#FF0000" opacity="0.9"/>
        </g>`;
    }

    return `<g id="accessory"><!-- ${accessory.name} --></g>`;
  }

  /**
   * Generate special effect
   */
  generateSpecialEffect(effect, width, height) {
    if (effect.name.includes('Glow') || effect.name.includes('Shimmer')) {
      return `
        <g id="specialEffect" opacity="0.3">
          <circle cx="${width/2}" cy="${height/2}" r="450" fill="none" stroke="${effect.color || '#FFD700'}" stroke-width="5"/>
          <circle cx="${width/2}" cy="${height/2}" r="480" fill="none" stroke="${effect.color || '#FFD700'}" stroke-width="3"/>
        </g>`;
    } else if (effect.name.includes('Fire')) {
      return `
        <g id="specialEffect" opacity="0.4">
          ${Array.from({length: 20}, (_, i) => {
            const x = Math.random() * width;
            const y = height - Math.random() * 200;
            return `<circle cx="${x}" cy="${y}" r="${5 + Math.random() * 10}" fill="#FF4500"/>`;
          }).join('')}
        </g>`;
    } else if (effect.name.includes('Lightning')) {
      return `
        <g id="specialEffect" opacity="0.6">
          <path d="M ${width * 0.2},0 L ${width * 0.25},${height * 0.3} L ${width * 0.22},${height * 0.3} L ${width * 0.27},${height * 0.7}"
                fill="#FFFF00" stroke="#FFD700" stroke-width="2"/>
        </g>`;
    }
    return `<g id="specialEffect"><!-- ${effect.name} --></g>`;
  }

  /**
   * Utility: Darken color
   */
  darkenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255))
      .toString(16).slice(1);
  }

  /**
   * Generate all artwork
   */
  async generateAll(count = 10000) {
    console.log(`🎨 Starting CryptoTrump Artwork Generation...`);
    console.log(`📊 Generating ${count} unique Trumps\n`);

    const startTime = Date.now();
    const artworkData = [];

    for (let i = 0; i < count; i++) {
      const tokenId = i;
      const { traits, hash, special, specialName } = this.generateTraits(tokenId);
      const rarityScore = this.calculateRarityScore(traits);
      const rarityTier = this.getRarityTier(tokenId);

      // Generate SVG
      const svg = this.generateSVG(tokenId, traits, specialName);

      // Save SVG file
      const filename = `${tokenId}.svg`;
      const filepath = path.join(this.artworkDir, filename);
      fs.writeFileSync(filepath, svg);

      // Store artwork data for metadata generation
      artworkData.push({
        tokenId,
        traits: Object.fromEntries(
          Object.entries(traits).map(([key, value]) => [key, value.name])
        ),
        rarityScore,
        rarityTier,
        hash,
        special,
        specialName,
      });

      // Progress indicator
      if ((i + 1) % 100 === 0) {
        const progress = ((i + 1) / count * 100).toFixed(1);
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`✅ Generated ${i + 1}/${count} (${progress}%) - ${elapsed}s elapsed`);
      }
    }

    // Save artwork data for metadata generation
    const dataPath = path.join(__dirname, '../../artwork/artwork-data.json');
    fs.writeFileSync(dataPath, JSON.stringify(artworkData, null, 2));

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n🎉 Artwork generation complete!`);
    console.log(`⏱️  Total time: ${totalTime}s`);
    console.log(`📁 Images saved to: ${this.artworkDir}`);
    console.log(`💾 Artwork data saved to: ${dataPath}`);
    console.log(`🎨 Unique combinations: ${this.generatedCombinations.size}`);

    return artworkData;
  }
}

// Main execution
if (require.main === module) {
  const generator = new TrumpArtworkGenerator();
  generator.generateAll().catch(console.error);
}

module.exports = TrumpArtworkGenerator;
