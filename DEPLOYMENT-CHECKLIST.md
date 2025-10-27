# 🚀 CryptoTrump Deployment Checklist

Complete checklist for deploying CryptoTrump NFT marketplace from development to mainnet.

---

## 📋 Pre-Deployment Checklist

### Phase 1: Environment Setup

- [ ] **Install Dependencies**
  ```bash
  npm install
  ```

- [ ] **Configure Environment**
  ```bash
  cp .env.example .env
  # Fill in all required values in .env
  ```

- [ ] **Verify Configuration**
  - [ ] Private key configured (deployment wallet)
  - [ ] RPC URLs configured for all target networks
  - [ ] Block explorer API keys configured
  - [ ] IPFS service API keys configured

- [ ] **Security Check**
  - [ ] Deployment wallet is not your main wallet
  - [ ] `.env` file is in `.gitignore`
  - [ ] No private keys committed to git
  - [ ] Multi-sig address prepared for mainnet owner

---

### Phase 2: NFT Media Generation

- [ ] **Generate Images** (see `nft-media/IMAGE-GENERATION-GUIDE.md`)
  - [ ] Generate all 10,000 unique Trump images (1024x1024 PNG)
  - [ ] Verify image naming: 0.png through 9999.png
  - [ ] Quality check: Review sample images from each rarity tier
  - [ ] Verify special editions: 0, 1, 2, 45, 47
  - [ ] Total size estimate: ~500MB - 5GB

- [ ] **Upload to IPFS** (see `nft-media/IPFS-UPLOAD-GUIDE.md`)
  - [ ] Upload images folder to IPFS
  - [ ] Copy images IPFS CID
  - [ ] Update `.env` with `IPFS_IMAGES_CID`
  - [ ] Run metadata update script:
    ```bash
    cd nft-media
    # Edit scripts/updateMetadataWithIPFS.js with images CID
    node scripts/updateMetadataWithIPFS.js
    ```
  - [ ] Verify updated metadata files
  - [ ] Upload metadata folder to IPFS
  - [ ] Copy metadata IPFS CID
  - [ ] Update `.env` with `IPFS_METADATA_CID`

- [ ] **Verify IPFS Upload**
  ```bash
  cd nft-media
  # Edit scripts/verifyIPFS.js with both CIDs
  node scripts/verifyIPFS.js
  ```
  - [ ] Images accessible on multiple gateways
  - [ ] Metadata accessible on multiple gateways
  - [ ] Image URLs in metadata are correct
  - [ ] Sample NFTs display correctly

- [ ] **Backup IPFS to Multiple Services**
  - [ ] Upload to Pinata (primary)
  - [ ] Upload to NFT.Storage (backup)
  - [ ] Document all CIDs

---

### Phase 3: Smart Contract Testing

- [ ] **Compile Contract**
  ```bash
  npx hardhat compile
  ```
  - [ ] No compilation errors
  - [ ] Gas optimization enabled
  - [ ] All dependencies resolved

- [ ] **Run Tests**
  ```bash
  npx hardhat test
  ```
  - [ ] All tests passing
  - [ ] Coverage > 95%
  - [ ] Gas usage acceptable

- [ ] **Run Coverage**
  ```bash
  npx hardhat coverage
  ```
  - [ ] Review coverage report
  - [ ] Critical functions 100% covered

- [ ] **Static Analysis**
  - [ ] Run Slither (if available)
  - [ ] Run Mythril (if available)
  - [ ] Fix any high/medium issues

---

## 🧪 Testnet Deployment

### Phase 4: Sepolia Testnet Deployment

- [ ] **Get Testnet ETH**
  - [ ] Get Sepolia ETH from faucet
  - [ ] Verify wallet balance

- [ ] **Deploy to Sepolia**
  ```bash
  npx hardhat run scripts/deploy.js --network sepolia
  ```
  - [ ] Deployment successful
  - [ ] Copy contract address
  - [ ] Update `.env` with `CONTRACT_ADDRESS_ETHEREUM`
  - [ ] Save deployment transaction hash

- [ ] **Verify Contract on Etherscan**
  ```bash
  npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS LZ_ENDPOINT_ADDRESS OWNER_ADDRESS
  ```
  - [ ] Contract verified on Sepolia Etherscan
  - [ ] Source code visible
  - [ ] Contract is correct version

- [ ] **Set Base URI**
  ```bash
  # Edit scripts/setBaseURI.js with metadata CID and contract address
  npx hardhat run scripts/setBaseURI.js --network sepolia
  ```
  - [ ] Base URI set successfully
  - [ ] Token URIs resolve correctly

