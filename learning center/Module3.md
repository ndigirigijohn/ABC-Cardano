# Module 3: Transactions & Off-Chain Code

In this module, you'll bridge the gap between on-chain smart contracts and off-chain applications. You'll learn how to build, sign, and submit transactions to the Cardano blockchain, integrate wallets into web applications, and create comprehensive user interfaces for your dApps.

![Transactions and Off-Chain Integration](https://placehold.co/600x400)

## Module Structure

### 3.1 [Transaction Building with cardano-cli](#31-transaction-building-with-cardano-cli)
- [Transaction Architecture](#transaction-architecture)
- [Installing cardano-cli](#installing-cardano-cli)
- [Network Configuration](#network-configuration)
- [Simple Payment Transaction](#simple-payment-transaction)
- [Script Transactions](#script-transactions)
- [Transaction Metadata](#transaction-metadata)
- [Key Resources](#key-resources)

### 3.2 [Off-Chain Development with Mesh SDK](#32-off-chain-development-with-mesh-sdk)
- [Mesh SDK Overview](#mesh-sdk-overview)
- [Setting Up Mesh SDK](#setting-up-mesh-sdk)
- [Wallet Integration](#wallet-integration)
- [Building Transactions](#building-transactions)
- [Smart Contract Interactions](#smart-contract-interactions)
- [Data Fetching and Queries](#data-fetching-and-queries)
- [Key Resources](#key-resources-1)

### 3.3 [Backend Integration](#33-backend-integration)
- [Backend Architecture](#backend-architecture)
- [Setting Up a Node.js Backend](#setting-up-a-nodejs-backend)
- [Blockchain API Services](#blockchain-api-services)
- [Transaction Handling Service](#transaction-handling-service)
- [Webhook and Notification Systems](#webhook-and-notification-systems)
- [Key Resources](#key-resources-2)

### 3.4 [Smart Contract Deployment](#34-smart-contract-deployment)
- [Preparing Contracts for Deployment](#preparing-contracts-for-deployment)
- [Understanding Script References](#understanding-script-references)
- [Deploying Reference Scripts](#deploying-reference-scripts)
- [Using Reference Scripts](#using-reference-scripts)
- [Deployment with Mesh SDK](#deployment-with-mesh-sdk)
- [Version Control and Upgrades](#version-control-and-upgrades)
- [Deployment Best Practices](#deployment-best-practices)
- [Key Resources](#key-resources-3)

### 3.5 [Frontend Integration Patterns](#35-frontend-integration-patterns)
- [Component Architecture](#component-architecture)
- [State Management](#state-management)
- [Transaction Feedback Flow](#transaction-feedback-flow)
- [Error Handling Strategies](#error-handling-strategies)
- [Mobile Responsiveness](#mobile-responsiveness)
- [Key Resources](#key-resources-4)

### [Practice Exercises](#practice-exercises)
- [Transaction Building](#transaction-building)
- [Wallet Integration](#wallet-integration-1)
- [Backend Development](#backend-development)
- [Smart Contract Deployment](#smart-contract-deployment)
- [Extended Challenge](#extended-challenge)

### [Next Steps](#next-steps)

### [Additional Resources](#additional-resources)

## 3.1 Transaction Building with cardano-cli

Before diving into developer frameworks, it's essential to understand how Cardano transactions are constructed at a fundamental level using cardano-cli.

### Transaction Architecture

A Cardano transaction consists of these key components:

**Transaction Body**:
- Inputs (UTXOs to consume)
- Outputs (new UTXOs to create)
- Fee
- Time-to-live (validity interval)
- Metadata (optional)
- Certificates (optional)
- Withdrawals (optional)
- Mint/burn values (optional)
- Script requirements (optional)

**Witness Set**:
- Signatures for key-based inputs
- Script data for script-based inputs
- Redeemers and execution costs

**Transaction Metadata** (auxiliary data):
- User-defined JSON metadata
- Native script metadata
- Plutus script metadata

![Transaction Structure](https://placehold.co/600x400)

### Installing cardano-cli

If you haven't already, you'll need to install cardano-cli:

```bash
# For Ubuntu/Debian
sudo apt update
sudo apt install -y curl libsodium-dev
curl -O -L https://hydra.iohk.io/build/7370192/download/1/cardano-node-1.35.0-linux.tar.gz
tar -xf cardano-node-1.35.0-linux.tar.gz
sudo mv cardano-cli /usr/local/bin/

# For macOS
brew install cardano-cli

# For Windows
# Download the Windows binary from IOHK and add to PATH
```

Verify installation:
```bash
cardano-cli --version
```

### Network Configuration

To interact with the Cardano network, you need to specify the network:

```bash
# Set the environment variable for testnet
export CARDANO_NETWORK="--testnet-magic 1"

# For mainnet (once you're ready)
# export CARDANO_NETWORK="--mainnet"
```

### Simple Payment Transaction

Let's start with a basic payment transaction:

```bash
# Step 1: Get protocol parameters
cardano-cli query protocol-parameters \
  $CARDANO_NETWORK \
  --out-file protocol.json

# Step 2: Get UTXOs from source address
cardano-cli query utxo \
  $CARDANO_NETWORK \
  --address addr_test1vz2uw... \
  --out-file utxos.json

# Step 3: Build transaction
cardano-cli transaction build-raw \
  --tx-in "tx_hash#index" \
  --tx-out "addr_test1vz2uw...+1500000" \
  --tx-out "addr_test1vr8w0...+3400000" \
  --invalid-hereafter 16845101 \
  --fee 165201 \
  --out-file tx.raw

# Step 4: Calculate fees
cardano-cli transaction calculate-min-fee \
  --tx-body-file tx.raw \
  --tx-in-count 1 \
  --tx-out-count 2 \
  --witness-count 1 \
  $CARDANO_NETWORK \
  --protocol-params-file protocol.json

# Step 5: Rebuild with correct fee
cardano-cli transaction build-raw \
  --tx-in "tx_hash#index" \
  --tx-out "addr_test1vz2uw...+1500000" \
  --tx-out "addr_test1vr8w0...+3400000" \
  --invalid-hereafter 16845101 \
  --fee 165201 \
  --out-file tx.raw

# Step 6: Sign the transaction
cardano-cli transaction sign \
  --tx-body-file tx.raw \
  --signing-key-file payment.skey \
  $CARDANO_NETWORK \
  --out-file tx.signed

# Step 7: Submit the transaction
cardano-cli transaction submit \
  --tx-file tx.signed \
  $CARDANO_NETWORK
```

This process shows the typical workflow for creating, signing, and submitting a transaction.

### Script Transactions

Interacting with smart contracts requires more complex transactions:

```bash
# Step 1: Get protocol parameters and UTXOs (same as above)

# Step 2: Create datum file
echo '{"constructor":0,"fields":[{"bytes":"deadbeef"},{"int":1683559425}]}' > datum.json

# Step 3: Create redeemer file
echo '{"constructor":0,"fields":[]}' > redeemer.json

# Step 4: Build transaction with script
cardano-cli transaction build \
  --tx-in "tx_hash#index" \
  --tx-in-script-file vesting.plutus \
  --tx-in-datum-file datum.json \
  --tx-in-redeemer-file redeemer.json \
  --tx-in-collateral "collateral_tx_hash#index" \
  --required-signer-hash "pubkey_hash" \
  --tx-out "addr_test1vz2uw...+1500000" \
  --change-address "addr_test1vr8w0..." \
  --invalid-hereafter 16845101 \
  $CARDANO_NETWORK \
  --protocol-params-file protocol.json \
  --out-file tx.raw

# Steps 5-7: Same as basic transaction (sign and submit)
```

Key additions for script transactions:
- Script file (`--tx-in-script-file`)
- Datum and redeemer files
- Collateral input (returned if script succeeds, consumed if it fails)
- Required signer (for signature validation)

### Transaction Metadata

Adding metadata to transactions:

```bash
# Create metadata file
echo '{
  "674": {
    "msg": "Hello from Cardano Learning Center",
    "version": "1.0.0"
  }
}' > metadata.json

# Add to transaction build command
cardano-cli transaction build \
  # ... other parameters ...
  --metadata-json-file metadata.json \
  --out-file tx.raw
```

Metadata allows storing additional information on-chain, useful for applications requiring data availability.

### Key Resources:
- [Cardano CLI Documentation](https://developers.cardano.org/docs/stake-pool-course/handbook/cardano-cli/)
- [Transaction Structure Reference](https://docs.cardano.org/new-to-cardano/cardano-transactions/)
- [Metadata Standards](https://cips.cardano.org/cips/cip20/)

## 3.2 Off-Chain Development with Mesh SDK

While cardano-cli provides fine-grained control, Mesh SDK offers a more developer-friendly approach for JavaScript/TypeScript applications.

### Mesh SDK Overview

Mesh SDK is a comprehensive library for building Cardano applications:

**Core Features**:
- Wallet integration (CIP-30 compatible)
- Transaction building and submission
- Asset management
- Smart contract interaction
- Stake pool operations
- GraphQL API for chain queries

![Mesh SDK Architecture](https://placehold.co/600x400)

### Setting Up Mesh SDK

To get started with Mesh SDK:

```bash
# Create a new project
mkdir my-cardano-app
cd my-cardano-app

# Initialize npm and install dependencies
npm init -y
npm install @meshsdk/core @meshsdk/react
```

Basic project structure:
```
my-cardano-app/
├── node_modules/
├── public/
├── src/
│   ├── components/
│   │   └── WalletConnect.tsx
│   ├── App.tsx
│   └── index.tsx
├── package.json
└── tsconfig.json
```

### Wallet Integration

Mesh SDK simplifies connecting to Cardano wallets:

```tsx
// src/components/WalletConnect.tsx
import { CardanoWallet, useWallet } from '@meshsdk/react';
import { useState, useEffect } from 'react';

export default function WalletConnect() {
  const { connected, wallet } = useWallet();
  const [assets, setAssets] = useState<null | any[]>(null);
  
  useEffect(() => {
    async function getAssets() {
      if (connected) {
        const walletAssets = await wallet.getAssets();
        setAssets(walletAssets);
      }
    }
    getAssets();
  }, [connected, wallet]);
  
  return (
    <div>
      <CardanoWallet />
      
      {connected && assets && (
        <div>
          <h2>Your Assets</h2>
          <ul>
            {assets.map((asset, i) => (
              <li key={i}>
                {asset.quantity} {asset.unit === 'lovelace' ? 'ADA' : asset.unit}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

Implementing this in your main app:

```tsx
// src/App.tsx
import { MeshProvider } from '@meshsdk/react';
import WalletConnect from './components/WalletConnect';

function App() {
  return (
    <MeshProvider>
      <div className="App">
        <header>
          <h1>My Cardano dApp</h1>
        </header>
        <main>
          <WalletConnect />
        </main>
      </div>
    </MeshProvider>
  );
}

export default App;
```

### Building Transactions

Creating transactions with Mesh SDK:

```tsx
import { Transaction } from '@meshsdk/core';
import { useWallet } from '@meshsdk/react';

export default function SendTransaction() {
  const { connected, wallet } = useWallet();
  
  async function sendAda() {
    if (!connected) return;
    
    // Define transaction details
    const recipientAddress = 'addr_test1...';
    const adaAmount = '1.5'; // in ADA
    
    // Build the transaction
    const tx = new Transaction({ initiator: wallet })
      .sendLovelace(
        recipientAddress,
        adaAmount
      );
    
    // Sign and submit the transaction
    const signedTx = await tx.build();
    const txHash = await wallet.submitTx(signedTx);
    
    console.log('Transaction submitted:', txHash);
  }
  
  return (
    <div>
      <button 
        onClick={sendAda}
        disabled={!connected}
      >
        Send 1.5 ADA
      </button>
    </div>
  );
}
```

### Smart Contract Interactions

Interacting with Aiken smart contracts:

```tsx
import { Transaction, ForgeScript, AssetMetadata } from '@meshsdk/core';
import { useWallet } from '@meshsdk/react';
import { useState } from 'react';

export default function ContractInteraction() {
  const { connected, wallet } = useWallet();
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  
  // Function to mint an NFT
  async function mintNFT() {
    if (!connected) return;
    setLoading(true);
    
    try {
      // Load the minting policy
      const mintingPolicy = {
        type: 'PlutusV2',
        script: '<your compiled minting policy script>'
      };
      
      // Prepare the forge script
      const forgeScript = ForgeScript.withMintingPolicy(mintingPolicy);
      
      // Asset metadata following CIP-25
      const assetMetadata: AssetMetadata = {
        name: 'My First NFT',
        image: 'ipfs://QmRzcxSU9SWexNZJ1C2SLKXRPJnHm4u6RUG1gkY36vSwpV',
        mediaType: 'image/png',
        description: 'This is my first NFT minted with Mesh SDK'
      };
      
      // Asset details
      const assetName = 'MyNFT001';
      const quantity = '1';
      
      // Build the transaction
      const tx = new Transaction({ initiator: wallet });
      
      // Define assets to mint
      const asset = {
        assetName: assetName,
        assetQuantity: quantity,
        metadata: assetMetadata,
        label: '721',
        recipient: await wallet.getChangeAddress(),
      };
      
      // Add minting to transaction
      tx.mintAsset(
        forgeScript,
        asset
      );
      
      // Set any additional parameters (redeemers, etc.)
      
      // Build, sign and submit the transaction
      const unsignedTx = await tx.build();
      const signedTx = await wallet.signTx(unsignedTx, true);
      const txHash = await wallet.submitTx(signedTx);
      
      setTxHash(txHash);
    } catch (error) {
      console.error('Error minting NFT:', error);
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <div>
      <button 
        onClick={mintNFT}
        disabled={!connected || loading}
      >
        {loading ? 'Processing...' : 'Mint NFT'}
      </button>
      
      {txHash && (
        <div>
          <p>Transaction submitted!</p>
          <a href={`https://preview.cardanoscan.io/transaction/${txHash}`} target="_blank" rel="noopener noreferrer">
            View on Explorer
          </a>
        </div>
      )}
    </div>
  );
}
```

### Data Fetching and Queries

Retrieving blockchain data:

```tsx
import { BrowserProvider } from '@meshsdk/core';
import { useState, useEffect } from 'react';

export default function BlockchainData() {
  const [latestBlock, setLatestBlock] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchData() {
      try {
        const provider = new BrowserProvider('preprod');
        
        // Get the latest block
        const block = await provider.getLatestBlock();
        setLatestBlock(block);
      } catch (error) {
        console.error('Error fetching blockchain data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);
  
  return (
    <div>
      <h2>Blockchain Data</h2>
      
      {loading ? (
        <p>Loading...</p>
      ) : latestBlock ? (
        <div>
          <h3>Latest Block</h3>
          <p>Block #: {latestBlock.block_no}</p>
          <p>Hash: {latestBlock.hash}</p>
          <p>Time: {new Date(latestBlock.time * 1000).toLocaleString()}</p>
          <p>Transactions: {latestBlock.tx_count}</p>
        </div>
      ) : (
        <p>Failed to load blockchain data</p>
      )}
    </div>
  );
}
```

### Key Resources:
- [Mesh SDK Documentation](https://meshjs.dev/)
- [Mesh SDK GitHub](https://github.com/MeshJS/mesh)
- [CIP-30 Wallet Standard](https://cips.cardano.org/cips/cip30/)
- [React Integration Guide](https://meshjs.dev/react/getting-started)

## 3.3 Backend Integration

While frontend components handle user interactions, backend services provide additional functionality and security for Cardano applications.

### Backend Architecture

A typical Cardano dApp backend includes:

**Components**:
- API server (Node.js/Express)
- Blockchain data provider integration
- Transaction construction service
- Metadata handling
- Monitoring and analytics
- Authentication (optional)

![Backend Architecture](https://placehold.co/600x400)

### Setting Up a Node.js Backend

Create a basic Express server for Cardano integration:

```bash
# Create project and install dependencies
mkdir cardano-backend
cd cardano-backend
npm init -y
npm install express cors dotenv @meshsdk/core blockfrost-js
```

Server setup:
```js
// server.js
const express = require('express');
const cors = require('cors');
const { BlockFrostAPI } = require('@blockfrost/blockfrost-js');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Blockfrost client
const blockfrost = new BlockFrostAPI({
  projectId: process.env.BLOCKFROST_PROJECT_ID,
  network: 'preprod', // or 'mainnet', 'preview'
});

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Get address details
app.get('/api/address/:address', async (req, res) => {
  try {
    const address = req.params.address;
    const addressInfo = await blockfrost.addresses(address);
    const utxos = await blockfrost.addressesUtxos(address);
    
    res.json({
      address: addressInfo,
      utxos: utxos
    });
  } catch (error) {
    console.error('Error fetching address:', error);
    res.status(500).json({ error: 'Failed to fetch address data' });
  }
});

// Get transaction details
app.get('/api/transaction/:hash', async (req, res) => {
  try {
    const hash = req.params.hash;
    const txInfo = await blockfrost.txs(hash);
    const utxos = await blockfrost.txsUtxos(hash);
    const metadata = await blockfrost.txsMetadata(hash);
    
    res.json({
      transaction: txInfo,
      utxos: utxos,
      metadata: metadata
    });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ error: 'Failed to fetch transaction data' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
```

### Blockchain API Services

Several services provide APIs for Cardano blockchain data:

**Blockfrost**:
- RESTful API for Cardano data
- Transaction submission
- Asset information
- Address tracking
- IPFS integration

Example Blockfrost usage:
```js
const { BlockFrostAPI } = require('@blockfrost/blockfrost-js');

// Initialize with project ID (sign up at blockfrost.io)
const blockfrost = new BlockFrostAPI({
  projectId: 'your-project-id',
  network: 'preprod',
});

async function getAddressInfo(address) {
  try {
    // Get basic address info
    const addressInfo = await blockfrost.addresses(address);
    
    // Get UTXOs at address
    const utxos = await blockfrost.addressesUtxos(address);
    
    // Get transaction history
    const txs = await blockfrost.addressesTransactions(address, { order: 'desc' });
    
    return {
      info: addressInfo,
      utxos: utxos,
      transactions: txs
    };
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
```

**Maestro**:
- High-performance Cardano API
- Real-time data streaming
- Advanced analytics
- Smart contract monitoring

Example Maestro usage:
```js
const axios = require('axios');

const maestroApi = axios.create({
  baseURL: 'https://api.gomaestro.org/v1',
  headers: {
    'Accept': 'application/json',
    'api-key': 'your-maestro-api-key'
  }
});

async function getAddressInfo(address) {
  try {
    const response = await maestroApi.get(`/addresses/${address}`);
    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
```

### Transaction Handling Service

Creating a transaction service for your backend:

```js
// services/transactionService.js
const { Transaction } = require('@meshsdk/core');
const blockfrost = require('./blockfrostClient');

// Create a payment transaction
async function createPaymentTransaction(senderAddresses, receiverAddress, lovelaceAmount) {
  try {
    // Fetch UTXOs for sender
    const utxos = await blockfrost.addressesUtxos(senderAddresses[0]);
    
    // Create transaction builder
    const tx = new Transaction({ network: 'preprod' });
    
    // Add inputs
    tx.setTxInputs(utxos);
    
    // Add output
    tx.sendLovelace(receiverAddress, lovelaceAmount.toString());
    
    // Set change address
    tx.setChangeAddress(senderAddresses[0]);
    
    // Build transaction (unsigned)
    const unsignedTx = await tx.build();
    
    return unsignedTx;
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
}

// Broadcast signed transaction
async function submitTransaction(signedTx) {
  try {
    const result = await blockfrost.txSubmit(signedTx);
    return result;
  } catch (error) {
    console.error('Error submitting transaction:', error);
    throw error;
  }
}

module.exports = {
  createPaymentTransaction,
  submitTransaction
};
```

Expose as API endpoint:
```js
// Add to server.js
const transactionService = require('./services/transactionService');

// Create transaction
app.post('/api/transaction/create', async (req, res) => {
  try {
    const { senderAddresses, receiverAddress, lovelaceAmount } = req.body;
    
    // Validate inputs
    if (!senderAddresses || !receiverAddress || !lovelaceAmount) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    const unsignedTx = await transactionService.createPaymentTransaction(
      senderAddresses,
      receiverAddress,
      lovelaceAmount
    );
    
    res.json({ unsignedTx });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

// Submit transaction
app.post('/api/transaction/submit', async (req, res) => {
  try {
    const { signedTx } = req.body;
    
    if (!signedTx) {
      return res.status(400).json({ error: 'Missing signed transaction' });
    }
    
    const result = await transactionService.submitTransaction(signedTx);
    
    res.json({ result });
  } catch (error) {
    console.error('Error submitting transaction:', error);
    res.status(500).json({ error: 'Failed to submit transaction' });
  }
});
```

### Webhook and Notification Systems

Setting up notifications for blockchain events:

```js
// services/notificationService.js
const WebSocket = require('ws');
const EventEmitter = require('events');
const blockfrostClient = require('./blockfrostClient');

class BlockchainMonitor extends EventEmitter {
  constructor() {
    super();
    this.trackedAddresses = new Set();
    this.trackedAssets = new Set();
    this.lastBlockHeight = 0;
    this.pollInterval = 30000; // 30 seconds
    this.intervalId = null;
  }
  
  // Start monitoring
  start() {
    this.intervalId = setInterval(async () => {
      await this.checkForUpdates();
    }, this.pollInterval);
    
    console.log('Blockchain monitor started');
  }
  
  // Stop monitoring
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    console.log('Blockchain monitor stopped');
  }
  
  // Track an address
  trackAddress(address) {
    this.trackedAddresses.add(address);
    console.log(`Now tracking address: ${address}`);
  }
  
  // Track an asset
  trackAsset(policyId, assetName) {
    const assetId = `${policyId}${assetName ? '.' + assetName : ''}`;
    this.trackedAssets.add(assetId);
    console.log(`Now tracking asset: ${assetId}`);
  }
  
  // Check for updates
  async checkForUpdates() {
    try {
      // Get latest block
      const latestBlock = await blockfrostClient.blocksLatest();
      
      // Skip if we've already processed this block
      if (latestBlock.height <= this.lastBlockHeight) {
        return;
      }
      
      console.log(`New block: ${latestBlock.height}`);
      
      // Get blocks since last check
      const blocks = await this.getBlocksSince(this.lastBlockHeight);
      
      // Process each block
      for (const block of blocks) {
        await this.processBlock(block);
      }
      
      // Update last block height
      this.lastBlockHeight = latestBlock.height;
    } catch (error) {
      console.error('Error checking for updates:', error);
    }
  }
  
  // Get blocks since height
  async getBlocksSince(height) {
    // Implementation depends on your API provider
    // For Blockfrost, you'd iterate through blocks in descending order
    return []; // Placeholder
  }
  
  // Process a block
  async processBlock(block) {
    try {
      // Get transactions in block
      const txs = await blockfrostClient.blocksTxs(block.hash);
      
      // Process each transaction
      for (const txHash of txs) {
        await this.processTransaction(txHash);
      }
    } catch (error) {
      console.error(`Error processing block ${block.hash}:`, error);
    }
  }
  
  // Process a transaction
  async processTransaction(txHash) {
    try {
      // Get transaction details
      const tx = await blockfrostClient.txs(txHash);
      const utxos = await blockfrostClient.txsUtxos(txHash);
      
      // Check for tracked addresses
      for (const output of utxos.outputs) {
        if (this.trackedAddresses.has(output.address)) {
          this.emit('addressTransaction', {
            address: output.address,
            txHash: txHash,
            amount: output.amount
          });
        }
      }
      
      // Check for tracked assets
      // Implementation depends on your needs
      
    } catch (error) {
      console.error(`Error processing transaction ${txHash}:`, error);
    }
  }
}

// Create singleton instance
const monitor = new BlockchainMonitor();

// Export service
module.exports = monitor;
```

Using the notification service:
```js
// Add to server.js
const monitor = require('./services/notificationService');

// Start monitoring on server start
monitor.start();

// Set up websocket for real-time notifications
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Client connected');
  
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    
    if (data.type === 'trackAddress') {
      monitor.trackAddress(data.address);
    } else if (data.type === 'trackAsset') {
      monitor.trackAsset(data.policyId, data.assetName);
    }
  });
  
  // Forward events to websocket clients
  monitor.on('addressTransaction', (data) => {
    ws.send(JSON.stringify({
      type: 'addressTransaction',
      data: data
    }));
  });
});
```

### Key Resources:
- [Blockfrost API](https://blockfrost.io/)
- [Maestro API](https://www.gomaestro.org/dapp-platform)
- [Koios API](https://api.koios.rest/)
- [Cardano Serialization Library](https://github.com/Emurgo/cardano-serialization-lib)

## 3.4 Smart Contract Deployment

After developing and testing your Aiken contracts, you need to deploy them to the Cardano blockchain.

### Preparing Contracts for Deployment

Before deployment, compile your Aiken contracts:

```bash
# From your Aiken project directory
aiken build
```

This generates Plutus scripts in the `build` directory, ready for on-chain deployment.

### Understanding Script References

Cardano supports two ways to use scripts in transactions:

**Inline Scripts**:
- Script is included directly in the transaction
- Larger transaction size and higher fees
- Every transaction using the script must include the full script

**Reference Scripts**:
- Script is stored on-chain at a specific UTXO
- Transactions reference the script instead of including it
- Lower fees for transactions using the script
- Better for frequently used contracts

### Deploying Reference Scripts

Deploy a script as a reference script:

```bash
# Assume you have payment.addr and payment.skey files

# Step 1: Get UTXOs from your address
cardano-cli query utxo \
  $CARDANO_NETWORK \
  --address $(cat payment.addr) \
  --out-file utxos.json

# Step 2: Build transaction with reference script
cardano-cli transaction build \
  --tx-in "tx_hash#index" \
  --tx-out "$(cat payment.addr)+2000000" \
  --tx-out-reference-script-file build/validators/vesting.plutus \
  --change-address "$(cat payment.addr)" \
  $CARDANO_NETWORK \
  --out-file tx.raw

# Step 3: Sign the transaction
cardano-cli transaction sign \
  --tx-body-file tx.raw \
  --signing-key-file payment.skey \
  $CARDANO_NETWORK \
  --out-file tx.signed

# Step 4: Submit the transaction
cardano-cli transaction submit \
  --tx-file tx.signed \
  $CARDANO_NETWORK
```

After submission, the script is stored on-chain and can be referenced by other transactions.

### Using Reference Scripts

To use a reference script in a transaction:

```bash
# Build transaction with reference script
cardano-cli transaction build \
  --tx-in "tx_hash#index" \
  --tx-in-script-file vesting.plutus \
  --tx-in-datum-file datum.json \
  --tx-in-redeemer-file redeemer.json \
  --tx-in-collateral "collateral_tx_hash#index" \
  --tx-in-reference-script-tx-in "reference_script_tx_hash#index" \
  --required-signer-hash "pubkey_hash" \
  --tx-out "addr_test1vz2uw...+1500000" \
  --change-address "addr_test1
  --change-address "addr_test1vr8w0..." \
  --invalid-hereafter 16845101 \
  $CARDANO_NETWORK \
  --protocol-params-file protocol.json \
  --out-file tx.raw
```

The key difference is the addition of `--tx-in-reference-script-tx-in` which points to the UTXO containing the reference script.

### Deployment with Mesh SDK

For a more programmatic approach, you can deploy contracts using Mesh SDK:

```typescript
import { Transaction } from '@meshsdk/core';
import fs from 'fs';

async function deployReferenceScript(wallet, scriptPath) {
  try {
    // Read compiled script
    const scriptCbor = fs.readFileSync(scriptPath, 'utf8');
    
    // Build transaction
    const tx = new Transaction({ initiator: wallet });
    
    // Add reference script output
    const walletAddress = await wallet.getChangeAddress();
    tx.addReferenceScript(
      walletAddress,
      {
        type: 'PlutusV2',
        script: scriptCbor
      },
      '2000000' // Amount in lovelace (2 ADA)
    );
    
    // Build, sign and submit
    const unsignedTx = await tx.build();
    const signedTx = await wallet.signTx(unsignedTx);
    const txHash = await wallet.submitTx(signedTx);
    
    console.log('Reference script deployed:', txHash);
    return txHash;
  } catch (error) {
    console.error('Error deploying reference script:', error);
    throw error;
  }
}
```

### Version Control and Upgrades

Smart contracts on Cardano are immutable once deployed, so consider these strategies for upgrades:

**Parameterization**:
- Design contracts with parameters that can be adjusted
- Deploy different instances with updated parameters

**Proxy Pattern**:
- Deploy a simple "router" contract that points to the current implementation
- Update the pointer when deploying new versions

**Governance Mechanisms**:
- Include on-chain voting for contract upgrades
- Allow stakeholders to approve changes

### Deployment Best Practices

Follow these guidelines for successful deployments:

1. **Thorough Testing**:
   - Test all scenarios in development environment
   - Use property-based testing for edge cases
   - Perform formal verification where possible

2. **Security Audit**:
   - Review code for common vulnerabilities
   - Consider professional audit for high-value contracts
   - Use static analysis tools

3. **Deployment Checklist**:
   - Verify compiler version and flags
   - Double-check script hash matches expected value
   - Start with small value transactions
   - Monitor initial usage carefully

4. **Documentation**:
   - Document all contract addresses and script hashes
   - Provide clear instructions for interaction
   - Explain expected behavior and failure modes

![Deployment Workflow](https://placehold.co/600x400)

### Key Resources:
- [Reference Scripts Documentation](https://docs.cardano.org/plutus/reference-scripts)
- [Deployment Security Checklist](https://developers.cardano.org/docs/governance/cardano-improvement-proposals/security-considerations)
- [Plutus Contract Lifecycle](https://iohk.io/en/blog/posts/2021/04/13/plutus-what-you-need-to-know/)

## 3.5 Frontend Integration Patterns

Creating effective user interfaces for Cardano dApps requires specific patterns to handle blockchain interactions.

### Component Architecture

Organize your frontend components:

```
src/
├── components/
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Loading.tsx
│   ├── wallet/
│   │   ├── WalletConnect.tsx
│   │   ├── AssetDisplay.tsx
│   │   └── TransactionHistory.tsx
│   ├── contract/
│   │   ├── ContractForm.tsx
│   │   ├── ContractStatus.tsx
│   │   └── ContractInteraction.tsx
│   └── layout/
│       ├── Header.tsx
│       ├── Footer.tsx
│       └── Layout.tsx
├── hooks/
│   ├── useWalletBalance.ts
│   ├── useContractState.ts
│   └── useTransactionSubmit.ts
├── services/
│   ├── api.ts
│   ├── blockchain.ts
│   └── contracts.ts
└── utils/
    ├── formatters.ts
    ├── validators.ts
    └── transactions.ts
```

### State Management

Managing blockchain state effectively:

```tsx
// src/context/BlockchainContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWallet } from '@meshsdk/react';
import { BrowserProvider } from '@meshsdk/core';

interface BlockchainContextType {
  isLoading: boolean;
  latestBlock: any | null;
  walletAssets: any[] | null;
  refreshAssets: () => Promise<void>;
  refreshLatestBlock: () => Promise<void>;
}

const BlockchainContext = createContext<BlockchainContextType | undefined>(undefined);

export function BlockchainProvider({ children }: { children: ReactNode }) {
  const { connected, wallet } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [latestBlock, setLatestBlock] = useState<any | null>(null);
  const [walletAssets, setWalletAssets] = useState<any[] | null>(null);
  
  // Fetch latest block
  const refreshLatestBlock = async () => {
    try {
      setIsLoading(true);
      const provider = new BrowserProvider('preprod');
      const block = await provider.getLatestBlock();
      setLatestBlock(block);
    } catch (error) {
      console.error('Error fetching latest block:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch wallet assets
  const refreshAssets = async () => {
    if (!connected) return;
    
    try {
      setIsLoading(true);
      const assets = await wallet.getAssets();
      setWalletAssets(assets);
    } catch (error) {
      console.error('Error fetching wallet assets:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Initial data fetch
  useEffect(() => {
    refreshLatestBlock();
    const blockInterval = setInterval(refreshLatestBlock, 60000); // Every minute
    
    return () => clearInterval(blockInterval);
  }, []);
  
  // Fetch assets when wallet connects
  useEffect(() => {
    if (connected) {
      refreshAssets();
    } else {
      setWalletAssets(null);
    }
  }, [connected]);
  
  const value = {
    isLoading,
    latestBlock,
    walletAssets,
    refreshAssets,
    refreshLatestBlock
  };
  
  return (
    <BlockchainContext.Provider value={value}>
      {children}
    </BlockchainContext.Provider>
  );
}

export function useBlockchain() {
  const context = useContext(BlockchainContext);
  
  if (context === undefined) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }
  
  return context;
}
```

Using the context in your app:

```tsx
// src/App.tsx
import { MeshProvider } from '@meshsdk/react';
import { BlockchainProvider } from './context/BlockchainContext';
import Layout from './components/layout/Layout';

function App() {
  return (
    <MeshProvider>
      <BlockchainProvider>
        <Layout />
      </BlockchainProvider>
    </MeshProvider>
  );
}

export default App;
```

### Transaction Feedback Flow

Implement a user-friendly transaction flow:

```tsx
// src/components/TransactionFlow.tsx
import { useState } from 'react';
import { Transaction } from '@meshsdk/core';
import { useWallet } from '@meshsdk/react';
import { useBlockchain } from '../context/BlockchainContext';

enum TxStage {
  IDLE,
  BUILDING,
  SIGNING,
  SUBMITTING,
  CONFIRMING,
  COMPLETED,
  FAILED
}

export default function TransactionFlow() {
  const { connected, wallet } = useWallet();
  const { refreshAssets } = useBlockchain();
  const [txStage, setTxStage] = useState<TxStage>(TxStage.IDLE);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  async function sendTransaction() {
    if (!connected) return;
    
    try {
      // Reset state
      setTxStage(TxStage.BUILDING);
      setTxHash(null);
      setError(null);
      
      // Build transaction
      const recipientAddress = 'addr_test1...'; // Replace with actual address
      const adaAmount = '1.5';
      
      const tx = new Transaction({ initiator: wallet });
      tx.sendLovelace(recipientAddress, adaAmount);
      
      // Build the transaction
      setTxStage(TxStage.SIGNING);
      const unsignedTx = await tx.build();
      
      // Sign the transaction
      setTxStage(TxStage.SUBMITTING);
      const signedTx = await wallet.signTx(unsignedTx);
      
      // Submit the transaction
      const hash = await wallet.submitTx(signedTx);
      setTxHash(hash);
      setTxStage(TxStage.CONFIRMING);
      
      // Wait for confirmation (simplified)
      setTimeout(() => {
        setTxStage(TxStage.COMPLETED);
        refreshAssets();
      }, 10000);
    } catch (error) {
      console.error('Transaction error:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      setTxStage(TxStage.FAILED);
    }
  }
  
  // Render different UI based on transaction stage
  return (
    <div className="transaction-flow">
      <h2>Send Transaction</h2>
      
      {txStage === TxStage.IDLE && (
        <button 
          onClick={sendTransaction} 
          disabled={!connected}
        >
          Send 1.5 ADA
        </button>
      )}
      
      {txStage === TxStage.BUILDING && (
        <div className="status">
          <div className="spinner" />
          <p>Building transaction...</p>
        </div>
      )}
      
      {txStage === TxStage.SIGNING && (
        <div className="status">
          <div className="spinner" />
          <p>Please sign the transaction in your wallet...</p>
        </div>
      )}
      
      {txStage === TxStage.SUBMITTING && (
        <div className="status">
          <div className="spinner" />
          <p>Submitting transaction to blockchain...</p>
        </div>
      )}
      
      {txStage === TxStage.CONFIRMING && (
        <div className="status">
          <div className="spinner" />
          <p>Waiting for confirmation...</p>
          {txHash && (
            <a href={`https://preview.cardanoscan.io/transaction/${txHash}`} target="_blank" rel="noopener noreferrer">
              View on Explorer
            </a>
          )}
        </div>
      )}
      
      {txStage === TxStage.COMPLETED && (
        <div className="status success">
          <div className="check-icon" />
          <p>Transaction completed successfully!</p>
          {txHash && (
            <a href={`https://preview.cardanoscan.io/transaction/${txHash}`} target="_blank" rel="noopener noreferrer">
              View on Explorer
            </a>
          )}
          <button onClick={() => setTxStage(TxStage.IDLE)}>Send Another</button>
        </div>
      )}
      
      {txStage === TxStage.FAILED && (
        <div className="status error">
          <div className="error-icon" />
          <p>Transaction failed: {error}</p>
          <button onClick={() => setTxStage(TxStage.IDLE)}>Try Again</button>
        </div>
      )}
    </div>
  );
}
```

### Error Handling Strategies

Implement robust error handling:

```tsx
// src/utils/errorHandling.ts
export enum ErrorType {
  WALLET_CONNECTION,
  INSUFFICIENT_FUNDS,
  SCRIPT_FAILURE,
  NETWORK_ERROR,
  USER_REJECTED,
  UNKNOWN
}

interface ErrorMapping {
  type: ErrorType;
  message: string;
  suggestion: string;
}

export function classifyError(error: any): ErrorMapping {
  const message = error?.message || 'Unknown error occurred';
  
  // Wallet connection errors
  if (message.includes('wallet is not connected') || 
      message.includes('wallet not found')) {
    return {
      type: ErrorType.WALLET_CONNECTION,
      message: 'Unable to connect to wallet',
      suggestion: 'Please ensure your wallet is installed and unlocked'
    };
  }
  
  // Insufficient funds
  if (message.includes('UTXO Balance Insufficient') || 
      message.includes('insufficient funds')) {
    return {
      type: ErrorType.INSUFFICIENT_FUNDS,
      message: 'Insufficient funds for transaction',
      suggestion: 'Please ensure you have enough ADA to cover the transaction and fees'
    };
  }
  
  // Script validation failures
  if (message.includes('Script failure') || 
      message.includes('validation failed')) {
    return {
      type: ErrorType.SCRIPT_FAILURE,
      message: 'Smart contract validation failed',
      suggestion: 'Transaction does not meet the contract requirements'
    };
  }
  
  // Network issues
  if (message.includes('network error') || 
      message.includes('timeout') ||
      message.includes('failed to fetch')) {
    return {
      type: ErrorType.NETWORK_ERROR,
      message: 'Network connection issue',
      suggestion: 'Please check your internet connection and try again'
    };
  }
  
  // User rejected transaction
  if (message.includes('user declined') || 
      message.includes('rejected by user')) {
    return {
      type: ErrorType.USER_REJECTED,
      message: 'Transaction rejected',
      suggestion: 'You cancelled the transaction in your wallet'
    };
  }
  
  // Default unknown error
  return {
    type: ErrorType.UNKNOWN,
    message: 'An unexpected error occurred',
    suggestion: 'Please try again or contact support if the issue persists'
  };
}

// Error component using the classification
export function ErrorDisplay({ error }: { error: any }) {
  const errorInfo = classifyError(error);
  
  return (
    <div className="error-container">
      <h3>Error: {errorInfo.message}</h3>
      <p>{errorInfo.suggestion}</p>
      {errorInfo.type === ErrorType.UNKNOWN && (
        <details>
          <summary>Technical Details</summary>
          <pre>{JSON.stringify(error, null, 2)}</pre>
        </details>
      )}
    </div>
  );
}
```

### Mobile Responsiveness

Ensure your dApp works well on mobile devices:

```tsx
// src/components/WalletConnectMobile.tsx
import { useEffect, useState } from 'react';
import { CardanoWallet, useWallet } from '@meshsdk/react';

export default function WalletConnectMobile() {
  const { connected } = useWallet();
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // Check if user is on mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Initial check
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return (
    <div className="wallet-connect">
      {isMobile ? (
        <div className="mobile-wallet-options">
          <h3>Connect Your Wallet</h3>
          <p>Select your preferred mobile wallet:</p>
          <div className="wallet-buttons">
            <a 
              href="eternl://" 
              className="wallet-button eternl"
              onClick={(e) => {
                if (!navigator.userAgent.includes('Android') && !navigator.userAgent.includes('iPhone')) {
                  e.preventDefault();
                  alert('Please install the Eternl mobile app');
                }
              }}
            >
              Eternl
            </a>
            <a 
              href="flint://" 
              className="wallet-button flint"
              onClick={(e) => {
                if (!navigator.userAgent.includes('Android') && !navigator.userAgent.includes('iPhone')) {
                  e.preventDefault();
                  alert('Please install the Flint mobile app');
                }
              }}
            >
              Flint
            </a>
          </div>
          {connected && (
            <div className="connection-status">
              <span className="status-dot connected"></span>
              Wallet Connected
            </div>
          )}
        </div>
      ) : (
        <CardanoWallet />
      )}
    </div>
  );
}
```

### Key Resources:
- [React Design Patterns](https://reactpatterns.com/)
- [Mobile Web3 UX Guidelines](https://metamask.io/mobile-ux/)
- [Accessibility in dApps](https://www.w3.org/WAI/standards-guidelines/wcag/)
- [Error Handling Best Practices](https://kentcdodds.com/blog/use-react-error-boundary)

## Practice Exercises

1. **Transaction Building**:
   - Create a script to build and submit a simple payment transaction using cardano-cli
   - Experiment with different fee calculations and TTL settings
   - Explore how metadata can be added to transactions

2. **Wallet Integration**:
   - Set up a React application with Mesh SDK
   - Implement wallet connection with support for multiple wallet providers
   - Display connected wallet balance and transaction history

3. **Backend Development**:
   - Create a Node.js/Express server with Blockfrost integration
   - Build API endpoints to query address information and submit transactions
   - Implement webhook notifications for blockchain events

4. **Smart Contract Deployment**:
   - Deploy an Aiken contract as a reference script to testnet
   - Create a transaction that interacts with the deployed contract
   - Verify the interaction works as expected

5. **Extended Challenge**:
   - Build a complete dApp frontend for one of your smart contracts
   - Implement transaction feedback and error handling
   - Ensure the interface is responsive and works on mobile devices

## Next Steps

Congratulations on completing Module 3! You now have a comprehensive understanding of Cardano transaction building and off-chain integration. In the final module, you'll bring everything together to build a complete decentralized application on Cardano.

Before moving on:
- Make sure you can build and submit transactions using both cardano-cli and Mesh SDK
- Verify that you can interact with deployed smart contracts
- Test your interface on different devices and browsers
- Consider the user experience of your blockchain interactions

## Additional Resources

- [Cardano Developer Portal](https://developers.cardano.org/)
- [Mesh SDK Documentation](https://meshjs.dev/)
- [Blockfrost API](https://blockfrost.io/)
- [Maestro API](https://www.gomaestro.org/dapp-platform)
- [Koios API](https://api.koios.rest/)
- [CIP-30 Wallet Standard](https://cips.cardano.org/cips/cip30/)
- [UI/UX Best Practices for Web3](https://www.nngroup.com/articles/web3-usability/)
- [Cardano StackExchange](https://cardano.stackexchange.com/)