# 🌐 IPFS Upload Guide for CryptoTrump NFTs

Complete guide for uploading 10,000 Trump NFT images and metadata to IPFS.

---

## 📋 Overview

After generating your 10,000 Trump images, you need to upload them to IPFS (InterPlanetary File System) for permanent, decentralized storage.

**Current Status**:
- ✅ Metadata: 10,000 JSON files generated
- ❌ Images: Need to be generated (see IMAGE-GENERATION-GUIDE.md)
- ❌ IPFS Upload: Ready to upload after images are created
- ❌ Contract BaseURI: Needs to be set after IPFS upload

---

## 🎯 What You Need

### Files to Upload
```
nft-media/
├── images/           # 10,000 PNG files (0.png - 9999.png)
│   ├── 0.png
│   ├── 1.png
│   ├── ...
│   └── 9999.png
└── metadata/         # 10,000 JSON files (0.json - 9999.json)
    ├── 0.json
    ├── 1.json
    ├── ...
    └── 9999.json
```

### Total Size Estimate
- **Images**: ~500 MB - 5 GB (depending on quality)
- **Metadata**: ~50 MB
- **Total**: ~550 MB - 5.05 GB

---

## 🚀 IPFS Upload Options

### Option 1: Pinata (Recommended)

**Pros**: User-friendly, reliable, free tier available, dedicated gateway
**Cons**: Free tier has 1GB limit (upgrade needed for full collection)

#### Sign Up
1. Visit: https://pinata.cloud
2. Create free account
3. Upgrade to paid plan if needed ($20/month for 100GB)

#### Upload via Web Interface

**Step 1: Upload Images Folder**
```
1. Go to Pinata dashboard
2. Click "Upload" → "Folder"
3. Select the "images" folder
4. Wait for upload to complete
5. Copy the IPFS CID (Content Identifier)
   Example: QmX5ZJVCDsGJ7fKvXH3mF2vqW9YzK8PjL3nR4tMdN6hE7x
```

**Step 2: Upload Metadata Folder**
```
1. First, update all metadata files with the images IPFS CID
   (see "Update Metadata Script" below)
2. Upload the "metadata" folder to Pinata
3. Copy the metadata IPFS CID
   Example: QmY6AKWDtHJ8gLwXI4nG3wF3qZ9LkMrP5sO8uNfR7jF9y
```

#### Upload via Pinata API

```javascript
// uploadToPinata.js
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const PINATA_API_KEY = 'your_api_key_here';
const PINATA_SECRET_KEY = 'your_secret_key_here';

async function uploadFolderToPinata(folderPath, folderName) {
  const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

  const data = new FormData();

  // Add all files from folder
  const files = fs.readdirSync(folderPath);
  for (const file of files) {
    const filePath = path.join(folderPath, file);
    const fileStream = fs.createReadStream(filePath);
    data.append('file', fileStream, {
      filepath: `${folderName}/${file}`
    });
  }

  // Add metadata
  const metadata = JSON.stringify({
    name: folderName,
    keyvalues: {
      project: 'CryptoTrump',
      type: folderName
    }
  });
  data.append('pinataMetadata', metadata);

  const response = await axios.post(url, data, {
    maxBodyLength: 'Infinity',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
      'pinata_api_key': PINATA_API_KEY,
      'pinata_secret_api_key': PINATA_SECRET_KEY
    }
  });

  return response.data.IpfsHash;
}

async function main() {
  console.log('Uploading images to IPFS...');
  const imagesCID = await uploadFolderToPinata('./images', 'images');
  console.log('Images CID:', imagesCID);

  console.log('Uploading metadata to IPFS...');
  const metadataCID = await uploadFolderToPinata('./metadata', 'metadata');
  console.log('Metadata CID:', metadataCID);

  console.log('\nIPFS Upload Complete!');
  console.log('Images: ipfs://' + imagesCID);
  console.log('Metadata: ipfs://' + metadataCID);
}

main().catch(console.error);
```

### Option 2: NFT.Storage (Free & Unlimited)

