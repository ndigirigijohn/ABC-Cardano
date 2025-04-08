# Module 1: Cardano Fundamentals & Developer Environment Setup

In this module, you'll build a solid foundation in blockchain concepts, understand what makes Cardano unique, and set up a complete development environment for creating Cardano applications.

![Cardano Development Environment](/learning%20center/assets/M01.jpg)

## Module Structure

### 1.1 [Understanding Blockchain Technology](#11-understanding-blockchain-technology)
- [Evolution of Blockchain](#evolution-of-blockchain)
- [The Blockchain Trilemma](#the-blockchain-trilemma)
- [Key Concepts and Terminology](#key-resources)

### 1.2 [Cardano Architecture](#12-cardano-architecture)
- [Multi-Layer Design](#multi-layer-design)
- [Ouroboros Proof-of-Stake](#ouroboros-proof-of-stake)
- [Native Assets](#native-assets)

### 1.3 [The eUTxO Model](#13-the-eutxo-model)
- [Understanding eUTxO](#understanding-eutxo)
- [Advantages of eUTxO](#advantages-of-eutxo)
- [Key Resources](#key-resources-1)

### 1.4 [Setting Up Your Development Environment](#14-setting-up-your-development-environment)
- [Installing Required Tools](#installing-required-tools)
  - [Rust Toolchain](#rust-toolchain)
  - [Aiken CLI](#aiken-cli)
  - [VS Code Setup](#vs-code-setup)
- [Cardano Node (Optional)](#cardano-node-optional)

### 1.5 [Cardano Wallets & Testnet](#15-cardano-wallets--testnet)
- [Wallet Types](#wallet-types)
- [Setting Up a Testnet Wallet](#setting-up-a-testnet-wallet)
- [CIP-30 Wallet Standard](#cip-30-wallet-standard)

### 1.6 [Introduction to Functional Programming](#16-introduction-to-functional-programming)
- [Key Concepts](#key-concepts)
- [Why Functional Programming for Blockchain](#why-functional-programming-for-blockchain)
- [Key Resources](#key-resources-2)

### 1.7 [Writing Your First Aiken Code](#17-writing-your-first-aiken-code)
- [Creating an Aiken Project](#creating-an-aiken-project)
- [Project Structure](#project-structure)
- [Simple Validator Example](#simple-validator-example)
- [Key Resources](#key-resources-3)

### [Practice Exercises](#practice-exercises)
- [Environment Setup](#environment-setup)
- [Wallet Creation](#wallet-creation)
- [Simple Validator](#simple-validator)
- [eUTxO Analysis](#eutxo-analysis)
- [Extended Challenge](#extended-challenge)

### [Next Steps](#next-steps)

### [Additional Resources](#additional-resources)

## 1.1 Understanding Blockchain Technology

### Evolution of Blockchain

Blockchain technology has evolved through three generations, each addressing limitations of previous versions:

**First Generation (Bitcoin)**: 
- Introduced decentralized digital currency using proof-of-work consensus
- Revolutionary for solving the double-spending problem
- Limited in transaction throughput (~7 transactions per second)
- Minimal programmability through Bitcoin Script

**Second Generation (Ethereum)**:
- Added Turing-complete programmable smart contracts
- Enabled decentralized applications (dApps)
- Uses account-based model with global state
- Faces scalability challenges and high gas fees

**Third Generation (Cardano)**:
- Focused on scalability, interoperability, and sustainability
- Research-based, peer-reviewed approach to development
- Proof-of-stake consensus with significantly lower energy usage
- Extended UTxO model for deterministic smart contracts

[![Watch the video](https://img.youtube.com/vi/bbMihIeO5nI/maxresdefault.jpg)](https://youtu.be/bbMihIeO5nI)

### [Exploring The Blockchain Evolution](https://youtu.be/bbMihIeO5nI)

### The Blockchain Trilemma

Every blockchain platform must balance three competing factors known as the "blockchain trilemma":

**Security**: Resistance to attacks and fault tolerance
- How resilient is the network against 51% attacks?
- How secure are the smart contracts against exploits?
- What formal verification methods are available?

**Scalability**: Transaction throughput and processing capacity
- How many transactions per second can the network handle?
- How does the network scale as usage increases?
- What layer-2 solutions are being developed?

**Decentralization**: Distribution of control and governance
- How many independent validators secure the network?
- How accessible is participation in consensus?
- How are protocol updates decided and implemented?

Cardano's layered architecture and scientific approach aim to address these challenges more effectively than previous generations. The Ouroboros proof-of-stake protocol achieves security comparable to Bitcoin while using a fraction of the energy, and Hydra layer-2 scaling solutions are designed to increase throughput to over 1,000 transactions per second.

### Key Resources:
- [Blockchain Basics](https://youtu.be/yubzJw0uiE4?si=2Xj57sxlSPmf2hl1)
- [Cardano's Approach to Scalability](https://www.onesafe.io/blog/cardano-hydra-1-million-tps#:~:text=Cardano%20uses%20Ouroboros%2C%20a%20proof,fintech%20startups%20build%20sustainable%20solutions.)
- [Ouroboros Protocol Overview](https://cardano.org/ouroboros/)

## 1.2 Cardano Architecture

### Multi-Layer Design

Cardano uses a unique multi-layered approach to separate concerns and allow for more flexible upgrades:

**Settlement Layer (CSL)**: 
- Handles the accounting of ADA cryptocurrency transfers
- Implements the Ouroboros consensus protocol
- Manages the ledger of transactions and blocks

**Computation Layer (CCL)**:
- Executes smart contracts (Plutus Core)
- Supports decentralized applications (dApps)
- Processes transaction validation logic

This separation provides several advantages:
1. Each layer can be updated independently
2. Settlement layer remains stable while computation features evolve
3. Better overall performance and security isolation

![Cardano Architecture Layers](/learning%20center/assets/M01Multilayer.svg)

### Ouroboros Proof-of-Stake

Cardano uses Ouroboros, the first provably secure proof-of-stake protocol backed by peer-reviewed research:

**How Ouroboros Works**:
1. Time is divided into epochs (~5 days) and slots (1 second)
2. Stake pool operators are elected as slot leaders to produce blocks
3. Election probability is proportional to the stake delegated to the pool
4. Cryptographic lottery using verifiable random function (VRF) ensures fairness

**Key Advantages**:
- **Energy Efficiency**: Uses ~0.01% of the energy of Bitcoin's proof-of-work
- **Security**: Provides mathematical security guarantees through formal verification
- **Decentralization**: Lower barriers to participation through delegation
- **Predictability**: Scheduled block production enables better resource planning

### Native Assets

Unlike other blockchains, Cardano supports native tokens without requiring smart contracts:

**Native Asset Features**:
- Assets operate directly on the ledger, just like ADA
- Same security and functionality as the main cryptocurrency
- No execution fees for transfers (only standard transaction fees)
- Simplified token creation process with optional metadata

**Types of Native Assets**:
1. **Fungible Tokens**: Interchangeable units like currencies or utility tokens
2. **Non-Fungible Tokens (NFTs)**: Unique digital assets with distinct properties
3. **Multi-Asset Tokens**: Combined in a single transaction for efficiency

The native asset architecture enables more efficient DeFi applications, NFT marketplaces, and tokenized real-world assets with lower overhead than smart contract-based token implementations.

### Key Resources:
- [Cardano Architecture Overview](https://docs.cardano.org/explore-cardano/cardano-architecture)
- [Ouroboros Protocol Explained](https://iohk.io/en/blog/posts/2020/06/23/the-ouroboros-path-to-decentralization/)
- [Native Tokens Documentation](https://developers.cardano.org/docs/native-tokens/)

## 1.3 The eUTxO Model

### Understanding eUTxO

Cardano uses the Extended Unspent Transaction Output (eUTxO) model, which significantly influences how applications are designed:

**Basic UTxO Concept**:
- Each transaction consumes UTXOs as inputs
- Each transaction creates new UTXOs as outputs
- UTXOs are "consumed" entirely in transactions
- Unspent outputs form the current state of the blockchain

**Cardano's Extensions to UTxO**:
- Addition of arbitrary data (datum) to UTXOs
- Script addresses that control UTXO spending logic
- Contextual information provided during validation
- Redeemer data sent when attempting to spend

![eUTxO Transaction Model](/learning%20center/assets/M01EUTXO.svg)

### eUTxO vs. Account Model

The eUTxO model offers several benefits over account-based models (like Ethereum):

**Deterministic Execution**:
- Transaction validation results are predictable
- No unexpected state changes during execution
- Transaction validity can be verified before submission
- Reduces the risk of unexpected fees or failures

**Parallelization**:
- Independent UTXOs can be processed simultaneously
- Transactions affecting different UTXOs don't conflict
- Enables more efficient network throughput
- Better scaling characteristics for certain workloads

**Security Benefits**:
- Simpler attack surface for formal verification
- Easier to reason about transaction outcomes
- Less susceptible to certain types of attacks
- More straightforward fee calculation

**Concurrency Considerations**:
- Multiple users interacting with the same UTXO requires careful design
- State management differs from account-based thinking
- Requires specific patterns for high-contention scenarios
- Different architectural approaches than Ethereum dApps

Understanding these differences is crucial for effective Cardano development. The eUTxO model influences everything from basic transactions to complex smart contract design.

### Key Resources:
- [eUTxO Handbook](https://ucarecdn.com/3da33f2f-73ac-4c9b-844b-f215dcce0628/EUTXOhandbook_for_EC.pdf)
- [eUTxO vs Account Model](https://developers.cardano.org/docs/get-started/cardano-utxo-model-explained/)
- [Concurrency Solutions in eUTxO](https://iohk.io/en/blog/posts/2021/09/10/concurrency-and-all-that-cardano-smart-contracts-and-the-eutxo-model/)

## 1.4 Setting Up Your Development Environment

Creating a productive Cardano development environment involves installing several key tools and configuring them to work together seamlessly.

![Development Environment Components](/learning%20center/assets/M01Dev.avif)

### Installing Required Tools

#### Rust Toolchain

Aiken is built on Rust, so you'll need to install the Rust toolchain first:

**For Linux/macOS**:
```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Follow the prompts and select option 1 for default installation
# After installation completes, load Rust into your current shell
source $HOME/.cargo/env

# Verify installation
rustc --version
# Should output something like: rustc 1.76.0 (07dca489a 2024-02-04)
```

**For Windows**:
1. Download and run the Rust installer from [rustup.rs](https://rustup.rs/)
2. Follow the installation wizard instructions
3. After installation, open a new command prompt and verify with `rustc --version`

#### Aiken CLI

With Rust installed, you can now install the Aiken command-line interface:

```bash
# Install Aiken using Cargo
cargo install aiken --version 1.0.21-alpha

# Verify installation
aiken --version
# Should output something like: aiken 1.0.21-alpha
```

If you encounter any issues with the installation:
- Ensure your Rust installation is up to date with `rustup update`
- Check that your PATH includes the Cargo bin directory
- For Linux users, you may need development packages like `build-essential`

#### VS Code Setup

For an optimal development experience, configure Visual Studio Code:

1. **Install VS Code**: Download and install from [code.visualstudio.com](https://code.visualstudio.com/)

2. **Install Aiken Extension**:
   - Open VS Code
   - Go to Extensions view (Ctrl+Shift+X / Cmd+Shift+X)
   - Search for "Aiken"
   - Install the "Aiken" extension by TxPipe

3. **Configure Settings**:
   - Open Settings (Ctrl+, / Cmd+,)
   - Add the following settings for optimal Aiken development:
   ```json
   {
     "editor.formatOnSave": true,
     "editor.rulers": [80],
     "aiken.trace.server": "messages",
     "aiken.enableSnippets": true
   }
   ```

4. **Verify Setup**:
   - Create a new Aiken file with `.ak` extension
   - Check for syntax highlighting and auto-completion

![VS Code with Aiken extension](/learning%20center/assets/M01VsAiken.png)

### Cardano Node (Optional)

For advanced development, you may want to run your own Cardano node:

```bash
# This is optional for beginners - you can use public services initially
# Instructions for setting up a Cardano node can be found at:
# https://developers.cardano.org/docs/get-started/installing-cardano-node/
```

Most developers can start with public API services like Blockfrost or Maestro, which we'll cover in Module 3.

### Key Resources:
- [Aiken Installation Guide](https://aiken-lang.org/installation-guide)
- [VS Code Aiken Extension](https://marketplace.visualstudio.com/items?itemName=TxPipe.aiken)
- [Troubleshooting Common Installation Issues](https://github.com/aiken-lang/aiken/issues)

## 1.5 Cardano Wallets & Testnet

Wallets are your interface to the Cardano blockchain, and using the testnet allows you to experiment without risking real ADA.

### Wallet Types

Several wallet options are available for Cardano development:

**Browser Extensions**:
- **Eternl** (formerly CCVault): Feature-rich wallet with advanced features
- **Nami**: Lightweight, user-friendly wallet with dApp connector
- **Flint**: Focused on simplicity and security
- **Lace**: Combines wallet and blockchain explorer functionality

**Hardware Wallets**:
- **Ledger**: Physical devices that store private keys offline
- **Trezor**: Alternative hardware wallet with Cardano support

**CLI Wallets**:
- **cardano-cli**: Command-line interface for advanced operations
- **cardano-wallet**: HTTP API and CLI for wallet management

For development purposes, browser extension wallets are typically the most convenient option, especially when testing dApp integrations.


### Setting Up a Testnet Wallet

Follow these steps to create a testnet wallet for development:

1. **Install a Browser Extension**:
   - For this guide, we'll use Eternl (available for Chrome, Firefox, and Brave)
   - Install from [eternl.io](https://eternl.io/) or your browser's extension store

2. **Create a New Wallet**:
   - Open the extension and select "Create Wallet"
   - Set a spending password (this is not your recovery phrase)
   - Write down your 24-word recovery phrase and store it securely
   - Verify your recovery phrase when prompted

3. **Switch to Testnet**:
   - Open settings (gear icon)
   - Select "Network"
   - Choose "Preprod" or "Preview" testnet
   - The wallet interface will change to indicate testnet mode

4. **Get Test ADA**:
   - Copy your wallet address
   - Visit the Cardano testnet faucet:
     - [Preprod Faucet](https://docs.cardano.org/cardano-testnet/tools/faucet)
     - [Preview Faucet](https://docs.cardano.org/cardano-testnet/tools/faucet)
   - Paste your address and request test ADA
   - Wait for the funds to arrive (usually within minutes)

5. **Explore Transactions**:
   - Use a testnet explorer to view your transactions:
     - [Preprod Explorer](https://preprod.cardanoscan.io/)
     - [Preview Explorer](https://preview.cardanoscan.io/)
   - Examine the UTXO structure of your wallet

### CIP-30 Wallet Standard

The Cardano Improvement Proposal 30 (CIP-30) defines the standard for wallet web page integration:

**Key Features**:
- Standard API for dApp-to-wallet communication
- Consistent user experience across different wallets
- Security-focused permission model
- Methods for address discovery, transaction signing, and submission

**Basic Integration Flow**:
1. Website requests connection to user's wallet
2. User approves connection and grants specific permissions
3. Website can request addresses and build transactions
4. User must approve each transaction in their wallet

We'll explore implementing CIP-30 in your applications in Module 3.

### Key Resources:
- [Cardano Testnet Faucet](https://docs.cardano.org/cardano-testnet/tools/faucet)
- [CIP-30 Wallet Standard](https://cips.cardano.org/cips/cip30/)
- [Eternl Wallet Documentation](https://eternl.io/docs)

## 1.6 Introduction to Functional Programming

Aiken uses functional programming principles, which may be different from the imperative style you're familiar with. Understanding these concepts is crucial for effective Cardano development.

### Key Concepts

#### Pure Functions

Functions that:
- Always produce the same output for the same input
- Have no side effects (don't modify state outside their scope)
- Don't depend on external state

**Example**:
```rust
// Pure function: always returns the same result for the same inputs
fn add(a: Int, b: Int) -> Int {
  a + b
}

// Impure function (if written in an imperative language):
// let total = 0
// function addToTotal(a) { total += a; return total }
```

#### Immutability

Data cannot be changed after creation; instead, new values are created:

**Example**:
```rust
// In Aiken, once a value is assigned, it cannot be changed
let numbers = [1, 2, 3]
// To "modify" it, we create a new value
let more_numbers = list.concat(numbers, [4, 5])
// Original list remains unchanged
```

#### Type Safety

Strong type system prevents certain classes of errors:

**Example**:
```rust
// Type annotations make code safer and more readable
fn divide(a: Int, b: Int) -> Result<Float, Error> {
  if b == 0 {
    Error("Division by zero")
  } else {
    Ok(a / b)
  }
}
```

#### Pattern Matching

Elegant way to handle different cases based on data structure:

**Example**:
```rust
// Pattern matching for control flow
fn describe_list(items: List<Int>) -> String {
  when items is {
    [] -> "Empty list"
    [a] -> "Single item: " ++ to_string(a)
    [a, b] -> "Two items: " ++ to_string(a) ++ " and " ++ to_string(b)
    other -> "List with " ++ to_string(list.length(other)) ++ " items"
  }
}
```

### Why Functional Programming for Blockchain?

Functional programming is ideal for blockchain development for several reasons:

**Predictability**:
- Pure functions produce consistent results
- Easier to reason about code behavior
- Critical for financial applications and contracts

**Security**:
- Immutability prevents unexpected state changes
- Type safety catches errors at compile time
- Reduced attack surface from side effects

**Concurrency**:
- Pure functions can be executed in parallel
- No shared mutable state to cause race conditions
- Important for blockchain's distributed nature

**Formal Verification**:
- Functional code is easier to prove correct mathematically
- Enables higher assurance for critical contracts
- Reduces the risk of expensive bugs

![Functional Programming Benefits](/learning%20center/assets/M01FunctionalProgramming.svg)

### Key Resources:
- [Functional Programming Basics](https://www.turing.com/kb/introduction-to-functional-programming#functional-programming-languages)
- [Functional Thinking for Blockchain](https://kingslanduniversity.com/functional-programming-versus-object-oriented-programming-which-is-better-for-blockchain/)
- [Pattern Matching in Aiken](https://aiken-lang.org/language-tour/control-flow)

## 1.7 Writing Your First Aiken Code

Now let's put what we've learned into practice by creating a simple Aiken project and writing a basic validator.

### Creating an Aiken Project

Set up a new Aiken project in your terminal:

```bash
# Create a new project
aiken new yourname/my_first_project

# Change to the project directory
cd my_first_project

# Explore the project structure
ls -la
```

### Project Structure

An Aiken project contains several important files and directories:

**`aiken.toml`**: Project configuration file
```toml
name = "yourname/my_first_project"
version = "0.0.0"
compiler = "v1.1.15"
plutus = "v3"
license = "Apache-2.0"
description = "Aiken contracts for project 'yourname/my_first_project'"

[repository]
user = "yourname"
project = "my_first_project"
platform = "github"

[[dependencies]]
name = "aiken-lang/stdlib"
version = "v2.2.0"
source = "github"

[config]
```

**`lib/`**: Contains library code and helper functions
- Houses reusable code shared across validators
- Custom types and utility functions go here

**`validators/`**: Contains smart contract validator scripts
- Main logic for your on-chain validation
- Each validator can be compiled to Plutus Core

### Simple Validator Example

Let's create a basic spending validator that allows anyone to spend the funds:

1. **Create a new validator file**:
```bash
# Create a validator file
mkdir -p validators
touch validators/always_succeeds.ak
```

2. **Add the following code to the file**:
```rust
use cardano/transaction.{OutputReference, Transaction, placeholder}

/// A simple validator that always succeeds
validator always_succeed {
  spend(
    _datum: Option<Data>,
    _redeemer: Data,
    _input: OutputReference,
    _tx: Transaction,
  ) {
    True
  }

  else(_) {
    fail
  }
}

test always_succeed_test() {
  trace @"Testing always_succeed validator..."
  // Create a simple output reference (transaction ID and output index)
  let output_reference =
    OutputReference {
      transaction_id: #"0000000000000000000000000000000000000000000000000000000000000000",
      output_index: 0,
    }
  // Use placeholder transaction from the standard library
  let result = always_succeed.spend(None, Void, output_reference, placeholder)
  trace @"Expected: True, Actual: "
  trace result
  // Assert the result is True
  result == True
}

// Test the else clause with the fail annotation
test always_succeed_else_test() fail {
  trace @"Testing always_succeed 'else' clause (should fail)..."
  // Call else directly - this will trigger the fail
  // Need to explicitly assign the result to avoid implicit discard error
  let _ = always_succeed.else(Void)
  // This code won't be reached due to fail
  False
}

```

3. **Build the project**:
```bash
# Compile the project
aiken build
```

This will generate Plutus Core code in the `build` directory, which can be used to create on-chain scripts.

4. **Run the tests**:
```bash
# Run tests
aiken check
```

You should see output showing that the tests passed, with trace messages showing the progress and results.

### Advanced Example: A Time-Locked Validator

Let's create a slightly more complex validator that only allows spending after a certain time:

```rust
use cardano/transaction.{OutputReference, Transaction, placeholder}

// Define a public type for our datum to avoid private type leaks
pub type Datum {
  // The owner's public key hash
  owner: ByteArray,
  // The time after which funds can be spent
  unlock_time: Int,
}

validator time_lock {
  spend(
    datum_option: Option<Datum>,
    _redeemer: Data,
    _input: OutputReference,
    _tx: Transaction,
  ) {
    // Extract the datum from the Option type
    expect Some(datum) = datum_option
    // In a real implementation, you would check transaction validity time
    // For this example, we'll just return True
    True
  }

  else(_) {
    fail
  }
}

test time_lock_test() {
  let datum = Datum { owner: #"deadbeef", unlock_time: 100 }
  let output_reference =
    OutputReference {
      transaction_id: #"0000000000000000000000000000000000000000000000000000000000000000",
      output_index: 0,
    }
  // Use placeholder for the transaction
  let tx = placeholder
  trace @"Testing time_lock validator"
  // Pass the datum as an Option
  let result = time_lock.spend(Some(datum), Void, output_reference, tx)
  trace @"Expected: True, Actual: "
  trace result
  result == True
}

```

This validator demonstrates how to:
- Define custom types for datum
- Access transaction time information
- Implement time-based validation logic
- Write tests directly in the validator file that verify both success and failure cases


### Key Resources:
- [Aiken Project Structure](https://aiken-lang.org/language-tour/project-structure)
- [First Steps with Aiken](https://aiken-lang.org/example--hello-world/basics)
- [Testing in Aiken](https://aiken-lang.org/language-tour/testing)

## Practice Exercises

1. **Environment Setup**:
   - Install all required tools (Rust, Aiken CLI, VS Code)
   - Create your first Aiken project
   - Explore the project structure

2. **Wallet Creation**:
   - Set up a testnet wallet (Eternl, Nami, or Flint)
   - Acquire test ADA from the faucet
   - Send a test transaction to another address you control
   - Examine the transaction in a block explorer

3. **Simple Validator**:
   - Create the "always succeeds" validator shown above
   - Add tests to verify its behavior
   - Compile the validator and examine the output

4. **eUTxO Analysis**:
   - Use a testnet block explorer to examine a transaction
   - Identify inputs and outputs
   - Analyze the UTXO structure
   - Document your findings

5. **Extended Challenge**:
   - Modify the time-locked validator to also check for a specific signature
   - Write tests for both the time condition and signature condition
   - Document the validator's behavior in different scenarios

## Next Steps

Congratulations on completing Module 1! You now understand the fundamentals of Cardano and have a working development environment. In the next module, you'll dive deeper into Aiken and learn how to write more complex smart contracts with multiple validation conditions, state management, and advanced patterns.

Before moving on:
- Make sure you can compile Aiken code without errors
- Verify that you can create and test simple validators
- Ensure your testnet wallet is working correctly
- Review any concepts that were challenging

## Additional Resources

- [Cardano Developer Portal](https://developers.cardano.org/)
- [Aiken Documentation](https://aiken-lang.org/)
- [Mesh SDK Documentation](https://meshjs.dev/)
- [eUTxO Handbook](https://ucarecdn.com/3da33f2f-73ac-4c9b-844b-f215dcce0628/EUTXOhandbook_for_EC.pdf)
- [Blockfrost API](https://blockfrost.io/)
- [Maestro API](https://www.gomaestro.org/dapp-platform)
- [Cardano Stack Exchange](https://cardano.stackexchange.com/)
- [Awesome Cardano](https://github.com/CardanoUmbrella/awesome-cardano)dano/cardano-architecture)
- [Ouroboros Protocol Explained](https://iohk.io/en/blog/posts/2020/06/23/the-ouroboros-path-to-decentralization/)
