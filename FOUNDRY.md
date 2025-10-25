# CryptoTrump - Foundry Guide

## Overview

This project is now configured to use **Foundry**, a blazingly fast, portable, and modular toolkit for Ethereum application development written in Rust.

## Why Foundry?

- ✅ **Built-in Solidity Compiler** - No external downloads needed
- ✅ **Fast Compilation & Testing** - Written in Rust for speed
- ✅ **Solidity Tests** - Write tests in Solidity, not JavaScript
- ✅ **Fuzzing** - Built-in property-based testing
- ✅ **Gas Profiling** - Detailed gas reports for every function
- ✅ **Cheatcodes** - Powerful testing utilities (vm.prank, vm.deal, etc.)
- ✅ **Script Deployment** - Scriptable deployments in Solidity

## Installation

### Option 1: Using foundryup (Recommended)

```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Verify installation
forge --version
cast --version
anvil --version
```

### Option 2: From Binary Release

Download from: https://github.com/foundry-rs/foundry/releases

```bash
# Extract and add to PATH
tar -xzf foundry_nightly_linux_amd64.tar.gz
sudo mv forge cast anvil chisel /usr/local/bin/
```

### Option 3: Build from Source

```bash
# Clone and build
git clone https://github.com/foundry-rs/foundry
cd foundry
cargo install --path ./crates/forge --bins --locked --force
cargo install --path ./crates/cast --bins --locked --force
cargo install --path ./crates/anvil --bins --locked --force
```

## Project Structure

```
cryptoTrump/
├── src/                          # Foundry contract directory
│   ├── CryptoTrumpMarketplace.sol
│   └── mocks/
│       └── MockLZEndpoint.sol
├── test/
│   └── foundry/                  # Solidity tests
│       └── CryptoTrumpMarketplace.t.sol
├── script/                       # Deployment scripts
│   ├── Deploy.s.sol
│   └── DeployTestnet.s.sol
├── lib/                          # Dependencies
│   └── forge-std/                # Foundry standard library (auto-installed)
├── out/                          # Build artifacts (gitignored)
├── cache_foundry/                # Compiler cache (gitignored)
├── foundry.toml                  # Foundry configuration
└── .env                          # Environment variables
```

## Quick Start

### 1. Install Dependencies

```bash
# Install Foundry standard library
forge install foundry-rs/forge-std --no-commit
```

### 2. Build

```bash
# Compile all contracts
forge build

# Compile with size optimization
forge build --sizes

# Clean and rebuild
forge clean && forge build
```

### 3. Test

```bash
# Run all tests
forge test

# Run with verbosity
forge test -vvv

# Run specific test
forge test --match-test test_Deployment_TotalSupply

# Run tests matching pattern
forge test --match-contract CryptoTrumpMarketplace

# Show gas report
forge test --gas-report

# Run with coverage
forge coverage
```

### 4. Deploy

```bash
# Deploy to local Anvil network
anvil  # Run in separate terminal
forge script script/Deploy.s.sol:DeployScript --rpc-url http://localhost:8545 --broadcast

# Deploy to Sepolia testnet
forge script script/DeployTestnet.s.sol:DeployTestnetScript \
  --rpc-url sepolia \
  --broadcast \
  --verify

# Deploy to mainnet (be careful!)
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url ethereum \
  --broadcast \
  --verify \
  --slow
```

## Foundry Commands Reference

### Build & Compile

```bash
forge build                    # Compile contracts
forge clean                    # Clean build artifacts
forge build --force            # Force recompile all
forge build --watch            # Watch for changes
```

### Testing

```bash
forge test                     # Run all tests
forge test -vv                 # More verbose
forge test -vvvv               # Trace level verbosity
forge test --match-test NAME   # Run specific test
forge test --match-contract X  # Run tests in contract X
forge test --gas-report        # Show gas usage
forge coverage                 # Generate coverage report
forge snapshot                 # Create gas snapshot
```

### Deployment & Interaction

```bash
forge create                   # Deploy contract
forge script                   # Run deployment script
cast send                      # Send transaction
cast call                      # Call view function
cast receipt                   # Get transaction receipt
```

### Utilities

```bash
forge fmt                      # Format Solidity code
forge inspect                  # Inspect contract info
forge verify-contract          # Verify on Etherscan
cast abi-encode                # Encode calldata
cast keccak                    # Compute keccak256
cast --to-wei 1 ether          # Convert units
```

## Testing Guide

### Test Structure

```solidity
contract MyTest is Test {
    function setUp() public {
        // Setup runs before each test
    }

    function test_Feature() public {
        // Test function (must start with 'test')
    }

    function testFuzz_Feature(uint256 x) public {
        // Fuzz test (runs with random inputs)
    }

    function testFail_Revert() public {
        // Expects function to fail
    }
}
```

### Cheatcodes

```solidity
// Pranking (set msg.sender)
vm.prank(alice);              // Next call only
vm.startPrank(alice);         // All subsequent calls
vm.stopPrank();               // Stop pranking

// Deal ETH
vm.deal(alice, 100 ether);

// Expect events
vm.expectEmit(true, true, false, true);
emit Transfer(from, to, amount);

// Expect reverts
vm.expectRevert(MyError.selector);
vm.expectRevert("Error message");

// Warp time
vm.warp(block.timestamp + 1 days);

// Roll block
vm.roll(block.number + 100);

// Create addresses
address alice = makeAddr("alice");
```

