# 🚀 CryptoTrump Quick Start Guide

Get up and running with CryptoTrump development in minutes!

---

## 📦 Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm** or **yarn**
- **Git**
- **Ethereum wallet** with testnet ETH

---

## ⚡ Quick Installation

```bash
# Clone the repository
git clone https://github.com/mrheyday/cryptoTrump.git
cd cryptoTrump

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

---

## 🔧 Configure Environment

Edit `.env` and add your configuration:

```bash
# Minimum required for local development
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
ETHERSCAN_API_KEY=your_etherscan_api_key
```

**Get Free API Keys:**
- Alchemy RPC: https://www.alchemy.com/
- Etherscan: https://etherscan.io/myapikey

---

## 🧪 Run Tests

```bash
# Compile contracts
npx hardhat compile

# Run all tests
npx hardhat test

# Run specific test file
npx hardhat test test/CryptoTrumpMarketplace.test.js

# Run with gas reporting
REPORT_GAS=true npx hardhat test

# Run coverage
npx hardhat coverage
```

---

## 🚀 Local Development

### Start Local Blockchain

```bash
# Terminal 1: Start local node
npx hardhat node
```

### Deploy Locally

```bash
# Terminal 2: Deploy to local network
npx hardhat run scripts/deploy.js --network localhost
```

### Interact with Contract

```bash
# Open Hardhat console
npx hardhat console --network localhost

# In console:
const Trump = await ethers.getContractFactory("CryptoTrumpMarketplace")
const trump = await Trump.attach("DEPLOYED_ADDRESS")
await trump.name()
// "CryptoTrump"
```

---

## 🌐 Deploy to Testnet (Sepolia)

### Step 1: Get Testnet ETH

Get free Sepolia ETH from faucets:
- https://sepoliafaucet.com/
- https://www.alchemy.com/faucets/ethereum-sepolia

### Step 2: Deploy

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### Step 3: Verify

```bash
npx hardhat verify --network sepolia DEPLOYED_ADDRESS \
  LZ_ENDPOINT_ADDRESS \
  YOUR_WALLET_ADDRESS
```

### Step 4: Set Base URI (after IPFS upload)

```bash
# Edit scripts/setBaseURI.js with your metadata CID
npx hardhat run scripts/setBaseURI.js --network sepolia
```

---

## 🎨 NFT Media Workflow

### Generate Metadata

Metadata is already generated! Check `nft-media/metadata/`

```bash
# If you need to regenerate
cd nft-media
node scripts/generateMetadata.js
```

### Generate Images

See detailed guide: `nft-media/IMAGE-GENERATION-GUIDE.md`

**Quick summary:**
1. Use AI tools (Midjourney, DALL-E, Stable Diffusion)
2. Generate 10,000 images (1024x1024 PNG)
3. Name them: 0.png through 9999.png
4. Place in `nft-media/images/`

### Upload to IPFS

See detailed guide: `nft-media/IPFS-UPLOAD-GUIDE.md`

**Quick summary:**

```bash
cd nft-media

# 1. Upload images to IPFS (using Pinata, NFT.Storage, etc.)
# Get images CID

# 2. Update metadata with images CID
# Edit scripts/updateMetadataWithIPFS.js
node scripts/updateMetadataWithIPFS.js

# 3. Upload metadata to IPFS
# Get metadata CID

# 4. Verify IPFS upload
# Edit scripts/verifyIPFS.js with both CIDs
node scripts/verifyIPFS.js
```

---

## 🔍 Common Commands

### Compilation

```bash
# Compile contracts
npx hardhat compile

# Clean and recompile
npx hardhat clean && npx hardhat compile
```

### Testing

```bash
# All tests
npx hardhat test

# Specific test
npx hardhat test test/CryptoTrumpMarketplace.test.js

# With gas report
REPORT_GAS=true npx hardhat test

# Coverage
npx hardhat coverage
```

### Deployment

```bash
# Local
npx hardhat run scripts/deploy.js --network localhost

# Sepolia testnet
npx hardhat run scripts/deploy.js --network sepolia

# Ethereum mainnet (CAREFUL!)
npx hardhat run scripts/deploy.js --network ethereum
```

### Verification

```bash
# Verify on Etherscan
npx hardhat verify --network sepolia CONTRACT_ADDRESS \
  CONSTRUCTOR_ARG1 \
  CONSTRUCTOR_ARG2
```

### Network Info

```bash
# List available networks
npx hardhat run scripts/listNetworks.js

