/**
 * CryptoTrump IPFS Upload Preparation Script
 * Prepares artwork and metadata for IPFS upload
 * Supports multiple IPFS services: Pinata, NFT.Storage, Web3.Storage
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class IPFSPreparation {
  constructor() {
    this.artworkDir = path.join(__dirname, '../../artwork/images');
    this.metadataDir = path.join(__dirname, '../../artwork/metadata');
    this.outputDir = path.join(__dirname, '../../artwork/ipfs-ready');
  }

  /**
   * Prepare files for IPFS upload
   */
  async prepare() {
    console.log(`📦 Preparing CryptoTrump files for IPFS upload...\n`);

    // Create output directory
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    // Create subdirectories
    const imagesDir = path.join(this.outputDir, 'images');
    const metadataDir = path.join(this.outputDir, 'metadata');

    fs.mkdirSync(imagesDir, { recursive: true });
    fs.mkdirSync(metadataDir, { recursive: true });

    // Copy and verify images
    console.log(`📸 Processing images...`);
    const imageStats = await this.processImages(imagesDir);

    // Copy and verify metadata
    console.log(`📝 Processing metadata...`);
    const metadataStats = await this.processMetadata(metadataDir);

    // Generate manifest
    console.log(`📋 Generating manifest...`);
    const manifest = this.generateManifest(imageStats, metadataStats);

    // Generate upload instructions
    console.log(`📖 Generating upload instructions...`);
    this.generateInstructions();

    console.log(`\n✅ IPFS preparation complete!`);
    console.log(`📁 Files ready in: ${this.outputDir}`);
    console.log(`📊 Images: ${imageStats.count}`);
    console.log(`📊 Metadata: ${metadataStats.count}`);
    console.log(`💾 Total size: ${this.formatBytes(imageStats.totalSize + metadataStats.totalSize)}`);

    return manifest;
  }

  /**
   * Process and copy images
   */
  async processImages(outputDir) {
    const files = fs.readdirSync(this.artworkDir).filter(f => f.endsWith('.svg'));
    let totalSize = 0;
    const hashes = [];

    for (const file of files) {
      const sourcePath = path.join(this.artworkDir, file);
      const destPath = path.join(outputDir, file);

      // Copy file
      fs.copyFileSync(sourcePath, destPath);

      // Calculate hash and size
      const content = fs.readFileSync(sourcePath);
      const hash = crypto.createHash('sha256').update(content).digest('hex');
      const size = content.length;

      totalSize += size;
      hashes.push({ file, hash, size });
    }

    return { count: files.length, totalSize, hashes };
  }

  /**
   * Process and copy metadata
   */
  async processMetadata(outputDir) {
    const files = fs.readdirSync(this.metadataDir).filter(f => f.endsWith('.json'));
    let totalSize = 0;
    const hashes = [];

    for (const file of files) {
      const sourcePath = path.join(this.metadataDir, file);
      const destPath = path.join(outputDir, file);

      // Copy file
      fs.copyFileSync(sourcePath, destPath);

      // Calculate hash and size
      const content = fs.readFileSync(sourcePath);
      const hash = crypto.createHash('sha256').update(content).digest('hex');
      const size = content.length;

      totalSize += size;
      hashes.push({ file, hash, size });
    }

    return { count: files.length, totalSize, hashes };
  }

  /**
   * Generate manifest file
   */
  generateManifest(imageStats, metadataStats) {
    const manifest = {
      project: 'CryptoTrump',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      images: {
        count: imageStats.count,
        totalSize: imageStats.totalSize,
        format: 'SVG',
        files: imageStats.hashes,
      },
      metadata: {
        count: metadataStats.count,
        totalSize: metadataStats.totalSize,
        format: 'JSON',
        files: metadataStats.hashes,
      },
      ipfs: {
        uploadRequired: true,
        imagesUploaded: false,
        metadataUploaded: false,
        imagesCID: null,
        metadataCID: null,
      },
    };

    const manifestPath = path.join(this.outputDir, 'manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

    console.log(`✅ Manifest generated: ${manifestPath}`);
    return manifest;
  }

  /**
   * Generate upload instructions
   */
  generateInstructions() {
    const instructions = `# CryptoTrump IPFS Upload Instructions

## 📦 Files Prepared

Your CryptoTrump artwork and metadata are ready for IPFS upload!

Location: \`${this.outputDir}\`

## 🌐 IPFS Upload Options

### Option 1: Pinata (Recommended)

Pinata is a popular IPFS pinning service with a user-friendly interface.

1. **Sign up**: https://pinata.cloud
2. **Upload Images Folder**:
   - Go to "Files" → "Upload" → "Folder"
   - Select \`${path.join(this.outputDir, 'images')}\`
   - Wait for upload to complete
   - Copy the IPFS CID (starts with \`Qm...\` or \`bafy...\`)

3. **Upload Metadata Folder**:
   - Repeat the process for \`${path.join(this.outputDir, 'metadata')}\`
   - Copy the metadata CID

4. **Update Base URI**:
   - Images CID: \`ipfs://YOUR_IMAGES_CID/\`
   - Then re-run metadata generation with updated URI

### Option 2: NFT.Storage

NFT.Storage provides free IPFS storage for NFTs.

1. **Sign up**: https://nft.storage
2. **Get API Key**: Account → API Keys → New Key
3. **Upload via CLI**:
   \`\`\`bash
   npm install -g @nft-storage/cli
   nft-storage upload ${path.join(this.outputDir, 'images')}
   nft-storage upload ${path.join(this.outputDir, 'metadata')}
   \`\`\`

### Option 3: Web3.Storage

1. **Sign up**: https://web3.storage
2. **Upload Files**:
   - Use web interface or CLI
   - Upload images and metadata folders
   - Get CIDs for both

### Option 4: Local IPFS Node

If you're running a local IPFS node:

\`\`\`bash
# Add images
ipfs add -r ${path.join(this.outputDir, 'images')}

# Add metadata
ipfs add -r ${path.join(this.outputDir, 'metadata')}

# Pin the CIDs
ipfs pin add YOUR_IMAGES_CID
ipfs pin add YOUR_METADATA_CID
\`\`\`

## 📝 After Upload

### 1. Update Metadata with Image CIDs

Once images are uploaded, update the metadata:

\`\`\`bash
# Edit the metadata generator to use your images CID
# Then regenerate metadata
node scripts/artwork/generateMetadata.js
\`\`\`

### 2. Update Smart Contract

Update your contract with the base URI:

\`\`\`javascript
// In your deployment or after deployment
await contract.setBaseURI("ipfs://YOUR_METADATA_CID/");
\`\`\`

### 3. Verify IPFS Links

Test that your metadata and images are accessible:

- Via IPFS Gateway: \`https://ipfs.io/ipfs/YOUR_CID/0.json\`
- Via Pinata Gateway: \`https://gateway.pinata.cloud/ipfs/YOUR_CID/0.json\`
- Via Cloudflare: \`https://cloudflare-ipfs.com/ipfs/YOUR_CID/0.json\`

## 🔐 Best Practices

1. **Pin on Multiple Services**: Use 2-3 pinning services for redundancy
2. **Keep Records**: Save all CIDs in a secure location
3. **Test Before Deployment**: Verify random metadata files load correctly
4. **Backup**: Keep local copies of all files
5. **Monitor Pinning**: Regularly check that files remain pinned

## 📊 Checklist

- [ ] Upload images to IPFS
- [ ] Save images CID
- [ ] Update metadata generator with images CID
- [ ] Regenerate metadata files
- [ ] Upload metadata to IPFS
- [ ] Save metadata CID
- [ ] Update smart contract base URI
- [ ] Verify random samples load correctly
- [ ] Pin on backup service
- [ ] Document all CIDs securely

## 💡 Tips

- Uploading 10,000 files may take time (30-60 minutes)
- Ensure stable internet connection
- Some services have rate limits - be patient
- CIDs are permanent - verify everything before finalizing
- Consider using a custom subdomain for easier access

## 🆘 Support

If you encounter issues:
- Check service status pages
- Verify file formats are correct
- Ensure folder structure is maintained
- Try a different IPFS gateway
- Contact the pinning service support

---

**Generated**: ${new Date().toISOString()}
**Project**: CryptoTrump
**Version**: 1.0.0

🇺🇸 Make NFTs Great Again! 🇺🇸
`;

    const instructionsPath = path.join(this.outputDir, 'UPLOAD_INSTRUCTIONS.md');
    fs.writeFileSync(instructionsPath, instructions);

    console.log(`📖 Instructions saved: ${instructionsPath}`);
  }

  /**
   * Format bytes to human readable
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Create a sample test upload (first 10 Trumps)
   */
  createTestUpload() {
    console.log(`🧪 Creating test upload sample (first 10 Trumps)...`);

    const testDir = path.join(this.outputDir, 'test-sample');
    const testImagesDir = path.join(testDir, 'images');
    const testMetadataDir = path.join(testDir, 'metadata');

    fs.mkdirSync(testImagesDir, { recursive: true });
    fs.mkdirSync(testMetadataDir, { recursive: true });

    // Copy first 10 images and metadata
    for (let i = 0; i < 10; i++) {
      const imageSrc = path.join(this.artworkDir, `${i}.svg`);
      const imageDest = path.join(testImagesDir, `${i}.svg`);
      if (fs.existsSync(imageSrc)) {
        fs.copyFileSync(imageSrc, imageDest);
      }

      const metaSrc = path.join(this.metadataDir, `${i}.json`);
      const metaDest = path.join(testMetadataDir, `${i}.json`);
      if (fs.existsSync(metaSrc)) {
        fs.copyFileSync(metaSrc, metaDest);
      }
    }

    console.log(`✅ Test sample created: ${testDir}`);
    console.log(`💡 Use this to test your IPFS upload process before uploading all 10,000`);
  }
}

// Main execution
if (require.main === module) {
  const prep = new IPFSPreparation();
  prep.prepare()
    .then(() => prep.createTestUpload())
    .catch(console.error);
}

module.exports = IPFSPreparation;