**Pros**: Free, unlimited storage, built specifically for NFTs
**Cons**: Slower upload speeds for large collections

#### Sign Up
1. Visit: https://nft.storage
2. Create free account
3. Get API key from dashboard

#### Upload via NFT.Storage API

```javascript
// uploadToNFTStorage.js
const { NFTStorage, File } = require('nft.storage');
const fs = require('fs');
const path = require('path');

const NFT_STORAGE_KEY = 'your_api_key_here';
const client = new NFTStorage({ token: NFT_STORAGE_KEY });

async function uploadImages() {
  console.log('Reading images...');
  const imagesPath = './images';
  const files = [];

  for (let i = 0; i < 10000; i++) {
    const imagePath = path.join(imagesPath, `${i}.png`);
    const imageData = fs.readFileSync(imagePath);
    files.push(new File([imageData], `${i}.png`, { type: 'image/png' }));
  }

  console.log('Uploading to IPFS via NFT.Storage...');
  const cid = await client.storeDirectory(files);

  console.log('Images uploaded!');
  console.log('CID:', cid);
  console.log('URL: ipfs://' + cid);

  return cid;
}

async function uploadMetadata(imagesCID) {
  console.log('Updating metadata with images CID...');
  const metadataPath = './metadata';
  const files = [];

  for (let i = 0; i < 10000; i++) {
    const metaPath = path.join(metadataPath, `${i}.json`);
    let metadata = JSON.parse(fs.readFileSync(metaPath, 'utf8'));

    // Update image URL
    metadata.image = `ipfs://${imagesCID}/${i}.png`;

    const metaData = JSON.stringify(metadata, null, 2);
    files.push(new File([metaData], `${i}.json`, { type: 'application/json' }));
  }

  console.log('Uploading metadata to IPFS...');
  const cid = await client.storeDirectory(files);

  console.log('Metadata uploaded!');
  console.log('CID:', cid);
  console.log('URL: ipfs://' + cid);

  return cid;
}

async function main() {
  const imagesCID = await uploadImages();
  const metadataCID = await uploadMetadata(imagesCID);

  console.log('\n=== IPFS Upload Complete ===');
  console.log('Images CID:', imagesCID);
  console.log('Metadata CID:', metadataCID);
  console.log('\nSet contract baseURI to: ipfs://' + metadataCID + '/');
}

main().catch(console.error);
```

### Option 3: Web3.Storage (Free & Fast)

**Pros**: Free, fast, good for large collections
**Cons**: Requires some technical setup

```bash
# Install web3.storage CLI
npm install -g @web3-storage/w3cli

# Login
w3 login

# Upload images folder
w3 put images/ --name "CryptoTrump Images"

# Upload metadata folder (after updating with images CID)
w3 put metadata/ --name "CryptoTrump Metadata"
```

### Option 4: IPFS Desktop (Local Node)

**Pros**: Full control, truly decentralized
**Cons**: Slower, requires pinning service for permanence

1. Download IPFS Desktop: https://docs.ipfs.tech/install/ipfs-desktop/
2. Install and run
3. Add images folder via UI
4. Add metadata folder via UI
5. Pin to remote service (Pinata, Infura, etc.) for permanence

---

## 🔧 Update Metadata Script

After uploading images to IPFS, update all metadata files with the actual IPFS CID:

```javascript
// updateMetadataWithIPFS.js
const fs = require('fs');
const path = require('path');

// REPLACE THIS with your actual images IPFS CID
const IMAGES_IPFS_CID = 'QmYourActualImagesCIDHere';

function updateMetadata() {
  console.log('Updating metadata files with IPFS CID...');
  console.log('Images CID:', IMAGES_IPFS_CID);

  const metadataDir = './metadata';
  let updated = 0;

  for (let i = 0; i < 10000; i++) {
    const metadataPath = path.join(metadataDir, `${i}.json`);

    // Read metadata file
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

    // Update image URL
    metadata.image = `ipfs://${IMAGES_IPFS_CID}/${i}.png`;

    // Write updated metadata
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

    updated++;
    if (updated % 1000 === 0) {
      console.log(`Updated ${updated} files...`);
    }
  }

  console.log(`\nCompleted! Updated ${updated} metadata files.`);
  console.log('Now upload the metadata folder to IPFS.');
}

