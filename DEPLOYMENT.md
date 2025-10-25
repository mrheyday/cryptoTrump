# 🚀 CryptoTrump Deployment Guide

**Complete Step-by-Step Deployment Instructions**

---

## 📋 Prerequisites

### Required Accounts & Services

1. **Ethereum Node Provider**
   - [ ] Alchemy account (https://alchemy.com)
   - [ ] Or Infura account (https://infura.io)
   - Get API key for Sepolia testnet and Ethereum mainnet

2. **IPFS Storage**
   - [ ] Pinata account (https://pinata.cloud) - Recommended
   - [ ] Or NFT.Storage (https://nft.storage)
   - Get API key

3. **Block Explorer**
   - [ ] Etherscan account (https://etherscan.io)
   - Get API key for contract verification

4. **Wallet**
   - [ ] Metamask or similar wallet
   - [ ] Private key for deployment (NEVER commit to git!)
   - [ ] Sufficient ETH for gas (testnet: use faucet, mainnet: ~0.5-1 ETH)

### Environment Setup

```bash
# Clone repository (if not already)
git clone <your-repo-url>
cd cryptoTrump

# Install dependencies
npm install --legacy-peer-deps

# Create .env file
cp .env.example .env
```

---

## 🔧 Configuration

### 1. Environment Variables (.env)

Create `.env` file in project root:

```bash
# Network RPC URLs
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY

# Deployment Wallet
PRIVATE_KEY=your_private_key_here_without_0x_prefix

# Block Explorer API (for verification)
ETHERSCAN_API_KEY=your_etherscan_api_key

# IPFS (Pinata)
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key

# Contract Addresses (will fill after deployment)
MARKETPLACE_ADDRESS=
MAGA_TOKEN_ADDRESS=
MERGE_CONTRACT_ADDRESS=
```

### 2. Hardhat Config

Verify `hardhat.config.js` has correct networks:

```javascript
networks: {
  sepolia: {
    url: process.env.SEPOLIA_RPC_URL,
    accounts: [process.env.PRIVATE_KEY],
    chainId: 11155111,
  },
  ethereum: {
    url: process.env.MAINNET_RPC_URL,
    accounts: [process.env.PRIVATE_KEY],
    chainId: 1,
  },
}
```

---

## 🧪 Phase 1: Testing (Local)

### Run All Tests

```bash
# Ensure all tests pass
npm test

# Check coverage
npm run coverage

# Expected result: 150+ tests passing, >90% coverage
```

**⚠️ CRITICAL:** All tests MUST pass before proceeding.

### Gas Report

```bash
# Check gas costs
npm run test:gas

# Review gas usage for:
# - mergeTrumps()
# - burnTrumpForMAGA()
# - mintFromBurn()
# - Marketplace operations
```

---

## 📤 Phase 2: IPFS Upload

### Prepare Artwork

```bash
# Verify artwork is ready
ls -la artwork/images/*.svg | wc -l
# Should show: 10000

ls -la artwork/metadata/*.json | wc -l
# Should show: 10000
```

### Upload to IPFS

#### Option A: Pinata (Recommended)

```bash
# Install Pinata CLI
npm install -g @pinata/sdk

# Create upload script
node scripts/uploadToPinata.js
```

**Or manually:**

1. Go to https://app.pinata.cloud
2. Upload `artwork/images/` folder
3. Get CID (e.g., `QmXXXXX...`)
4. Note it as `IMAGES_CID`
5. Update all metadata files:
   ```bash
   # Replace YOUR_IPFS_HASH with actual CID
   find artwork/metadata -name "*.json" -exec sed -i 's/YOUR_IPFS_HASH/QmXXXXX/g' {} +
   ```
6. Upload `artwork/metadata/` folder
7. Get CID (e.g., `QmYYYYY...`)
8. Note it as `METADATA_CID`

#### Option B: NFT.Storage

```bash
# Upload via NFT.Storage API
curl -X POST https://api.nft.storage/upload \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F "file=@artwork/images.zip"
```

### Verify IPFS Upload

```bash
# Test IPFS URLs (replace with your CIDs)
curl https://gateway.pinata.cloud/ipfs/QmYYYYY/0.json
curl https://gateway.pinata.cloud/ipfs/QmXXXXX/0.svg

# Should return valid JSON and SVG
```

**Save these for later:**
- `IMAGES_CID`: QmXXXXX...
- `METADATA_CID`: QmYYYYY...

---

## 🧪 Phase 3: Testnet Deployment (Sepolia)

### Get Testnet ETH

```bash
# Sepolia Faucet
# https://sepoliafaucet.com
# https://faucet.quicknode.com/ethereum/sepolia

# Check balance
npx hardhat run scripts/checkBalance.js --network sepolia
# Need at least: 0.5 ETH
```

### Deploy Contracts

```bash
# Deploy full ecosystem
npx hardhat run scripts/deployWithMerge.js --network sepolia

# Save output addresses:
# CryptoTrumpMarketplace: 0x...
# MAGAToken: 0x...
# CryptoTrumpMerge: 0x...
```

**Expected Output:**
```
✅ CryptoTrumpMarketplace deployed to: 0xABC...
✅ MAGAToken deployed to: 0xDEF...
✅ CryptoTrumpMerge deployed to: 0xGHI...
✅ Integration complete!
```

### Update .env

Add deployed addresses to `.env`:
```bash
MARKETPLACE_ADDRESS=0xABC...
MAGA_TOKEN_ADDRESS=0xDEF...
MERGE_CONTRACT_ADDRESS=0xGHI...
```

### Set Base URI

```bash
# Set metadata base URI
npx hardhat run scripts/setBaseURI.js --network sepolia

# Pass METADATA_CID from IPFS upload
# Result: ipfs://QmYYYYY/
```

### Populate Rarity Tiers

```bash
# Update MARKETPLACE_ADDRESS in scripts/populateRarityTiers.js
# Then run:
npx hardhat run scripts/populateRarityTiers.js --network sepolia

# This will take 10-15 minutes (100 batches)
# Expected: 100 successful batches
```

### Verify Contracts

```bash
# CryptoTrumpMarketplace
npx hardhat verify --network sepolia \
  0xABC... \
  "0xLZ_ENDPOINT" \
  "0xYOUR_ADDRESS"

# MAGAToken
npx hardhat verify --network sepolia \
  0xDEF... \
  "0xABC..."

# CryptoTrumpMerge
npx hardhat verify --network sepolia \
  0xGHI... \
  "0xABC..." \
  "0xDEF..."
```

---

## 🧪 Phase 4: Testnet Testing

### Test Checklist

#### Basic NFT Operations
```bash
# Mint a Trump
npx hardhat run scripts/test/mintTrump.js --network sepolia

# Check on OpenSea Testnet
https://testnets.opensea.io/assets/sepolia/0xABC.../0

# List for sale
# Buy from another wallet
# Place bid
```

#### Merge System
```bash
# Mint 2 Trumps
# Merge them
npx hardhat run scripts/test/testMerge.js --network sepolia

# Verify:
# - Power increased
# - One Trump burned
# - Cooldown active
# - Events emitted
```

#### MAGA Token
```bash
# Burn Trump for MAGA
npx hardhat run scripts/test/testBurnForMAGA.js --network sepolia

# Verify:
# - MAGA tokens received
# - Trump burned
# - Correct reward calculation
```

#### Cooldown Reduction
```bash
# Reduce cooldown with MAGA
npx hardhat run scripts/test/testCooldown.js --network sepolia

# Verify:
# - MAGA tokens spent
# - Cooldown reduced by 1 day
```

#### Alpha Trump
```bash
# Create high-power Trump
# Check Alpha status
npx hardhat run scripts/test/testAlpha.js --network sepolia

# Verify:
# - Alpha Trump ID updated
# - Event emitted
```

### Marketplace Testing

- [ ] List Trump for sale
- [ ] Buy Trump
- [ ] Place bid
- [ ] Accept bid
- [ ] Withdraw bid
- [ ] Verify 3% royalty paid
- [ ] Check custom messages
- [ ] Test pause functionality

### Duration: 1-2 weeks minimum

**Document all issues found!**

---

## 🔒 Phase 5: Security Audit

### Self Audit

Review checklist:
- [ ] Access control on all admin functions
- [ ] ReentrancyGuard on all state-changing functions
- [ ] Integer overflow protection (Solidity 0.8+)
- [ ] Proper error handling
- [ ] Event emission
- [ ] Gas optimization
- [ ] Edge cases tested

### Professional Audit

**Recommended Firms:**

1. **OpenZeppelin** (https://openzeppelin.com/security-audits/)
   - Cost: $30k-$50k
   - Duration: 2-4 weeks
   - Reputation: Excellent

2. **CertiK** (https://certik.com)
   - Cost: $25k-$45k
   - Duration: 2-3 weeks
   - Reputation: Excellent

3. **Trail of Bits** (https://www.trailofbits.com)
   - Cost: $40k-$60k
   - Duration: 3-4 weeks
   - Reputation: Excellent

**Process:**
1. Request quote
2. Provide contracts + documentation
3. Wait for audit (2-4 weeks)
4. Fix issues found
5. Get final report
6. Publish audit report

**⚠️ CRITICAL: Do NOT deploy to mainnet without audit!**

---

## 🚀 Phase 6: Mainnet Deployment

### Pre-Deployment Checklist

- [ ] All tests passing (100%)
- [ ] Security audit complete and issues fixed
- [ ] Testnet testing successful (2+ weeks)
- [ ] IPFS metadata uploaded and verified
- [ ] Deployment wallet has sufficient ETH (1-2 ETH)
- [ ] All configuration variables set
- [ ] Deployment plan reviewed
- [ ] Emergency response plan ready
- [ ] Multisig wallet ready for ownership transfer

### Deploy to Mainnet

```bash
# FINAL CHECK - Review everything!
git status
git log -5
cat .env

# Deploy
npx hardhat run scripts/deployWithMerge.js --network ethereum

# IMMEDIATELY save output addresses!
# Write them down on paper as backup!
```

### Post-Deployment Steps

```bash
# 1. Set Base URI
npx hardhat run scripts/setBaseURI.js --network ethereum

# 2. Populate Rarity Tiers
npx hardhat run scripts/populateRarityTiers.js --network ethereum

# 3. Verify Contracts
npx hardhat verify --network ethereum <addresses>

# 4. Transfer Ownership to Multisig
npx hardhat run scripts/transferOwnership.js --network ethereum
# MULTISIG_ADDRESS=0x...

# 5. Test basic operations
# Mint one Trump
# Verify on OpenSea
# Test merge (with test Trumps)
```

### Verify Deployment

**On Etherscan:**
- [ ] Contract verified (green checkmark)
- [ ] Source code visible
- [ ] Proxy readable
- [ ] Owner = multisig address

**On OpenSea:**
- [ ] Collection visible
- [ ] Metadata displaying correctly
- [ ] Traits filtering working
- [ ] Images loading
- [ ] Royalty set to 3%

---

## 🎨 Phase 7: Marketplace Listing

### OpenSea

```bash
# Automatic discovery (24-48 hours)
# Just mint first Trump

# Claim collection
1. Go to opensea.io/collection/cryptotrump
2. Click "Edit collection" (must be contract owner)
3. Set banner (1400x400)
4. Set logo (350x350)
5. Add description
6. Add social links
7. Verify royalty (should auto-detect 3%)
8. Save
```

### Other Marketplaces

**Rarible:**
```
1. rarible.com/connect-my-contract
2. Enter contract address
3. Customize collection
4. Publish
```

**LooksRare:**
```
1. looksrare.org/collections/add
2. Enter contract address
3. Fill details
4. Submit for review (24-48 hours)
```

**Blur:**
```
# Automatic indexing
# No action needed
```

---

## 🌐 Phase 8: Frontend Deployment

### Build Frontend

```bash
# Create Next.js app
npx create-next-app@latest cryptotrump-frontend

# Install dependencies
npm install wagmi viem @rainbow-me/rainbowkit

# Configure environment
# Add contract addresses
# Add RPC URLs
# Add contract ABIs
```

### Features to Implement

1. **Wallet Connection**
   - RainbowKit integration
   - Network switching
   - Balance display

2. **NFT Gallery**
   - Display owned Trumps
   - Show power levels
   - Show merge history
   - Filter by traits

3. **Marketplace**
   - Browse listings
   - Buy Trumps
   - Sell Trumps
   - Place/accept bids

4. **Merge Interface**
   - Select two Trumps
   - Show power preview
   - Execute merge
   - Display cooldown

5. **MAGA Dashboard**
   - Burn Trump for MAGA
   - Check MAGA balance
   - Reduce cooldowns
   - Transaction history

6. **Alpha Trump**
   - Leaderboard
   - Current Alpha
   - Competition stats

### Deploy Frontend

```bash
# Build
npm run build

# Deploy to Vercel
vercel deploy

# Set environment variables in Vercel dashboard
# - NEXT_PUBLIC_MARKETPLACE_ADDRESS
# - NEXT_PUBLIC_MAGA_ADDRESS
# - NEXT_PUBLIC_MERGE_ADDRESS
# - NEXT_PUBLIC_ALCHEMY_KEY
```

---

## 📢 Phase 9: Launch

### Pre-Launch (1 week before)

- [ ] Announce launch date on social media
- [ ] Prepare marketing materials
- [ ] Brief community
- [ ] Prepare Discord/Telegram
- [ ] Test all systems one final time
- [ ] Prepare customer support

### Launch Day

**Hour 0:**
- [ ] Announce on Twitter/X
- [ ] Post on Discord/Telegram
- [ ] Enable minting on website
- [ ] Monitor transactions
- [ ] Be available for support

**Hour 1-24:**
- [ ] Monitor contract for issues
- [ ] Answer community questions
- [ ] Share on social media
- [ ] Engage with early adopters

### Post-Launch

**Week 1:**
- [ ] Daily updates
- [ ] Address any issues
- [ ] Engage community
- [ ] Feature on marketplaces

**Ongoing:**
- [ ] Regular updates
- [ ] Community events
- [ ] Partnership announcements
- [ ] Feature additions

---

## 🚨 Emergency Procedures

### If Issues Detected

1. **Minor Issue (UI bug, metadata error)**
   ```bash
   # Fix and redeploy frontend
   # Or refresh metadata on OpenSea
   ```

2. **Major Issue (contract vulnerability)**
   ```bash
   # Pause contracts immediately
   npx hardhat run scripts/emergency/pauseAll.js --network ethereum

   # Assess damage
   # Communicate with community
   # Plan fix
   # Deploy fix if possible
   # Or migrate to new contract
   ```

3. **Communication Template**
   ```
   "We've identified an issue with [component].
   Contracts have been paused as a precaution.
   Your assets are safe.
   We're investigating and will update within [timeframe].
   No action needed from users."
   ```

### Emergency Contacts

- Security Firm: [Contact]
- Legal: [Contact]
- Community Manager: [Contact]
- Technical Lead: [Contact]

---

## ✅ Final Checklist

### Before Mainnet Launch

- [ ] All tests pass (150+)
- [ ] Security audit complete
- [ ] Testnet deployed and tested (2+ weeks)
- [ ] IPFS metadata uploaded
- [ ] Mainnet contracts deployed
- [ ] Contracts verified on Etherscan
- [ ] Rarity tiers populated
- [ ] Ownership transferred to multisig
- [ ] Listed on OpenSea
- [ ] Listed on other marketplaces
- [ ] Frontend deployed
- [ ] Documentation complete
- [ ] Emergency procedures ready
- [ ] Marketing materials ready
- [ ] Community channels set up
- [ ] Support system ready

### Post-Launch Monitoring

- [ ] Contract events
- [ ] Gas prices
- [ ] Transaction volume
- [ ] Error rates
- [ ] Community feedback
- [ ] Marketplace stats

---

## 📊 Success Metrics

### Technical
- ✅ 100% test pass rate
- ✅ No security vulnerabilities
- ✅ <5% error rate
- ✅ Gas costs within budget

### Business
- Total Trumps minted
- Total trading volume
- Number of merges
- MAGA tokens in circulation
- Active traders
- Marketplace listings

### Community
- Discord/Telegram members
- Twitter followers
- Trading volume
- Secondary sales
- Alpha Trump competition participation

---

## 🔗 Resources

### Documentation
- README.md - Project overview
- MERGE-SYSTEM-README.md - Merge mechanics
- MARKETPLACE-COMPATIBILITY.md - Marketplace guide
- PAK-INSPIRED-FEATURES.md - Feature details

### Tools
- Hardhat: https://hardhat.org
- OpenZeppelin: https://openzeppelin.com
- Pinata: https://pinata.cloud
- Etherscan: https://etherscan.io
- OpenSea: https://opensea.io

### Support
- GitHub Issues: [Your repo]/issues
- Discord: [Your Discord]
- Twitter: [Your Twitter]
- Email: [Your Email]

---

## 🎯 Timeline Estimate

| Phase | Duration | Can Parallelize |
|-------|----------|-----------------|
| Testing | 1-2 days | No |
| IPFS Upload | 1-2 hours | No |
| Testnet Deploy | 2-3 hours | No |
| Testnet Testing | 1-2 weeks | No |
| Security Audit | 2-4 weeks | Yes (prepare marketing) |
| Audit Fixes | 1 week | No |
| Mainnet Deploy | 1 day | No |
| Marketplace Listing | 2-3 days | Yes |
| Frontend | 2-3 weeks | Yes (during audit) |
| Launch Prep | 1 week | Yes |

**Total: 6-10 weeks** (optimistic, with parallel work)

---

## 💡 Tips for Success

1. **Test Everything Twice**
   - On testnet first
   - Then on mainnet with small amounts

2. **Document Everything**
   - Keep deployment logs
   - Save all addresses
   - Record all transactions

3. **Communicate Clearly**
   - Keep community informed
   - Be transparent about issues
   - Set realistic expectations

4. **Start Small**
   - Limited initial mint
   - Gradual feature rollout
   - Build trust first

5. **Stay Vigilant**
   - Monitor 24/7 first week
   - Have emergency plan ready
   - Quick response to issues

---

🇺🇸 **Make Your Launch Great Again!** 🇺🇸

*Remember: Slow and steady wins the race. Don't rush to mainnet.*
