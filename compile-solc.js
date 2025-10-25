const fs = require('fs');
const solc = require('solc');
const path = require('path');

// Read the contract
const contractPath = path.resolve(__dirname, 'contracts', 'CryptoTrumpMarketplace.sol');
const source = fs.readFileSync(contractPath, 'utf8');

// Helper to find imports
function findImports(importPath) {
    try {
        if (importPath.startsWith('@openzeppelin')) {
            const ozPath = path.resolve(__dirname, 'node_modules', importPath);
            return {
                contents: fs.readFileSync(ozPath, 'utf8')
            };
        }
        const fullPath = path.resolve(__dirname, 'contracts', importPath);
        return {
            contents: fs.readFileSync(fullPath, 'utf8')
        };
    } catch (error) {
        return { error: 'File not found: ' + importPath };
    }
}

// Prepare input
const input = {
    language: 'Solidity',
    sources: {
        'CryptoTrumpMarketplace.sol': {
            content: source
        }
    },
    settings: {
        optimizer: {
            enabled: true,
            runs: 200
        },
        outputSelection: {
            '*': {
                '*': ['abi', 'evm.bytecode', 'evm.deployedBytecode']
            }
        }
    }
};

console.log('Compiling CryptoTrumpMarketplace.sol...');
const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));

if (output.errors) {
    output.errors.forEach(error => {
        console.log(error.formattedMessage);
    });
}

if (output.contracts && output.contracts['CryptoTrumpMarketplace.sol']) {
    console.log('\n✅ Compilation successful!');
    console.log('Contract compiled successfully.');

    // Save artifacts
    const artifacts = output.contracts['CryptoTrumpMarketplace.sol']['CryptoTrumpMarketplace'];
    fs.mkdirSync('./artifacts', { recursive: true });
    fs.writeFileSync(
        './artifacts/CryptoTrumpMarketplace.json',
        JSON.stringify({
            abi: artifacts.abi,
            bytecode: artifacts.evm.bytecode.object
        }, null, 2)
    );
    console.log('Artifacts saved to ./artifacts/CryptoTrumpMarketplace.json');
} else {
    console.log('\n❌ Compilation failed');
    process.exit(1);
}