updateMetadata();
```

**Run it:**
```bash
cd nft-media
node updateMetadataWithIPFS.js
```

---

## 📊 Upload Workflow

### Complete Step-by-Step Process

**Step 1: Generate Images** (see IMAGE-GENERATION-GUIDE.md)
```bash
# Ensure you have all 10,000 images
ls images/*.png | wc -l  # Should output: 10000
```

**Step 2: Upload Images to IPFS**
```bash
# Using Pinata, NFT.Storage, or Web3.Storage
# Get the images IPFS CID
# Example: QmX5ZJVCDsGJ7fKvXH3mF2vqW9YzK8PjL3nR4tMdN6hE7x
```

**Step 3: Update Metadata Files**
```bash
# Edit updateMetadataWithIPFS.js with your images CID
# Run the script
node updateMetadataWithIPFS.js
```

**Step 4: Upload Metadata to IPFS**
```bash
# Upload the updated metadata folder
# Get the metadata IPFS CID
# Example: QmY6AKWDtHJ8gLwXI4nG3wF3qZ9LkMrP5sO8uNfR7jF9y
```

**Step 5: Verify Upload**
```bash
# Test access via IPFS gateways
# Images:
curl https://ipfs.io/ipfs/YOUR_IMAGES_CID/0.png
curl https://gateway.pinata.cloud/ipfs/YOUR_IMAGES_CID/0.png

# Metadata:
curl https://ipfs.io/ipfs/YOUR_METADATA_CID/0.json
curl https://gateway.pinata.cloud/ipfs/YOUR_METADATA_CID/0.json
```

**Step 6: Set Contract BaseURI**
```javascript
// setBaseURI.js
const { ethers } = require('hardhat');

async function main() {
  const METADATA_CID = 'QmYourMetadataCIDHere';
  const BASE_URI = `ipfs://${METADATA_CID}/`;

  const CryptoTrump = await ethers.getContractFactory('CryptoTrumpMarketplace');
  const cryptoTrump = CryptoTrump.attach('YOUR_DEPLOYED_CONTRACT_ADDRESS');

  console.log('Setting base URI to:', BASE_URI);
  const tx = await cryptoTrump.setBaseURI(BASE_URI);
  await tx.wait();

  console.log('Base URI set successfully!');
  console.log('Transaction:', tx.hash);

  // Test token URI
  const tokenURI = await cryptoTrump.tokenURI(0);
  console.log('Token 0 URI:', tokenURI);
}

main().catch(console.error);
```

**Run it:**
```bash
npx hardhat run scripts/setBaseURI.js --network sepolia
```

---

## 🔍 Verification Checklist

Before finalizing, verify everything works:

- [ ] All 10,000 images uploaded to IPFS
- [ ] Images accessible via multiple IPFS gateways
- [ ] All 10,000 metadata files updated with correct image URLs
- [ ] All metadata files uploaded to IPFS
- [ ] Metadata accessible via multiple IPFS gateways
- [ ] Random sample check (10-20 NFTs):
  - [ ] Image loads correctly
  - [ ] Metadata loads correctly
  - [ ] Image URL in metadata matches actual image
  - [ ] All traits display properly
- [ ] Contract baseURI set to metadata IPFS CID
- [ ] TokenURI returns correct metadata URL
- [ ] Test NFT on OpenSea testnet

---

## 🌐 IPFS Gateways

Use multiple gateways for redundancy:

```
Primary:
- https://ipfs.io/ipfs/YOUR_CID
- https://gateway.pinata.cloud/ipfs/YOUR_CID
- https://cloudflare-ipfs.com/ipfs/YOUR_CID

Alternative:
- https://w3s.link/ipfs/YOUR_CID
- https://dweb.link/ipfs/YOUR_CID
- https://nftstorage.link/ipfs/YOUR_CID
```

---

## 💰 Cost Comparison

| Service | Free Tier | Paid Plans | Best For |
|---------|-----------|------------|----------|
| **Pinata** | 1 GB | $20/mo (100GB) | Production, reliability |
| **NFT.Storage** | Unlimited | Free forever | NFT projects, free |
| **Web3.Storage** | 5 GB | Free (open beta) | Large collections |
| **Infura** | 5 GB | $50/mo (100GB) | Enterprise |

**Recommendation for CryptoTrump**:
- **Development**: NFT.Storage (free, unlimited)
- **Production**: Pinata ($20/mo) + NFT.Storage backup

---

## 🛠️ Troubleshooting

### Upload Fails
```bash
# If upload times out, try smaller batches
# Split into 10 batches of 1,000 files each

# Batch upload script
for i in {0..9}; do
  start=$((i * 1000))
  end=$(((i + 1) * 1000 - 1))
  mkdir -p batch_$i
  for j in $(seq $start $end); do
    cp images/$j.png batch_$i/
  done
  # Upload batch_$i
done
```

### Gateway Not Responding
```bash
# Try different gateway
# Wait 5-10 minutes for propagation
# Check IPFS network status: https://status.ipfs.io/
```

### Metadata Not Updating on OpenSea
```bash
# Force refresh metadata on OpenSea
# Go to: https://opensea.io/assets/YOUR_CONTRACT/TOKEN_ID
# Click "..." menu → "Refresh metadata"

# Or use OpenSea API
curl -X POST "https://api.opensea.io/api/v1/asset/YOUR_CONTRACT/TOKEN_ID/?force_update=true"
```

---

## 📝 Example Final URLs

After complete upload, your NFTs will have these URLs:

```
Token #0:
- Contract: 0xYourContractAddress
- Token URI: ipfs://QmMetadataCID/0.json
- Metadata: https://ipfs.io/ipfs/QmMetadataCID/0.json
- Image: ipfs://QmImagesCID/0.png
- Image Gateway: https://gateway.pinata.cloud/ipfs/QmImagesCID/0.png

OpenSea URL:
https://opensea.io/assets/ethereum/YOUR_CONTRACT/0
```

---

## 🎯 Best Practices

1. **Always Keep Local Backups**
   ```bash
   # Create archive of all files
   tar -czf cryptotrump-nft-backup.tar.gz images/ metadata/
   ```

2. **Use Multiple Pinning Services**
   - Primary: Pinata
   - Backup: NFT.Storage
   - This ensures permanence even if one service fails

3. **Test Before Mainnet**
   - Upload to IPFS
   - Deploy contract to testnet
   - Set baseURI on testnet
   - View NFTs on OpenSea testnet
   - Verify everything works perfectly
   - Then deploy to mainnet

4. **Document Your CIDs**
   ```json
   {
     "project": "CryptoTrump",
     "date": "2025-10-25",
     "images_cid": "QmX5ZJVCDsGJ7fKvXH3mF2vqW9YzK8PjL3nR4tMdN6hE7x",
     "metadata_cid": "QmY6AKWDtHJ8gLwXI4nG3wF3qZ9LkMrP5sO8uNfR7jF9y",
     "contract_address": "0xYourContractAddress",
     "network": "ethereum",
     "base_uri": "ipfs://QmY6AKWDtHJ8gLwXI4nG3wF3qZ9LkMrP5sO8uNfR7jF9y/"
   }
   ```

---

## 🚀 Next Steps After IPFS Upload

1. **Set Contract BaseURI** - Point contract to IPFS metadata
2. **Deploy to Testnet** - Test full functionality
3. **Verify on OpenSea Testnet** - Check visual display
4. **Security Audit** - Professional review before mainnet
5. **Deploy to Mainnet** - Production launch
6. **Initial Distribution** - Assign Trumps to initial owners
7. **Public Launch** - Enable public claiming

---

## 🇺🇸 Make Storage Great Again! 🇺🇸

Your Trumps will live forever on IPFS - the most tremendous, decentralized storage!

---

**Created**: 2025-10-25
**Status**: Ready to Upload
**Next**: Generate images, then follow this guide!