# Check balance
npx hardhat run scripts/checkBalance.js --network sepolia
```

---

## 📚 Project Structure

```
cryptotrump/
├── contracts/              # Solidity contracts
│   └── CryptoTrumpMarketplace.sol
├── test/                   # Test files
│   └── CryptoTrumpMarketplace.test.js
├── scripts/                # Deployment scripts
│   ├── deploy.js
│   └── setBaseURI.js
├── nft-media/             # NFT media generation
│   ├── traits/            # Trait definitions
│   ├── scripts/           # Media scripts
│   ├── metadata/          # 10,000 JSON files
│   └── images/            # Images (to be generated)
├── hardhat.config.js      # Hardhat configuration
├── package.json           # Dependencies
├── .env.example           # Environment template
└── README.md              # Documentation
```

---

## 🎯 Quick Tasks

### Task: Deploy and Test Locally

```bash
# 1. Install dependencies
npm install

# 2. Compile
npx hardhat compile

# 3. Test
npx hardhat test

# 4. Start local node (Terminal 1)
npx hardhat node

# 5. Deploy locally (Terminal 2)
npx hardhat run scripts/deploy.js --network localhost

# Done! Your contract is running locally
```

### Task: Deploy to Sepolia

```bash
# 1. Configure .env
cp .env.example .env
# Edit .env with your keys

# 2. Get testnet ETH
# Visit: https://sepoliafaucet.com/

# 3. Deploy
npx hardhat run scripts/deploy.js --network sepolia

# 4. Verify
npx hardhat verify --network sepolia YOUR_CONTRACT_ADDRESS \
  0x1a44076050125825900e736c501f859c50fE728c \
  YOUR_WALLET_ADDRESS

# Done! Check on Sepolia Etherscan
```

### Task: Generate NFT Metadata

```bash
# Already done! But to regenerate:
cd nft-media
node scripts/generateMetadata.js

# Output: 10,000 JSON files in metadata/
```

---

## 🔗 Useful Links

### Documentation
- Main README: [`README.md`](README.md)
- Deployment Checklist: [`DEPLOYMENT-CHECKLIST.md`](DEPLOYMENT-CHECKLIST.md)
- Image Generation: [`nft-media/IMAGE-GENERATION-GUIDE.md`](nft-media/IMAGE-GENERATION-GUIDE.md)
- IPFS Upload: [`nft-media/IPFS-UPLOAD-GUIDE.md`](nft-media/IPFS-UPLOAD-GUIDE.md)

### External Services
- **Alchemy** (RPC): https://www.alchemy.com/
- **Etherscan** (Verification): https://etherscan.io/
- **OpenSea** (Testnet): https://testnets.opensea.io/
- **Pinata** (IPFS): https://pinata.cloud/
- **NFT.Storage** (IPFS): https://nft.storage/

### Blockchain Resources
- **Hardhat Docs**: https://hardhat.org/docs
- **OpenZeppelin Docs**: https://docs.openzeppelin.com/
- **LayerZero Docs**: https://docs.layerzero.network/
- **Ethers.js Docs**: https://docs.ethers.org/v6/

---

## 🐛 Troubleshooting

### "Cannot find module @nomicfoundation/hardhat-toolbox"

```bash
npm install --save-dev @nomicfoundation/hardhat-toolbox
```

### "Error: Invalid project ID"

Check your `.env` file - make sure RPC URLs have valid API keys.

### "Error: insufficient funds"

Get testnet ETH from faucets:
- https://sepoliafaucet.com/
- https://www.alchemy.com/faucets/ethereum-sepolia

### "Contract verification failed"

Make sure you're passing the exact constructor arguments used during deployment:

```bash
npx hardhat verify --network sepolia CONTRACT_ADDRESS \
  "0x1a44076050125825900e736c501f859c50fE728c" \
  "YOUR_WALLET_ADDRESS"
```

### Tests failing

```bash
# Clean and rebuild
npx hardhat clean
npx hardhat compile
npx hardhat test
```

### Gas price too high

Edit `hardhat.config.js` and adjust gas settings:

```javascript
networks: {
  sepolia: {
    gasPrice: 20000000000, // 20 gwei
    // ...
  }
}
```

---

## 💡 Pro Tips

1. **Use Testnet First**: Always test on Sepolia before mainnet
2. **Save Gas**: Enable optimizer in `hardhat.config.js`
3. **Version Control**: Commit often, use meaningful commit messages
4. **Backup Keys**: Store private keys securely (hardware wallet for mainnet)
5. **Monitor Gas**: Use `REPORT_GAS=true` to track gas costs
6. **Test Coverage**: Aim for >95% test coverage
7. **Security Audit**: Get professional audit before mainnet
8. **Multi-Sig**: Use multi-sig wallet for mainnet ownership

---

## 🆘 Getting Help

- **Issues**: https://github.com/mrheyday/cryptoTrump/issues
- **Discussions**: https://github.com/mrheyday/cryptoTrump/discussions
- **Email**: support@cryptotrump.io (if configured)

---

## 🇺🇸 Make Development Great Again! 🇺🇸

You're ready to build the most tremendous NFT project!

---

**Created:** 2025-10-25  
**Version:** 1.0.0  
**Status:** Ready for use
