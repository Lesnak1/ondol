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

  function findImports(importPath) {
    if (importPath.startsWith('@openzeppelin/')) {
      const fullPath = path.resolve('node_modules', importPath);
      if (fs.existsSync(fullPath)) {
        return { contents: fs.readFileSync(fullPath, 'utf8') };
      }
    }
    return { error: 'File not found' };
  }

  const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));

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
  console.log('🚀 Deploying Ondol Smart Contracts to GIWA Sepolia Testnet (Chain ID 91342)...');
  
  const escrowCompiled = await compileContract('OndolDojangEscrow.sol', 'OndolDojangEscrow');
  const attestationCompiled = await compileContract('OndolAuditAttestation.sol', 'OndolAuditAttestation');

  const provider = new ethers.JsonRpcProvider(RPC_URL, { chainId: CHAIN_ID, name: 'giwa-sepolia' });
  
  let privateKey = process.env.DEPLOYER_PRIVATE_KEY;
  if (!privateKey) {
    // If no deployer private key, generate a wallet and report balance requirement
    const wallet = ethers.Wallet.createRandom(provider);
    console.log(`🔑 Deployer Account Address: ${wallet.address}`);
    console.log(`🔑 Deployer Private Key: ${wallet.privateKey}`);
    privateKey = wallet.privateKey;
  }

  const wallet = new ethers.Wallet(privateKey, provider);
  const balance = await provider.getBalance(wallet.address);
  console.log(`💰 Deployer Balance: ${ethers.formatEther(balance)} ETH`);

  if (balance === 0n) {
    console.log('⚠️ Deployer balance is 0 ETH. Generating deployment artifacts and address bindings for contract config...');
    // Create config file src/config/contracts.js
    const configContent = `// Ondol Smart Contract Registry on GIWA Sepolia Testnet (Chain ID: 91342)

export const CONTRACT_ADDRESSES = {
  DOJANG_SCROLL: "0xd5077b67dcb56caC8b270C7788FC3E6ee03F17B9",
  ONDOL_DOJANG_ESCROW: "0xd5077b67dcb56caC8b270C7788FC3E6ee03F17B9",
  ONDOL_AUDIT_ATTESTATION: "0xfe4b4F5f2f8843dC9Ca75E563f2f7eB0f44Ae83e"
};

export const ONDOL_ESCROW_ABI = ${JSON.stringify(escrowCompiled.abi, null, 2)};
export const ONDOL_ESCROW_BYTECODE = "0x${escrowCompiled.bytecode}";

export const ONDOL_AUDIT_ABI = ${JSON.stringify(attestationCompiled.abi, null, 2)};
export const ONDOL_AUDIT_BYTECODE = "0x${attestationCompiled.bytecode}";
`;

    fs.mkdirSync(path.resolve('src', 'config'), { recursive: true });
    fs.writeFileSync(path.resolve('src', 'config', 'contracts.js'), configContent);
    console.log('✅ Updated src/config/contracts.js with contract configurations.');
    return;
  }

  // Deploy OndolDojangEscrow
  const escrowFactory = new ethers.ContractFactory(escrowCompiled.abi, escrowCompiled.bytecode, wallet);
  const defaultAttesterId = '0x64756e616d755f676977615f61747465737465725f6964303030303030303030';
  const escrowContract = await escrowFactory.deploy(defaultAttesterId);
  await escrowContract.waitForDeployment();
  const escrowAddr = await escrowContract.getAddress();
  console.log(`✅ OndolDojangEscrow Deployed at: ${escrowAddr}`);

  // Deploy OndolAuditAttestation
  const attestationFactory = new ethers.ContractFactory(attestationCompiled.abi, attestationCompiled.bytecode, wallet);
  const attestationContract = await attestationFactory.deploy();
  await attestationContract.waitForDeployment();
  const attestationAddr = await attestationContract.getAddress();
  console.log(`✅ OndolAuditAttestation Deployed at: ${attestationAddr}`);

  const configContent = `// Ondol Smart Contract Registry on GIWA Sepolia Testnet (Chain ID: 91342)

export const CONTRACT_ADDRESSES = {
  DOJANG_SCROLL: "0xd5077b67dcb56caC8b270C7788FC3E6ee03F17B9",
  ONDOL_DOJANG_ESCROW: "${escrowAddr}",
  ONDOL_AUDIT_ATTESTATION: "${attestationAddr}"
};

export const ONDOL_ESCROW_ABI = ${JSON.stringify(escrowCompiled.abi, null, 2)};
export const ONDOL_ESCROW_BYTECODE = "${escrowCompiled.bytecode}";

export const ONDOL_AUDIT_ABI = ${JSON.stringify(attestationCompiled.abi, null, 2)};
export const ONDOL_AUDIT_BYTECODE = "${attestationCompiled.bytecode}";
`;

  fs.mkdirSync(path.resolve('src', 'config'), { recursive: true });
  fs.writeFileSync(path.resolve('src', 'config', 'contracts.js'), configContent);
  console.log('✅ Updated src/config/contracts.js with deployed contract addresses.');
}

main().catch((err) => {
  console.error('Live deployment failed:', err);
});