- [ ] **Test Contract Functions**
  - [ ] Call `tokenURI(0)` - should return metadata URL
  - [ ] Check metadata loads correctly
  - [ ] Test initial Trump assignment (if applicable)
  - [ ] Test marketplace functions
  - [ ] Test pause/unpause
  - [ ] Test ownership functions

- [ ] **Test on OpenSea Testnet**
  - [ ] Go to https://testnets.opensea.io
  - [ ] Search for your contract
  - [ ] Verify collection displays correctly
  - [ ] Verify images load
  - [ ] Verify traits display
  - [ ] Test buying/selling (if applicable)

---

### Phase 5: Multi-Chain Testnet Deployment (Optional)

Repeat for each additional chain:

- [ ] **Polygon Mumbai**
  - [ ] Deploy contract
  - [ ] Verify contract
  - [ ] Set base URI
  - [ ] Configure LayerZero peer

- [ ] **Arbitrum Sepolia**
  - [ ] Deploy contract
  - [ ] Verify contract
  - [ ] Set base URI
  - [ ] Configure LayerZero peer

- [ ] **Optimism Sepolia**
  - [ ] Deploy contract
  - [ ] Verify contract
  - [ ] Set base URI
  - [ ] Configure LayerZero peer

- [ ] **Base Sepolia**
  - [ ] Deploy contract
  - [ ] Verify contract
  - [ ] Set base URI
  - [ ] Configure LayerZero peer

- [ ] **Test Cross-Chain Transfers**
  - [ ] Transfer Trump from Chain A to Chain B
  - [ ] Verify Trump arrives on Chain B
  - [ ] Verify Trump removed from Chain A
  - [ ] Test reverse transfer

---

## 🔒 Security Audit

### Phase 6: Professional Security Audit

- [ ] **Contract Security Audit**
  - [ ] Hire professional auditor (OpenZeppelin, Trail of Bits, Consensys Diligence, etc.)
  - [ ] Provide complete code and documentation
  - [ ] Review audit report
  - [ ] Fix all critical issues
  - [ ] Fix all high issues
  - [ ] Address medium issues
  - [ ] Consider low issues

- [ ] **Re-test After Fixes**
  - [ ] Re-run all tests
  - [ ] Re-deploy to testnet
  - [ ] Re-verify functionality
  - [ ] Request audit re-review if major changes

- [ ] **Bug Bounty Program** (Recommended)
  - [ ] Set up bug bounty program (Immunefi, HackerOne)
  - [ ] Define reward tiers
  - [ ] Run for 2-4 weeks before mainnet

---

## 🌐 Mainnet Deployment

### Phase 7: Mainnet Launch Preparation

- [ ] **Final Security Review**
  - [ ] All audit issues resolved
  - [ ] All tests passing
  - [ ] Code frozen (no more changes)
  - [ ] Emergency procedures documented

- [ ] **Prepare Multi-Sig**
  - [ ] Set up multi-sig wallet (Gnosis Safe recommended)
  - [ ] Add signers
  - [ ] Test multi-sig on testnet
  - [ ] Update `OWNER_ADDRESS` in `.env`

- [ ] **Prepare Deployment Wallet**
  - [ ] Fund deployment wallet with sufficient ETH
  - [ ] Estimate gas costs
  - [ ] Add 20% buffer for gas fluctuations

- [ ] **Communication Preparation**
  - [ ] Prepare announcement
  - [ ] Set up social media
  - [ ] Prepare documentation site
  - [ ] Notify community

---

### Phase 8: Mainnet Deployment

- [ ] **Deploy to Ethereum Mainnet**
  ```bash
  npx hardhat run scripts/deploy.js --network ethereum
  ```
  - [ ] Deployment successful
  - [ ] Save contract address
  - [ ] Save deployment transaction
  - [ ] Verify transaction confirmed (12+ blocks)

- [ ] **Verify Contract**
  ```bash
  npx hardhat verify --network ethereum DEPLOYED_CONTRACT_ADDRESS LZ_ENDPOINT_ADDRESS OWNER_ADDRESS
  ```
  - [ ] Contract verified on Etherscan
  - [ ] Source code visible and correct

- [ ] **Set Base URI**
  ```bash
  npx hardhat run scripts/setBaseURI.js --network ethereum
  ```
  - [ ] Base URI set successfully
  - [ ] Token URIs resolve correctly

- [ ] **Transfer Ownership to Multi-Sig**
  ```bash
  # Use Etherscan write contract or custom script
  ```
  - [ ] Ownership transferred
  - [ ] Multi-sig confirmed as owner
  - [ ] Test multi-sig can execute functions

