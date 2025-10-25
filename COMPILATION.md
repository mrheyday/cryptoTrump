# CryptoTrump Compilation Guide

## Network Restrictions

This environment has network restrictions that block access to Solidity compiler downloads from:
- ❌ `binaries.soliditylang.org` (default Hardhat source) - 403 Access Denied
- ❌ `solx.zksync.io` (zkSync mirror) - 403 Access Denied

## Working Solution ✅

We use a custom compilation script with locally installed `solc-js`:

### Method 1: Custom solc-js Script (RECOMMENDED)

```bash
# Compile the contract
node compile-solc.js
```

This script:
- Uses the locally installed `solc@0.8.20` package
- Resolves OpenZeppelin imports automatically
- Generates artifacts to `./artifacts/CryptoTrumpMarketplace.json`
- Provides clear success/error messages

**Advantages:**
- ✅ Works despite network restrictions
- ✅ Fast compilation
- ✅ Clear error messages
- ✅ No external downloads needed

### Method 2: Hardhat (NOT WORKING)

```bash
# This will fail due to network restrictions:
npm run compile  # ❌ Cannot download compiler
npm test         # ❌ Cannot download compiler
```

Hardhat requires downloading the Solidity compiler from external sources, which is blocked.

## Testing

Since Hardhat cannot compile, we cannot run the full test suite via `npm test`.

**Alternative Testing Options:**

1. **Manual Testing:**
   - Deploy to a local Hardhat node (if compiler was pre-downloaded)
   - Use Remix IDE for interactive testing
   - Deploy to a testnet

2. **Unit Tests (Future):**
   - Migrate to Foundry (uses pre-installed solc)
   - Use a different environment without network restrictions
   - Pre-download compilers and cache them

## Current Workflow

1. **Make changes** to `contracts/CryptoTrumpMarketplace.sol`
2. **Compile** using `node compile-solc.js`
3. **Check** the output for errors
4. **Review** artifacts in `./artifacts/`

## Contract Verification

To verify the contract compiles correctly:

```bash
node compile-solc.js
```

Expected output:
```
Compiling CryptoTrumpMarketplace.sol...
✅ Compilation successful!
Contract compiled successfully.
Artifacts saved to ./artifacts/CryptoTrumpMarketplace.json
```

## Deployment

For deployment, you have two options:

### Option 1: Use Hardhat (If Compiler Cached)

If the compiler was previously downloaded and cached:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

### Option 2: Manual Deployment

Use the compiled artifacts with ethers.js directly:

```javascript
const { ethers } = require('ethers');
const artifact = require('./artifacts/CryptoTrumpMarketplace.json');

// Deploy using artifact.abi and artifact.bytecode
```

## Future Improvements

1. **Migrate to Foundry:**
   - Built-in Solidity compiler (no downloads needed)
   - Faster compilation
   - Better testing framework
   - Gas profiling

2. **Use Docker:**
   - Pre-built image with compilers cached
   - Consistent environment
   - No network dependencies

3. **Pre-cache Compilers:**
   - Download compilers in a different environment
   - Copy to `~/.cache/hardhat-nodejs/compilers-v2/`
   - Use cached versions

## Summary

- ✅ **Compilation:** Works via `node compile-solc.js`
- ❌ **Hardhat Compile:** Blocked by network restrictions
- ❌ **Hardhat Test:** Blocked by network restrictions
- ℹ️ **solx.zksync.io:** Also blocked (same network restriction)

The custom solc-js script is our reliable compilation method until we migrate to Foundry or resolve the network restrictions.
