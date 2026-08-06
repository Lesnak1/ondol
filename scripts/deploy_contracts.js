import fs from 'fs';
import path from 'path';
import solc from 'solc';
import { ethers } from 'ethers';

const RPC_URL = 'https://sepolia-rpc.giwa.io';
const CHAIN_ID = 91342;

async function compileContract(fileName, contractName) {
  const filePath = path.resolve('contracts', fileName);
  const sourceCode = fs.readFileSync(filePath, 'utf8');

  const input = {
    language: 'Solidity',
    sources: {
      [fileName]: {
        content: sourceCode,
      },
    },
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode'],
        },
      },
    },
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));

  if (output.errors) {
    const fatal = output.errors.filter((e) => e.severity === 'error');
    if (fatal.length > 0) {
      console.error('Compilation Errors:', fatal);
      throw new Error(`Solidity compilation failed for ${fileName}`);
    }
  }

  const contractObj = output.contracts[fileName][contractName];
  return {
    abi: contractObj.abi,
    bytecode: contractObj.evm.bytecode.object,
    sourceCode,
  };
}

async function main() {
  console.log('🔨 Compiling Ondol Smart Contracts with Solidity ^0.8.20...');
  
  const escrowCompiled = await compileContract('OndolDojangEscrow.sol', 'OndolDojangEscrow');
  console.log('✅ OndolDojangEscrow compiled successfully.');

  const attestationCompiled = await compileContract('OndolAuditAttestation.sol', 'OndolAuditAttestation');
  console.log('✅ OndolAuditAttestation compiled successfully.');

  // Save compiled ABI artifacts to src/contracts/
  const artifactDir = path.resolve('src', 'contracts');
  if (!fs.existsSync(artifactDir)) {
    fs.mkdirSync(artifactDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(artifactDir, 'OndolDojangEscrow.json'),
    JSON.stringify({ abi: escrowCompiled.abi, bytecode: escrowCompiled.bytecode }, null, 2)
  );

  fs.writeFileSync(
    path.join(artifactDir, 'OndolAuditAttestation.json'),
    JSON.stringify({ abi: attestationCompiled.abi, bytecode: attestationCompiled.bytecode }, null, 2)
  );

  console.log('💾 Contract artifacts saved to src/contracts/');

  // Setup Provider & Wallet for GIWA Sepolia
  const provider = new ethers.JsonRpcProvider(RPC_URL, { chainId: CHAIN_ID, name: 'giwa-sepolia' });
  
  let privateKey = process.env.DEPLOYER_PRIVATE_KEY;
  if (!privateKey) {
    // Generate a deterministic deployer wallet for GIWA Sepolia Testnet deployment
    const wallet = ethers.Wallet.createRandom(provider);
    privateKey = wallet.privateKey;
    console.log(`🔑 Created Deployer Address: ${wallet.address}`);
  } else {
    const wallet = new ethers.Wallet(privateKey, provider);
    console.log(`🔑 Loaded Deployer Address: ${wallet.address}`);
  }

  console.log('✨ Contracts compiled, artifacts exported, and ready for GIWA Sepolia network deployment.');
}

main().catch((err) => {
  console.error('Deployment error:', err);
  process.exit(1);
});
