// Ondol Smart Contract Registry on GIWA Sepolia Testnet (Chain ID: 91342)

export const CONTRACT_ADDRESSES = {
  // Official Dunamu Dojang Registry on GIWA Sepolia Testnet
  DOJANG_SCROLL_OFFICIAL: "0xd5077b67dcb56caC8b270C7788FC3E6ee03F17B9",
  
  // Ondol Native Contracts (Pending live transaction deployment broadcast)
  ONDOL_DOJANG_ESCROW: "", // Set after node scripts/deploy_live_giwa.js with DEPLOYER_PRIVATE_KEY
  ONDOL_AUDIT_ATTESTATION: "" // Set after node scripts/deploy_live_giwa.js with DEPLOYER_PRIVATE_KEY
};

export const ONDOL_ESCROW_ABI = [
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "_attesterId",
        "type": "bytes32"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "recipient",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "EscrowCreated",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_recipient",
        "type": "address"
      }
    ],
    "name": "createEscrow",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_id",
        "type": "uint256"
      }
    ],
    "name": "releaseOnlyIfVerified",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_id",
        "type": "uint256"
      }
    ],
    "name": "refund",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

export const ONDOL_AUDIT_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_targetContract",
        "type": "address"
      },
      {
        "internalType": "uint8",
        "name": "_gradeScore",
        "type": "uint8"
      },
      {
        "internalType": "uint16",
        "name": "_riskScore",
        "type": "uint16"
      },
      {
        "internalType": "uint32",
        "name": "_criticalBugs",
        "type": "uint32"
      },
      {
        "internalType": "string",
        "name": "_reportIpfsHash",
        "type": "string"
      }
    ],
    "name": "recordAudit",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];
