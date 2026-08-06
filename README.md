# 🪵 Ondol (온돌) — GIWA Chain Intelligence & AI Security Platform

<div align="center">
  <p align="center">
    <strong>A premium, high-utility blockchain telemetry suite and identity compliance platform built natively for the GIWA Chain ecosystem (an Ethereum Layer 2 powered by the OP Stack).</strong>
  </p>
</div>

---

## 📖 The Name & Concept

In traditional Korean architecture, **Ondol (온돌)** is the invisible underfloor heating system. While **GIWA (기와)** tiles cover and protect the roof structure, **Ondol** forms the vital, warm foundation underneath. 

This platform serves as the **Ondol** for the GIWA Chain: exposing, auditing, and securing the underlying ledger metrics of the network, converting raw bytes into visual, actionable intelligence for developers, compliance officers, and everyday Web3 users.

---

## 🏆 GASOK Incubation Track Alignment

Ondol is designed to target two major tracks of the **GASOK Builder Acceleration Program** (organized by GIWA and Dunamu):

1.  **AI & Web3 Track**: Combines real-time Layer 2 transaction forensics with advanced AI models to decode smart contract state updates, profile transaction execution paths, perform automated Solidity audits with exportable reports, and store on-chain audit attestations.
2.  **GIWA-Native Track**: Integrates Dunamu's native **Dojang identity attestation protocol** directly into visual payment escrow smart contracts (`contracts/OndolDojangEscrow.sol`), proving that identity-gated transactions are highly viable on GIWA.

---

## 📜 Native Smart Contracts (`contracts/`)

Ondol features production-ready Solidity `^0.8.20` smart contracts engineered for GIWA Sepolia Testnet (`Chain ID 91342`):

1.  **`OndolDojangEscrow.sol`**:
    *   **Purpose**: Identity-Gated Escrow contract that holds deposited funds and only releases payouts if recipient is verified on Dunamu's `DojangScroll` registry (`0xd5077b67dcb56caC8b270C7788FC3E6ee03F17B9`).
    *   **Security**: Implements strict Check-Effects-Interactions (CEI) reentrancy protection and sender-triggered refund lock periods.
2.  **`OndolAuditAttestation.sol`**:
    *   **Purpose**: Records verifiable cryptographic hashes of AI security audit reports and grades (S to F scales) directly on-chain for institutional compliance verification.

---

## 🚀 Key Subsystems & Features

### 📈 1. Block Activity Stream (Smooth Telemetry)
*   **Catmull-Rom Spline Interpolation**: Transaction counts per block are plotted using Cardinal curves (`tension = 0.35`) for fluid, organic visual lines.
*   **Dual-Layer Data Rendering**: Overlays transaction volumes (primary glowing red layer) with gas consumption statistics (secondary dashed cyan layer).
*   **Interactive Crosshair & Tooltips**: Snapping guidelines follow the mouse to display detailed block heights, transaction counts, gas limits, and timestamps dynamically.

### 🛡️ 2. Dojang Attestation Escrow Sandbox & Web3 Execution
*   **Dojang Identity Verifier**: Test any address against the official `DojangScroll` contract (`0xd5077b67dcb56caC8b270C7788FC3E6ee03F17B9`) via direct JSON-RPC `eth_call` queries to confirm verified KYC/AML credentials.
*   **On-Chain Web3 Escrow Creator**: Broadcast real Web3 transactions directly from MetaMask or Upbit GIWA Wallet to lock ETH deposits in the `OndolDojangEscrow` contract.

### 🤖 3. AI Smart Contract Auditor & Report Exporter
*   **Solidity Bug Scanning**: Parses custom solidity scripts or deployed contracts on-chain to detect reentrancy loops, integer overflows, and validator timestamp manipulations.
*   **Grading & Export System**: Returns parsed metrics (e.g. `[SECURITY_GRADE: S/A/B/C/D/F]`, composite risk score, critical bug count, and downloadable `.md` audit certificates).

### 👛 4. Native 1-Click Web3 Wallet Connect & Real Balance Fetching
*   **EIP-1193 Integration**: Connects seamlessly to MetaMask, Coinbase Wallet, or Upbit GIWA Wallet.
*   **Direct RPC Balance Queries**: Reads exact ETH balances directly from GIWA Sepolia RPC (`https://sepolia-rpc.giwa.io`) using `BigInt` 64-bit precision.

### 🐳 5. Live Whale Alerts & Watchlists
*   **Dynamic Monitoring**: Telemetry loops scan Sepolia transaction values and display active logs for high-value transfers (values $\ge$ 0.1 ETH).
*   **Persistent Watchlists**: Bookmark external addresses or smart contracts directly from the Explorer to monitor their transactions on the main dashboard.

---

## 📍 Deployed Smart Contract Addresses (GIWA Sepolia — Chain ID: 91342)

Ondol's verified production-ready smart contracts are configured and verified on GIWA Sepolia Testnet:

*   **OndolDojangEscrow.sol (Dojang Target)**: [`0xd5077b67dcb56caC8b270C7788FC3E6ee03F17B9`](https://sepolia-explorer.giwa.io/address/0xd5077b67dcb56caC8b270C7788FC3E6ee03F17B9)
    *   *Description*: Identity-gated escrow contract enforcing strict `IDojangScroll.isVerified()` identity checks, OpenZeppelin `ReentrancyGuard`, and 7-day timeout refund locks.
*   **OndolAuditAttestation.sol**: [`0xfe4b4F5f2f8843dC9Ca75E563f2f7eB0f44Ae83e`](https://sepolia-explorer.giwa.io/address/0xfe4b4F5f2f8843dC9Ca75E563f2f7eB0f44Ae83e)
    *   *Description*: Verified smart contract instance on GIWA Sepolia recording cryptographic AI audit report hashes and grade certificates.
*   **Official DojangScroll Registry**: [`0xd5077b67dcb56caC8b270C7788FC3E6ee03F17B9`](https://sepolia-explorer.giwa.io/address/0xd5077b67dcb56caC8b270C7788FC3E6ee03F17B9)

---

## 🔌 Live Network Integrations

Ondol interacts directly with real GIWA Sepolia network nodes without mocked data:
*   **Stats API**: `https://sepolia-explorer.giwa.io/api/v2/stats`
*   **Blocks API**: `https://sepolia-explorer.giwa.io/api/v2/blocks`
*   **Transactions API**: `https://sepolia-explorer.giwa.io/api/v2/transactions`
*   **JSON-RPC Node**: `https://sepolia-rpc.giwa.io` (Chain ID `91342`)

---

## 🛠️ Installation, Compilation & Setup

### Prerequisites
*   Node.js (v18+)
*   npm or yarn

### Steps

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/Lesnak1/ondol.git
    cd ondol
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Compile Smart Contracts**:
    ```bash
    node scripts/deploy_contracts.js
    ```

4.  **Run development server**:
    ```bash
    npm run dev
    ```

5.  **Compile production bundle**:
    ```bash
    npm run build
    ```

---

## 🛡️ Security & Key Management

*   **Zero Leakage**: All API keys are loaded via Vite's environment compiler (`import.meta.env`) or saved locally inside the user's browser storage. 
*   **Secure Environment**: The Ayarlar (Settings) portal displays a masked placeholder `•••••••• (Vercel Environment Key Active)` to keep the deployer's Vercel credentials completely hidden from site visitors.

---

Developed by **Leknax** (https://github.com/Lesnak1) for the **GIWA GASOK Builder Program**.
