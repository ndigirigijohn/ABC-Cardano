# Cardano Lucid Workshop Guide

Welcome to the Cardano blockchain workshop! This guide will help you understand the demo application and learn about Cardano development using Lucid.

## Workshop Overview

In this workshop, you'll learn how to:

1. Set up a Deno/TypeScript development environment for Cardano
2. Connect to the Cardano blockchain using Blockfrost
3. Work with wallets, transactions, and UTXOs
4. Create and manage native tokens
5. Understand basic smart contract concepts

## Setup Instructions

### Prerequisites

1. Install [Deno](https://deno.land/#installation)
2. Create a [Blockfrost](https://blockfrost.io/) account and get an API key for Preprod testnet
3. Set up a browser wallet (like Eternl, Nami, or Flint) on the Preprod testnet
4. Get test ADA from the [Cardano testnet faucet](https://docs.cardano.org/cardano-testnet/tools/faucet)

### Project Setup

1. Clone the repository and navigate to the project directory
2. Create a `.env` file with your Blockfrost API key and wallet seed phrase(s)
3. Test the setup by running `deno run --allow-net --allow-read --allow-env src/wallet.ts`

## Core Concepts

### The eUTXO Model

Cardano uses the Extended Unspent Transaction Output (eUTXO) model:

- UTXOs are like digital "bills" that can only be spent once
- Each UTXO has an address (owner) and a value (amount of ADA and/or native tokens)
- Transactions consume UTXOs as inputs and create new UTXOs as outputs
- The extension (the "e" in eUTXO) allows UTXOs to carry additional data (datums) and logic (validators)

### Lucid Library

Lucid is a library that simplifies Cardano development:

- Abstracts away the complexity of building and submitting transactions
- Provides utilities for working with wallets, tokens, and smart contracts
- Supports different providers (Blockfrost, Kupmios, etc.)

## Walkthrough of Demo Modules

### 1. Wallet Module (`wallet.ts`)

This module demonstrates:
- Connecting to Blockfrost and initializing Lucid
- Loading a wallet from a seed phrase
- Querying wallet address and balance
- Inspecting UTXOs in a wallet
- Switching between multiple wallets

Key concepts:
- How balances are calculated from UTXOs
- The relationship between addresses and credentials

### 2. Transactions Module (`transactions.ts`)

This module demonstrates:
- Building simple payment transactions
- Adding metadata to transactions
- Creating time-constrained transactions
- Calculating transaction fees
- Transferring funds between wallets

Key concepts:
- Transaction building workflow
- The role of metadata in transactions
- Time and validity constraints

### 3. Assets Module (`assets.ts`)

This module demonstrates:
- Listing native tokens in a wallet
- Creating minting policies
- Minting new tokens
- Burning tokens

Key concepts:
- Native multi-asset support on Cardano
- Policy IDs and asset names
- Minting and burning mechanics

### 4. Smart Contracts Module (`smartContracts.ts`)

This module demonstrates:
- Creating a simple validator script
- Working with datums
- Locking funds at script addresses
- Redeeming funds from script addresses

Key concepts:
- The role of validators, datums, and redeemers
- Script addresses
- The eUTXO model for smart contracts

## Exercises for Workshop Participants

After exploring the demo code, try these exercises:

1. **Wallet Exercise**: Query your wallet balance and list all UTXOs
2. **Transaction Exercise**: Create a transaction with custom metadata
3. **Token Exercise**: Create your own custom token with a unique name
4. **Multi-wallet Exercise**: Send a transaction between two wallets

## Advanced Topics for Further Exploration

- Reference inputs and inline datums (CIP-31 and CIP-32)
- Plutus scripts and the Aiken language
- State machines and multi-sig patterns
- Token minting with metadata standards (CIP-25)

## Resources

- [Lucid Documentation](https://lucid.spacebudz.io/docs/getting-started/intro)
- [Cardano Developer Portal](https://developers.cardano.org/)
- [Cardano Improvement Proposals](https://cips.cardano.org/)
- [Aiken Documentation](https://aiken-lang.org/)
- [Blockfrost API](https://blockfrost.io/)
- [Cardano Testnet Faucet](https://docs.cardano.org/cardano-testnet/tools/faucet)

## Troubleshooting

If you encounter issues:

1. **API Rate Limiting**: Blockfrost has rate limits - add delays between requests
2. **Transaction Errors**: Check for sufficient funds (including for fees)
3. **Network Issues**: Make sure you're using the correct network (Preprod vs. Preview)
4. **TypeScript Errors**: Ensure you're using compatible versions of dependencies

Happy coding with Cardano and Lucid!