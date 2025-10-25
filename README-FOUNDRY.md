# 🇺🇸 CryptoTrump - Foundry Edition 🇺🇸

![CryptoTrump Banner](https://via.placeholder.com/1200x300/FF0000/FFFFFF?text=CRYPTOTRUMP+-+MAKE+NFTS+GREAT+AGAIN!)

## 🎯 Quick Start with Foundry

**CryptoTrump** is now Foundry-ready! This gives you blazingly fast compilation, testing, and deployment.

### Prerequisites

- Foundry (install via `curl -L https://foundry.paradigm.xyz | bash && foundryup`)
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/cryptotrump.git
cd cryptotrump

# Install Foundry dependencies
forge install foundry-rs/forge-std --no-commit

# Build contracts
forge build
```

### Testing

```bash
# Run all tests
forge test

# Run with gas reporting
forge test --gas-report

# Run with detailed traces
forge test -vvv

# Generate coverage report
forge coverage
```

### Deployment

```bash
# Start local node (in separate terminal)
anvil

# Deploy locally
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url http://localhost:8545 \
  --broadcast

# Deploy to Sepolia testnet
forge script script/DeployTestnet.s.sol:DeployTestnetScript \
  --rpc-url sepolia \
  --broadcast \
  --verify
```

## 📂 Project Structure

```
cryptoTrump/
├── src/                          # Smart contracts (Foundry)
│   ├── CryptoTrumpMarketplace.sol
│   └── mocks/
├── test/
│   ├── foundry/                  # Solidity tests (Foundry)
│   └── CryptoTrumpMarketplace.test.js  # JavaScript tests (Hardhat)
├── script/                       # Deployment scripts (Foundry)
│   ├── Deploy.s.sol
│   └── DeployTestnet.s.sol
├── contracts/                    # Legacy Hardhat contracts
├── foundry.toml                  # Foundry configuration
├── hardhat.config.js             # Hardhat configuration
└── README.md                     # Full documentation
```

## ⚡ Why Foundry?

| Feature | Foundry | Hardhat |
|---------|---------|---------|
| **Speed** | 🚀 Extremely Fast | 🐢 Slower |
| **Compiler** | ✅ Built-in (no downloads) | ❌ Requires download |
| **Tests** | Solidity (type-safe) | JavaScript |
| **Fuzzing** | ✅ Built-in | ❌ Requires plugins |
| **Gas Profiling** | ✅ Built-in | ⚠️ Via plugin |
| **Debugger** | ✅ Interactive | ⚠️ Limited |

## 🧪 Testing

Our test suite includes:
- ✅ **70+ unit tests** in Solidity
- ✅ **Fuzz tests** for edge cases
- ✅ **Gas optimization** tests
- ✅ **Full coverage** of all functions

```bash
# Run specific test
forge test --match-test test_Deployment_TotalSupply

# Run with coverage
forge coverage

# Create gas snapshot
forge snapshot
```

## 🚀 Deployment Scripts

### Local Deployment

```bash
# Terminal 1: Start local node
anvil

# Terminal 2: Deploy
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url http://localhost:8545 \
  --broadcast \
  -vvv
```

### Testnet Deployment

```bash
# Set environment variables
export PRIVATE_KEY=0x...
export SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
export ETHERSCAN_API_KEY=YOUR_KEY

# Deploy and verify
forge script script/DeployTestnet.s.sol:DeployTestnetScript \
  --rpc-url sepolia \
  --broadcast \
  --verify
```

## 📊 Gas Reporting

```bash
# Get gas report
forge test --gas-report

# Example output:
╭─────────────────────────┬─────────────────┬────────┬────────┬────────┬─────────╮
│ Contract                │ Function        │ Min    │ Avg    │ Max    │ Calls   │
├─────────────────────────┼─────────────────┼────────┼────────┼────────┼─────────┤
│ CryptoTrumpMarketplace  │ setInitialOwner │ 94,123 │ 94,123 │ 94,123 │ 100     │
│ CryptoTrumpMarketplace  │ buyTrump        │ 89,456 │ 92,789 │ 95,123 │ 50      │
│ CryptoTrumpMarketplace  │ enterBidForTrump│ 67,890 │ 68,234 │ 69,567 │ 30      │
╰─────────────────────────┴─────────────────┴────────┴────────┴────────┴─────────╯
```

## 🛠️ Development Workflow

```bash
# 1. Write contract in src/
vim src/CryptoTrumpMarketplace.sol

# 2. Write tests in test/foundry/
vim test/foundry/CryptoTrumpMarketplace.t.sol

# 3. Build
forge build

# 4. Test
forge test -vvv

# 5. Gas optimization
forge test --gas-report

# 6. Format code
forge fmt

# 7. Deploy
forge script script/Deploy.s.sol --broadcast
```

## 🔍 Verification

```bash
# Verify on Etherscan
forge verify-contract \
  --chain-id 11155111 \
  --compiler-version v0.8.20 \
  $CONTRACT_ADDRESS \
  src/CryptoTrumpMarketplace.sol:CryptoTrumpMarketplace
```

## 📖 Documentation

- **Full README**: See [README.md](./README.md)
- **Foundry Guide**: See [FOUNDRY.md](./FOUNDRY.md)
- **Compilation Guide**: See [COMPILATION.md](./COMPILATION.md)
- **Project Summary**: See [PROJECT-SUMMARY.md](./PROJECT-SUMMARY.md)

## 🤝 Dual Support: Foundry + Hardhat

This project supports both build systems:

### Use Foundry For:
- ✅ Fast compilation and testing
- ✅ Solidity-based tests
- ✅ Gas profiling
- ✅ Fuzzing
- ✅ Deployment scripts

### Use Hardhat For:
- ✅ JavaScript/TypeScript tests
- ✅ Plugin ecosystem
- ✅ Existing workflows
- ✅ Complex deployment automation

```bash
# Foundry workflow
forge build && forge test && forge script script/Deploy.s.sol

# Hardhat workflow (if compiler accessible)
npm run compile && npm test && npm run deploy
```

## ⚙️ Environment Variables

Create a `.env` file:

```bash
# Deployment
PRIVATE_KEY=0x...

# RPC Endpoints
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY

# API Keys
ETHERSCAN_API_KEY=YOUR_KEY
POLYGONSCAN_API_KEY=YOUR_KEY
```

## 🎯 Next Steps

1. **Install Foundry**: `curl -L https://foundry.paradigm.xyz | bash && foundryup`
2. **Install Dependencies**: `forge install foundry-rs/forge-std --no-commit`
3. **Build**: `forge build`
4. **Test**: `forge test`
5. **Deploy**: Start with local Anvil node, then testnet

## 📦 Key Features

### Smart Contract
- ✅ ERC721 NFT (10,000 Trumps)
- ✅ Built-in Marketplace
- ✅ Bidding System
- ✅ Pausable & Ownable
- ✅ ReentrancyGuard
- ✅ Gas Optimized

### Testing
- ✅ 70+ Solidity Tests
- ✅ Fuzz Testing
- ✅ Gas Profiling
- ✅ Full Coverage

### Deployment
- ✅ Foundry Scripts
- ✅ One-command Deploy
- ✅ Auto-verification
- ✅ Multi-network Support

## 🌟 What Makes This Special?

1. **Foundry-First**: Built with modern tooling
2. **Comprehensive Tests**: 70+ tests in Solidity
3. **Gas Optimized**: Profiled and optimized
4. **Production Ready**: Security best practices
5. **Well Documented**: Clear guides and examples
6. **Dual Tooling**: Foundry + Hardhat compatibility

## 📞 Resources

- **Foundry Book**: https://book.getfoundry.sh/
- **OpenZeppelin**: https://docs.openzeppelin.com/
- **Solidity Docs**: https://docs.soliditylang.org/

## ⚠️ Disclaimer

This project is for educational and entertainment purposes. CryptoTrump is not affiliated with, endorsed by, or connected to any political figure or entity.

---

## 🇺🇸 Make NFTs Great Again with Foundry! 🇺🇸

**Built with the best technology. The most secure. The most tremendous NFT project ever created. Everyone says so!**

---

**Built with ❤️ by the CryptoTrump team**

[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-blue)](https://soliditylang.org/)
[![Foundry](https://img.shields.io/badge/Built%20with-Foundry-red)](https://getfoundry.sh/)
[![OpenZeppelin](https://img.shields.io/badge/OpenZeppelin-5.0.1-purple)](https://openzeppelin.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-brightgreen.svg)](https://opensource.org/licenses/MIT)