### Running Our Tests

```bash
# Run all CryptoTrump tests
forge test --match-contract CryptoTrumpMarketplace

# Run deployment tests only
forge test --match-test test_Deployment

# Run with detailed output
forge test --match-contract CryptoTrumpMarketplace -vvv

# Generate gas report
forge test --gas-report --match-contract CryptoTrumpMarketplace

# Run coverage
forge coverage --match-contract CryptoTrumpMarketplace
```

## Configuration (foundry.toml)

Our `foundry.toml` is configured with:

- **Solidity Version**: 0.8.20
- **Optimizer**: Enabled (200 runs)
- **Remappings**: OpenZeppelin contracts mapped
- **Gas Reporting**: Enabled for all contracts
- **Fuzz Runs**: 256 iterations
- **RPC URLs**: From environment variables

## Environment Setup

Create a `.env` file:

```bash
# Private key for deployment
PRIVATE_KEY=0x...

# RPC endpoints
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY

# Etherscan API keys
ETHERSCAN_API_KEY=YOUR_KEY
POLYGONSCAN_API_KEY=YOUR_KEY
ARBISCAN_API_KEY=YOUR_KEY
```

## Deployment Example

```bash
# 1. Start local node
anvil

# 2. Deploy locally
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url http://localhost:8545 \
  --broadcast \
  -vvvv

# 3. Interact with deployed contract
export CONTRACT_ADDRESS=0x...

# Get total supply
cast call $CONTRACT_ADDRESS "TOTAL_TRUMPS()"

# Assign Trump
cast send $CONTRACT_ADDRESS \
  "setInitialOwner(address,uint256)" \
  0x... 0 \
  --private-key $PRIVATE_KEY
```

## Gas Optimization

```bash
# Get gas snapshot
forge snapshot

# Compare gas changes
forge snapshot --diff

# Detailed gas report
forge test --gas-report

# View gas by function
forge test --gas-report --match-contract CryptoTrumpMarketplace
```

## Verification

```bash
# Verify on Etherscan
forge verify-contract \
  --chain-id 11155111 \
  --compiler-version v0.8.20+commit.a1b79de6 \
  --optimizer-runs 200 \
  $CONTRACT_ADDRESS \
  src/CryptoTrumpMarketplace.sol:CryptoTrumpMarketplace \
  --etherscan-api-key $ETHERSCAN_API_KEY
```

## Debugging

```bash
# Run with trace
forge test --match-test test_Sale_BuyTrump -vvvv

# Debug specific test
forge test --match-test test_Sale_BuyTrump --debug

# Decode error
cast 4byte 0x...

# Decode event
cast 4byte-event 0x...
```

## Tips & Best Practices

1. **Always run tests before committing**
   ```bash
   forge test && git commit
   ```

2. **Use gas snapshots to track changes**
   ```bash
   forge snapshot
   git add .gas-snapshot
   ```

3. **Format code consistently**
   ```bash
   forge fmt
   ```

4. **Write fuzz tests for edge cases**
   ```solidity
   function testFuzz_Price(uint256 price) public {
       price = bound(price, 0.01 ether, 1000 ether);
       // Test with random price
   }
   ```

5. **Use invariant testing for complex logic**
   ```solidity
   function invariant_TotalSupplyNeverExceeds10000() public {
       assertLe(totalMinted, 10000);
   }
   ```

## Troubleshooting

### Issue: "forge: command not found"
```bash
# Add to PATH
export PATH="$HOME/.foundry/bin:$PATH"
```

### Issue: Compilation fails
```bash
# Clean and rebuild
forge clean
forge build
```

### Issue: Tests fail
```bash
# Run with maximum verbosity to see traces
forge test -vvvv
```

### Issue: Out of gas
```bash
# Increase gas limit in foundry.toml
gas_limit = "18446744073709551615"
```

## Migration from Hardhat

We still maintain Hardhat compatibility:
- **Hardhat**: Use for JavaScript tests and legacy scripts
- **Foundry**: Use for Solidity tests and new development

Both work side-by-side:
```bash
# Hardhat
npm run compile
npm test

# Foundry
forge build
forge test
```

## Resources

- **Foundry Book**: https://book.getfoundry.sh/
- **Forge Std**: https://github.com/foundry-rs/forge-std
- **Cheatcodes**: https://book.getfoundry.sh/cheatcodes/
- **Cast Reference**: https://book.getfoundry.sh/reference/cast/

## Next Steps

1. Install Foundry: `curl -L https://foundry.paradigm.xyz | bash && foundryup`
2. Install dependencies: `forge install foundry-rs/forge-std --no-commit`
3. Run tests: `forge test`
4. Deploy locally: `anvil` (terminal 1) and `forge script script/Deploy.s.sol --broadcast` (terminal 2)
5. Deploy to testnet: `forge script script/DeployTestnet.s.sol --rpc-url sepolia --broadcast --verify`

---

**🚀 Make NFTs Great Again with Foundry!** 🚀
