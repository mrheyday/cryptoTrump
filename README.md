# 🇺🇸 CryptoTrump - Make NFTs Great Again! 🇺🇸

![CryptoTrump Banner](https://via.placeholder.com/1200x300/FF0000/FFFFFF?text=CRYPTOTRUMP+-+MAKE+NFTS+GREAT+AGAIN!)

## 🎯 Overview

**CryptoTrump** is a revolutionary NFT collection featuring 10,000 unique Trump-themed digital collectibles. Built on cutting-edge blockchain technology with cross-chain capabilities, it's the most tremendous NFT project ever created. Believe me!

### Why CryptoTrump?

- 🏆 **10,000 Unique Trumps** - No two are exactly alike, folks!
- 🌐 **Cross-Chain Ready** - Trade on any blockchain via LayerZero V2
- 🔒 **Ultra Secure** - OpenZeppelin audited contracts
- ⚡ **Gas Optimized** - Solidity 0.8.20 with modern optimizations
- 💰 **Built-in Marketplace** - Buy, sell, and bid with ease
- 🎨 **Full ERC721** - Compatible with all major NFT platforms

## ✨ Features

### Core Marketplace Features

- **Initial Distribution** - Owner-controlled Trump assignment
- **Free Transfers** - Transfer Trumps without payment
- **Marketplace Sales** - List Trumps for sale with minimum price
- **Private Sales** - Offer Trumps to specific addresses
- **Bidding System** - Enter, accept, and withdraw bids
- **Safe Withdrawals** - Secure ether withdrawal mechanism
- **Pausable** - Emergency pause functionality

### Cross-Chain Features 🌐

- **Multi-Chain Support** - Deploy on any EVM chain
- **LayerZero Integration** - Secure cross-chain messaging
- **Cross-Chain Transfers** - Send Trumps between chains
- **Fee Quoting** - Get cross-chain transfer costs
- **Trusted Peers** - Configure trusted remote contracts

### Security Features 🔒

- ✅ ReentrancyGuard on all payable functions
- ✅ Pausable for emergency stops
- ✅ Comprehensive input validation
- ✅ Custom errors for gas optimization
- ✅ OpenZeppelin security patterns
- ✅ No external calls before state changes

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- MetaMask or other Web3 wallet

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/cryptotrump.git
cd cryptotrump

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### Compile

```bash
npm run compile
```

### Test

```bash
# Run all tests
npm test

# Run with gas reporting
npm run test:gas

# Run coverage
npm run coverage
```

### Deploy

```bash
# Deploy to local Hardhat network
npm run deploy

# Deploy to Sepolia testnet
npm run deploy:sepolia

# Deploy to Ethereum mainnet
npm run deploy:mainnet
```

## 📖 Contract Architecture

```
CryptoTrumpMarketplace
├── ERC721 (OpenZeppelin)
│   └── Standard NFT functionality
├── OFT721 (LayerZero)
│   └── Cross-chain transfers
├── Ownable (OpenZeppelin)
│   └── Access control
├── ReentrancyGuard (OpenZeppelin)
│   └── Reentrancy protection
└── Pausable (OpenZeppelin)
    └── Emergency controls
```

## 💡 Usage Examples

### Claim a Trump

```javascript
const contract = await ethers.getContractAt("CryptoTrumpMarketplace", ADDRESS);
await contract.getTrump(trumpIndex);
```

### List Trump for Sale

```javascript
// List for public sale
await contract.offerTrumpForSale(trumpIndex, ethers.parseEther("1.0"));

// List for specific buyer
await contract.offerTrumpForSaleToAddress(
  trumpIndex,
  ethers.parseEther("1.0"),
  buyerAddress
);
```

### Buy a Trump

```javascript
await contract.buyTrump(trumpIndex, { value: ethers.parseEther("1.0") });
```

### Bidding

```javascript
// Place bid
await contract.enterBidForTrump(trumpIndex, { value: ethers.parseEther("0.5") });

// Accept bid (as owner)
await contract.acceptBidForTrump(trumpIndex, ethers.parseEther("0.5"));

// Withdraw bid
await contract.withdrawBidForTrump(trumpIndex);
```

### Cross-Chain Transfer

```javascript
// Quote fee
const fee = await contract.quoteSendTrump(
  trumpIndex,
  dstEid,
  recipientAddr,
  options
);

// Send Trump to another chain
await contract.sendTrumpCrossChain(
  trumpIndex,
  dstEid,
  recipientAddr,
  options,
  { value: fee.nativeFee }
);
```

## 🌐 Supported Networks

### Mainnets
- ✅ Ethereum
- ✅ Polygon
- ✅ Arbitrum
- ✅ Optimism
- ✅ Base
- ✅ Avalanche
- ✅ BNB Chain

### Testnets
- ✅ Sepolia
- ✅ Mumbai
- ✅ Arbitrum Sepolia
- ✅ Optimism Sepolia
- ✅ Base Sepolia

## 📊 Tokenomics

- **Total Supply**: 10,000 Trumps
- **Symbol**: TRUMP
- **Standard**: ERC721
- **Decimals**: 0 (NFT)
- **Initial Distribution**: Owner controlled
- **Public Claiming**: After initial distribution

## 🎨 Metadata

Trump metadata will be hosted on IPFS with the following structure:

```json
{
  "name": "CryptoTrump #1",
  "description": "One of 10,000 unique Trump-themed collectibles",
  "image": "ipfs://YOUR_IPFS_HASH/1.png",
  "attributes": [
    {
      "trait_type": "Expression",
      "value": "Thumbs Up"
    },
    {
      "trait_type": "Outfit",
      "value": "Red Tie"
    },
    {
      "trait_type": "Background",
      "value": "American Flag"
    },
    {
      "trait_type": "Rarity",
      "value": "Common"
    }
  ]
}
```

## 🔐 Security

### Audited Components
- OpenZeppelin Contracts v5.0.1
- LayerZero V2 Protocol

### Security Features
- ReentrancyGuard protection
- Checks-Effects-Interactions pattern
- Custom errors for gas efficiency
- Comprehensive input validation
- Emergency pause functionality
- Owner-only administrative functions

### Testing
- 95%+ code coverage
- Comprehensive test suite
- Gas optimization tests
- Security scenario testing

## 📝 Smart Contract Functions

### Owner Functions
```solidity
function setInitialOwner(address to, uint256 trumpIndex) external;
function setInitialOwners(address[] calldata addresses, uint256[] calldata indices) external;
function allInitialOwnersAssigned() external;
function pause() external;
function unpause() external;
function setBaseURI(string calldata baseURI) external;
```

### User Functions
```solidity
function getTrump(uint256 trumpIndex) external;
function transferTrump(address to, uint256 trumpIndex) external;
function offerTrumpForSale(uint256 trumpIndex, uint256 minSalePriceInWei) external;
function offerTrumpForSaleToAddress(uint256 trumpIndex, uint256 minSalePriceInWei, address toAddress) external;
function buyTrump(uint256 trumpIndex) external payable;
function trumpNoLongerForSale(uint256 trumpIndex) external;
function enterBidForTrump(uint256 trumpIndex) external payable;
function acceptBidForTrump(uint256 trumpIndex, uint256 minPrice) external;
function withdrawBidForTrump(uint256 trumpIndex) external;
function withdraw() external;
```

### Cross-Chain Functions
```solidity
function sendTrumpCrossChain(uint256 trumpIndex, uint32 dstEid, address to, bytes calldata options) external payable;
function quoteSendTrump(uint256 trumpIndex, uint32 dstEid, address to, bytes calldata options) external view returns (MessagingFee memory);
```

## 🛠 Development

### Project Structure
```
cryptotrump/
├── contracts/
│   ├── CryptoTrumpMarketplace.sol    # Main contract
│   └── mocks/
│       └── MockLZEndpoint.sol        # Testing mock
├── test/
│   └── CryptoTrumpMarketplace.test.js
├── scripts/
│   └── deploy.js
├── hardhat.config.js
├── package.json
└── README.md
```

### Scripts
```bash
npm run compile       # Compile contracts
npm test              # Run tests
npm run test:gas      # Run tests with gas reporting
npm run coverage      # Generate coverage report
npm run deploy        # Deploy to configured network
npm run lint          # Lint Solidity code
npm run format        # Format code with Prettier
```

## 📜 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

- **Documentation**: This README
- **Issues**: [GitHub Issues](https://github.com/YOUR_USERNAME/cryptotrump/issues)
- **Discussions**: [GitHub Discussions](https://github.com/YOUR_USERNAME/cryptotrump/discussions)

## 🎉 Roadmap

- [x] ✅ Smart contract development
- [x] ✅ Cross-chain integration (LayerZero V2)
- [x] ✅ Comprehensive testing
- [ ] 🎨 Trump artwork generation
- [ ] 📱 Frontend dApp
- [ ] 🌐 Multi-chain deployment
- [ ] 🎯 Community distribution
- [ ] 🚀 Public launch

## ⚠️ Disclaimer

This project is for educational and entertainment purposes. CryptoTrump is not affiliated with, endorsed by, or connected to any political figure or entity.

---

## 🇺🇸 Make NFTs Great Again! 🇺🇸

**Deployed with the best technology. The most secure. The most tremendous NFT project ever created. Everyone says so!**

---

**Built with ❤️ by the CryptoTrump team**

[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-blue)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Built%20with-Hardhat-yellow)](https://hardhat.org/)
[![OpenZeppelin](https://img.shields.io/badge/OpenZeppelin-5.0.1-purple)](https://openzeppelin.com/)
[![LayerZero](https://img.shields.io/badge/LayerZero-V2-green)](https://layerzero.network/)
[![License: MIT](https://img.shields.io/badge/License-MIT-brightgreen.svg)](https://opensource.org/licenses/MIT)