- [ ] **Verify on OpenSea**
  - [ ] Collection appears on OpenSea
  - [ ] Images load correctly
  - [ ] Metadata displays correctly
  - [ ] Collection info correct

---

### Phase 9: Multi-Chain Mainnet Deployment (Optional)

Repeat for each chain:

- [ ] **Polygon Mainnet**
  - [ ] Deploy
  - [ ] Verify
  - [ ] Set base URI
  - [ ] Transfer ownership
  - [ ] Configure LayerZero peer

- [ ] **Arbitrum One**
  - [ ] Deploy
  - [ ] Verify
  - [ ] Set base URI
  - [ ] Transfer ownership
  - [ ] Configure LayerZero peer

- [ ] **Optimism**
  - [ ] Deploy
  - [ ] Verify
  - [ ] Set base URI
  - [ ] Transfer ownership
  - [ ] Configure LayerZero peer

- [ ] **Base**
  - [ ] Deploy
  - [ ] Verify
  - [ ] Set base URI
  - [ ] Transfer ownership
  - [ ] Configure LayerZero peer

- [ ] **Configure Cross-Chain**
  - [ ] Set all LayerZero peers
  - [ ] Test cross-chain transfer
  - [ ] Verify gas fees acceptable

---

## 📢 Post-Deployment

### Phase 10: Launch

- [ ] **Initial Distribution** (if applicable)
  - [ ] Assign initial Trumps to team/investors
  - [ ] Verify assignments successful
  - [ ] Document all initial assignments

- [ ] **Enable Public Claiming/Minting** (if applicable)
  - [ ] Call `allInitialOwnersAssigned()` if needed
  - [ ] Test public claiming works
  - [ ] Monitor for issues

- [ ] **Announce Launch**
  - [ ] Post on social media
  - [ ] Update website
  - [ ] Notify community
  - [ ] Submit to NFT calendars/directories

- [ ] **Monitor Launch**
  - [ ] Watch for unusual transactions
  - [ ] Monitor gas prices
  - [ ] Check for errors
  - [ ] Respond to community questions

---

### Phase 11: Ongoing Operations

- [ ] **Monitoring**
  - [ ] Set up contract event monitoring
  - [ ] Monitor IPFS availability
  - [ ] Track sales volume
  - [ ] Monitor gas costs

- [ ] **Community Management**
  - [ ] Respond to questions
  - [ ] Address issues
  - [ ] Provide support

- [ ] **Marketing**
  - [ ] Continue marketing efforts
  - [ ] Partner with other projects
  - [ ] Run promotions

- [ ] **Documentation**
  - [ ] Keep documentation updated
  - [ ] Document any issues and resolutions
  - [ ] Maintain FAQ

---

## 🚨 Emergency Procedures

### In Case of Issues

- [ ] **Contract Pause**
  ```solidity
  // Call pause() function (owner only)
  ```
  - [ ] Investigate issue
  - [ ] Fix if possible
  - [ ] Unpause when safe

- [ ] **Communication**
  - [ ] Notify community immediately
  - [ ] Explain situation
  - [ ] Provide updates
  - [ ] Announce resolution

- [ ] **Backup Plans**
  - [ ] IPFS backup available
  - [ ] Contract emergency contacts ready
  - [ ] Auditor on standby

---

## 📝 Deployment Records

### Contract Addresses

| Network | Contract Address | Deployment Date | Transaction Hash |
|---------|-----------------|-----------------|------------------|
| Ethereum Mainnet | | | |
| Polygon | | | |
| Arbitrum | | | |
| Optimism | | | |
| Base | | | |

### IPFS CIDs

| Type | CID | Upload Date | Service |
|------|-----|-------------|---------|
| Images | | | |
| Metadata | | | |

### Key Transactions

| Action | Transaction Hash | Date | Network |
|--------|-----------------|------|---------|
| Deploy | | | |
| Set Base URI | | | |
| Transfer Ownership | | | |
| Initial Assignment | | | |

---

## ✅ Final Verification

Before considering deployment complete:

- [ ] Contract deployed and verified
- [ ] Ownership transferred to multi-sig
- [ ] Base URI set correctly
- [ ] NFTs display correctly on OpenSea
- [ ] IPFS content accessible
- [ ] All team members notified
- [ ] Community announcement made
- [ ] Monitoring in place
- [ ] Emergency procedures ready
- [ ] Documentation complete

---

## 🇺🇸 Make Deployment Great Again! 🇺🇸

**Remember:**
- Test everything on testnet first
- Security audit is not optional for mainnet
- Use multi-sig for mainnet ownership
- Always have a backup plan
- Monitor closely after launch

---

**Created:** 2025-10-25  
**Version:** 1.0.0  
**Status:** Ready for use
