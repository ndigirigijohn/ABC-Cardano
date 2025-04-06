# Module 4: Building a Complete DApp on Cardano

In this final module, you'll apply everything you've learned to build a complete decentralized application on Cardano. You'll implement advanced contract patterns, create responsive user interfaces, optimize for performance and security, and deploy a production-ready dApp.

![Complete DApp Development](https://placehold.co/600x400)

## Module Structure

### 4.1 [Advanced Contract Patterns](#41-advanced-contract-patterns)
- [State Machines](#state-machines)
- [Multi-Party Contracts](#multi-party-contracts)
- [Time-Locked Logic](#time-locked-logic)
- [Reference Inputs and Inline Datums](#reference-inputs-and-inline-datums)
- [Key Resources](#key-resources)

### 4.2 [Frontend Development for Cardano](#42-frontend-development-for-cardano)
- [Responsive UI Architecture](#responsive-ui-architecture)
- [Wallet Connection Best Practices](#wallet-connection-best-practices)
- [Transaction Feedback and Confirmation](#transaction-feedback-and-confirmation)
- [Error Handling and Edge Cases](#error-handling-and-edge-cases)
- [Key Resources](#key-resources-1)

### 4.3 [Security and Optimization](#43-security-and-optimization)
- [Contract Security Vulnerabilities](#contract-security-vulnerabilities)
- [Execution Cost Optimization](#execution-cost-optimization)
- [Transaction Size Optimization](#transaction-size-optimization)
- [Security Best Practices](#security-best-practices)
- [Key Resources](#key-resources-2)

### 4.4 [Building a Complete DApp](#44-building-a-complete-dapp)
- [Project Options](#project-options)
- [Project Architecture](#project-architecture)
- [Implementing the Smart Contracts](#implementing-the-smart-contracts)
- [Backend Services Implementation](#backend-services-implementation)
- [Frontend Implementation](#frontend-implementation)
- [Project Completion and Deployment](#project-completion-and-deployment)
- [Key Resources](#key-resources-3)

### [Practice Exercises](#practice-exercises)
- [NFT Marketplace](#nft-marketplace)
- [Token Swap Application](#token-swap-application)
- [DAO Voting Mechanism](#dao-voting-mechanism)
- [Timelock Vault](#timelock-vault)
- [Extended Challenge](#extended-challenge)

### [Next Steps](#next-steps)

### [Additional Resources](#additional-resources)

## 4.1 Advanced Contract Patterns

To build sophisticated applications, you'll need to implement more complex smart contract patterns that can handle real-world use cases efficiently.

### State Machines

State machines are a powerful pattern for modeling complex processes:

```rust
use aiken/transaction.{ScriptContext, Spend, Transaction}
use aiken/list
use aiken/interval.{Interval, after, before}
use aiken/time.{PosixTime}

type State {
  Created { creator: ByteArray }
  Active { 
    creator: ByteArray,
    start_time: PosixTime 
  }
  Completed { 
    creator: ByteArray,
    winner: ByteArray,
    end_time: PosixTime 
  }
  Cancelled { 
    creator: ByteArray,
    cancel_time: PosixTime,
    reason: ByteArray
  }
}

type Action {
  Activate
  Complete { winner: ByteArray }
  Cancel { reason: ByteArray }
}

validator {
  fn state_machine(current_state: State, action: Action, ctx: ScriptContext) -> Bool {
    when ctx.purpose is {
      Spend(_) -> {
        // Get transaction info
        let Transaction { validity_range, .. } = ctx.transaction
        let now = interval.start(validity_range)
        
        // Validate state transition based on current state and action
        when (current_state, action) is {
          // Created -> Active transition
          (Created { creator }, Activate, _) -> {
            // Only creator can activate
            transaction.is_signed_by(ctx.transaction, creator) &&
            // Check correct next state in datum of continuing output
            expect_next_state(ctx, Active { creator, start_time: now })
          }
          
          // Active -> Completed transition
          (Active { creator, .. }, Complete { winner }, _) -> {
            // Only creator can complete
            transaction.is_signed_by(ctx.transaction, creator) &&
            // Check correct next state in datum of continuing output
            expect_next_state(ctx, Completed { creator, winner, end_time: now })
          }
          
          // Active -> Cancelled transition
          (Active { creator, .. }, Cancel { reason }, _) -> {
            // Only creator can cancel
            transaction.is_signed_by(ctx.transaction, creator) &&
            // Check correct next state in datum of continuing output
            expect_next_state(ctx, Cancelled { creator, cancel_time: now, reason })
          }
          
          // Any other transition is invalid
          (_, _, _) -> False
        }
      }
      _ -> False
    }
  }
}

// Helper function to validate the next state in the continuing output
fn expect_next_state(ctx: ScriptContext, expected_next_state: State) -> Bool {
  // Implementation to check continuation output contains correct datum
  // This is a simplified example
  True
}
```

The state machine pattern allows you to:
- Define clear states and transitions
- Enforce validation rules for each transition
- Maintain a history of state changes
- Model complex business processes

![State Machine Diagram](https://placehold.co/600x400)

### Multi-Party Contracts

Contracts involving multiple participants require specialized access control:

```rust
use aiken/transaction.{ScriptContext, Spend}
use aiken/list

type Role {
  Owner
  Operator
  User
}

type Participant {
  key_hash: ByteArray,
  role: Role
}

type AccessControl {
  participants: List<Participant>,
  required_signatures: Map<ByteArray, Int>
}

validator(access: AccessControl) {
  fn multi_party(datum: Data, action: Data, ctx: ScriptContext) -> Bool {
    when ctx.purpose is {
      Spend(_) -> {
        // Count signatures by role
        let signatures_by_role = 
          list.foldr(
            access.participants,
            [],
            fn(participant, acc) {
              if transaction.is_signed_by(ctx.transaction, participant.key_hash) {
                // Add this participant's role to the list of signing roles
                [participant.role, ..acc]
              } else {
                acc
              }
            }
          )
        
        // Check if we have enough signatures for each required role
        let owner_sigs = count_role(signatures_by_role, Owner)
        let operator_sigs = count_role(signatures_by_role, Operator)
        
        // Validate based on action type (simplified)
        owner_sigs >= 1 && operator_sigs >= 1
      }
      _ -> False
    }
  }
}

fn count_role(roles: List<Role>, target_role: Role) -> Int {
  list.count(roles, fn(role) { role == target_role })
}
```

Multi-party contracts enable:
- Role-based access control
- Multi-signature requirements
- Delegation of authority
- Governance mechanisms

### Time-Locked Logic

Time constraints are essential for many applications:

```rust
use aiken/transaction.{ScriptContext}
use aiken/interval.{Interval, after, before, during}
use aiken/time.{PosixTime}

type TimeConstraint {
  NotBefore(PosixTime)
  NotAfter(PosixTime)
  Between(PosixTime, PosixTime)
  Recurring(PosixTime, PosixTime, Int) // Start, period, count
}

fn validate_time_constraint(constraint: TimeConstraint, validity_range: Interval<PosixTime>) -> Bool {
  when constraint is {
    NotBefore(min_time) -> after(validity_range, min_time)
    NotAfter(max_time) -> before(validity_range, max_time)
    Between(min_time, max_time) -> during(validity_range, min_time, max_time)
    Recurring(start, period, count) -> {
      // Check if current time is within any valid period
      let current_time = interval.start(validity_range)
      let periods = list.range(0, count - 1)
      
      list.any(
        periods,
        fn(i) {
          let period_start = start + i * period
          let period_end = period_start + period
          current_time >= period_start && current_time <= period_end
        }
      )
    }
  }
}
```

Time-based constraints allow for:
- Vesting schedules
- Time-limited offers
- Recurring payments
- Deadline enforcement

### Reference Inputs and Inline Datums

Optimize script execution with advanced input types:

```rust
use aiken/transaction.{InlineDatum, ScriptContext, Spend, find_input}
use aiken/list

validator {
  fn optimized_validator(datum: Data, redeemer: Data, ctx: ScriptContext) -> Bool {
    when ctx.purpose is {
      Spend(_) -> {
        // Use reference inputs to access data without consuming
        let oracle_input_opt = find_reference_input_by_address(ctx, #"oracle_address")
        
        when oracle_input_opt is {
          Some(oracle_input) -> {
            // Extract inline datum from oracle input
            when oracle_input.output.datum is {
              InlineDatum(oracle_datum) -> {
                // Use oracle data for validation
                validate_with_oracle(datum, redeemer, oracle_datum, ctx)
              }
              _ -> False
            }
          }
          None -> False
        }
      }
      _ -> False
    }
  }
}

fn find_reference_input_by_address(ctx: ScriptContext, address: ByteArray) -> Option<Input> {
  list.find(
    ctx.transaction.reference_inputs,
    fn(input) { input.output.address == address }
  )
}

fn validate_with_oracle(datum: Data, redeemer: Data, oracle_datum: Data, ctx: ScriptContext) -> Bool {
  // Validation logic using oracle data
  // This is a simplified example
  True
}
```

Reference inputs and inline datums provide:
- Reduced transaction size and fees
- Access to data without consuming UTXOs
- Efficient oracle integration
- Better performance and composability

### Key Resources:
- [Advanced Aiken Patterns](https://aiken-lang.org/example--advanced-patterns)
- [State Machines in eUTxO](https://plutus.readthedocs.io/en/latest/tutorials/state-machines.html)
- [Reference Scripts and Inputs Guide](https://developers.cardano.org/docs/transaction-metadata/referencing-scripts/)
- [Oracle Design Patterns](https://iohk.io/en/blog/posts/2022/02/03/implementing-auction-contracts/)

## 4.2 Frontend Development for Cardano

Creating intuitive user interfaces for blockchain applications presents unique challenges. Let's explore best practices for Cardano dApp frontends.

### Responsive UI Architecture

Organize your frontend for scalability and maintainability:

```tsx
// src/App.tsx
import { MeshProvider } from '@meshsdk/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BlockchainProvider } from './context/BlockchainContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/layout/Layout';
import Router from './Router';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000
    }
  }
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MeshProvider>
        <BlockchainProvider>
          <ThemeProvider>
            <Layout>
              <Router />
            </Layout>
          </ThemeProvider>
        </BlockchainProvider>
      </MeshProvider>
    </QueryClientProvider>
  );
}

export default App;
```

Use React Query for data fetching:

```tsx
// src/hooks/useContractData.ts
import { useQuery } from 'react-query';
import { BlockfrostAPI } from '@blockfrost/blockfrost-js';

const api = new BlockfrostAPI({
  projectId: process.env.REACT_APP_BLOCKFROST_PROJECT_ID || '',
  network: 'preprod',
});

export function useContractData(scriptAddress: string) {
  return useQuery(
    ['contract', scriptAddress],
    async () => {
      // Get UTXOs at script address
      const utxos = await api.addressesUtxos(scriptAddress);
      
      // Get detailed UTxO data
      const utxoDetails = await Promise.all(
        utxos.map(async (utxo) => {
          // Get transaction details
          const tx = await api.txsUtxos(utxo.tx_hash);
          
          // Get datum if available
          let datum = null;
          if (utxo.data_hash) {
            datum = await api.scriptsDatum(utxo.data_hash);
          }
          
          return { ...utxo, transaction: tx, datum };
        })
      );
      
      return utxoDetails;
    },
    {
      staleTime: 60000, // 1 minute
      refetchInterval: 60000, // Refetch every minute
    }
  );
}
```

![Responsive UI Architecture](https://placehold.co/600x400)

### Wallet Connection Best Practices

Implement robust wallet integration:

```tsx
// src/components/wallet/WalletManager.tsx
import { useState, useEffect } from 'react';
import { CardanoWallet, useWallet } from '@meshsdk/react';
import { BlockfrostProvider } from '@meshsdk/core';

// Wallet API testing utility
async function testWalletApi(wallet: any) {
  try {
    // Try to get network ID
    const networkId = await wallet.getNetworkId();
    // Try to get UTXOs
    const utxos = await wallet.getUtxos();
    // Try to get change address
    const changeAddress = await wallet.getChangeAddress();
    
    return { networkId, utxosCount: utxos.length, changeAddress };
  } catch (error) {
    console.error('Wallet API test failed:', error);
    return null;
  }
}

export default function WalletManager() {
  const { connected, wallet, name } = useWallet();
  const [walletApiStatus, setWalletApiStatus] = useState<any>(null);
  const [networkMismatch, setNetworkMismatch] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Check wallet API status when connected
  useEffect(() => {
    if (connected) {
      setIsLoading(true);
      
      testWalletApi(wallet)
        .then((status) => {
          setWalletApiStatus(status);
          
          // Check if wallet is on the correct network (preprod testnet = 0)
          const expectedNetworkId = 0; // Preprod testnet
          if (status && status.networkId !== expectedNetworkId) {
            setNetworkMismatch(true);
          } else {
            setNetworkMismatch(false);
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setWalletApiStatus(null);
      setNetworkMismatch(false);
    }
  }, [connected, wallet]);
  
  return (
    <div className="wallet-manager">
      <div className="wallet-selector">
        <CardanoWallet />
      </div>
      
      {connected && (
        <div className="wallet-status">
          <div className={`status-indicator ${networkMismatch ? 'error' : 'success'}`} />
          <div className="wallet-info">
            <h3>{name || 'Wallet'} Connected</h3>
            {isLoading ? (
              <p>Checking wallet status...</p>
            ) : networkMismatch ? (
              <div className="network-error">
                <p className="error-message">Network mismatch detected!</p>
                <p>Please switch your wallet to the Preprod Testnet</p>
              </div>
            ) : (
              <p className="connected-message">Ready to use</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

Key wallet integration considerations:
- Support multiple wallet providers
- Handle network mismatches gracefully
- Provide clear connection status
- Test wallet API reliability
- Handle connection errors
- Maintain good UX during connecting/disconnecting

### Transaction Feedback and Confirmation

Create a user-friendly transaction experience:

```tsx
// src/components/transaction/TransactionProcessor.tsx
import { useState, useEffect } from 'react';
import { Transaction } from '@meshsdk/core';
import { useWallet } from '@meshsdk/react';
import { BlockfrostAPI } from '@blockfrost/blockfrost-js';

// Transaction stages
enum TxStage {
  IDLE,
  PREPARING,
  BUILDING,
  SIGNING,
  SUBMITTING,
  PENDING,
  CONFIRMING,
  CONFIRMED,
  FAILED
}

// Transaction feedback component
export default function TransactionProcessor({ 
  children,
  buildTransaction,
  onSuccess,
  onError
}) {
  const { connected, wallet } = useWallet();
  const [stage, setStage] = useState<TxStage>(TxStage.IDLE);
  const [hash, setHash] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<number>(0);
  const [error, setError] = useState<any>(null);
  
  // Process the transaction
  async function processTransaction() {
    if (!connected) return;
    
    try {
      // Reset state
      setStage(TxStage.PREPARING);
      setHash(null);
      setConfirmation(0);
      setError(null);
      
      // Build the transaction (custom function passed as prop)
      setStage(TxStage.BUILDING);
      const tx = await buildTransaction(wallet);
      
      // Sign the transaction
      setStage(TxStage.SIGNING);
      const signedTx = await wallet.signTx(tx);
      
      // Submit the transaction
      setStage(TxStage.SUBMITTING);
      const txHash = await wallet.submitTx(signedTx);
      setHash(txHash);
      
      // Transaction is pending
      setStage(TxStage.PENDING);
      
      // Poll for confirmation
      await waitForConfirmation(txHash);
      
      // Success callback
      if (onSuccess) {
        onSuccess(txHash);
      }
    } catch (error) {
      console.error('Transaction failed:', error);
      setError(error);
      setStage(TxStage.FAILED);
      
      // Error callback
      if (onError) {
        onError(error);
      }
    }
  }
  
  // Wait for transaction confirmation
  async function waitForConfirmation(txHash: string) {
    const api = new BlockfrostAPI({
      projectId: process.env.REACT_APP_BLOCKFROST_PROJECT_ID || '',
      network: 'preprod',
    });
    
    setStage(TxStage.CONFIRMING);
    
    // Poll for confirmation (retry up to 30 times with 2s delay)
    for (let i = 0; i < 30; i++) {
      try {
        // Check transaction status
        const tx = await api.txs(txHash);
        
        if (tx && tx.block_height) {
          // Get current block height
          const latestBlock = await api.blocksLatest();
          
          // Calculate confirmations
          const confirmations = latestBlock.height - tx.block_height;
          setConfirmation(confirmations);
          
          // Consider confirmed after 2 confirmations
          if (confirmations >= 2) {
            setStage(TxStage.CONFIRMED);
            return;
          }
        }
      } catch (error) {
        // Ignore errors during polling
        console.warn('Error checking confirmation:', error);
      }
      
      // Wait 2 seconds before next check
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // If we get here, we timed out waiting for confirmation
    setError(new Error('Confirmation timeout'));
    setStage(TxStage.FAILED);
  }
  
  // Reset the processor
  function reset() {
    setStage(TxStage.IDLE);
    setHash(null);
    setConfirmation(0);
    setError(null);
  }
  
  // Render appropriate UI based on stage
  let statusContent;
  switch (stage) {
    case TxStage.IDLE:
      statusContent = null;
      break;
    case TxStage.PREPARING:
      statusContent = <StatusMessage icon="prepare" message="Preparing transaction..." />;
      break;
    case TxStage.BUILDING:
      statusContent = <StatusMessage icon="build" message="Building transaction..." />;
      break;
    case TxStage.SIGNING:
      statusContent = <StatusMessage icon="wallet" message="Please sign transaction in your wallet..." />;
      break;
    case TxStage.SUBMITTING:
      statusContent = <StatusMessage icon="submit" message="Submitting to blockchain..." />;
      break;
    case TxStage.PENDING:
      statusContent = <StatusMessage icon="pending" message="Transaction submitted, waiting for block..." />;
      break;
    case TxStage.CONFIRMING:
      statusContent = (
        <StatusMessage 
          icon="confirm" 
          message={`Confirming transaction (${confirmation} confirmation${confirmation !== 1 ? 's' : ''})`} 
        />
      );
      break;
    case TxStage.CONFIRMED:
      statusContent = (
        <StatusMessage 
          icon="success" 
          message="Transaction confirmed!" 
          details={
            <a 
              href={`https://preprod.cardanoscan.io/transaction/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="explorer-link"
            >
              View on Explorer
            </a>
          }
        />
      );
      break;
    case TxStage.FAILED:
      statusContent = (
        <StatusMessage 
          icon="error" 
          message="Transaction failed" 
          details={
            <div className="error-details">
              <p>{error?.message || 'Unknown error'}</p>
              <button onClick={reset} className="retry-button">Try Again</button>
            </div>
          }
        />
      );
      break;
  }
  
  return (
    <div className="transaction-processor">
      {/* Show transaction form when idle */}
      {stage === TxStage.IDLE ? (
        <div className="transaction-form">
          {children}
          <button 
            onClick={processTransaction} 
            disabled={!connected}
            className="submit-button"
          >
            Submit Transaction
          </button>
        </div>
      ) : (
        <div className="transaction-status">
          {statusContent}
          
          {/* Show cancel button during early stages */}
          {(stage === TxStage.PREPARING || stage === TxStage.BUILDING) && (
            <button onClick={reset} className="cancel-button">
              Cancel
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Helper component for status messages
function StatusMessage({ icon, message, details }) {
  return (
    <div className="status-message">
      <div className={`status-icon ${icon}`} />
      <div className="status-content">
        <p className="status-text">{message}</p>
        {details && <div className="status-details">{details}</div>}
      </div>
    </div>
  );
}
```

A good transaction flow includes:
- Clear status indicators
- Wallet integration cues
- Confirmation tracking
- Block explorer links
- Error handling and recovery
- Cancel/retry options

![Transaction Flow](https://placehold.co/600x400)

### Error Handling and Edge Cases

Implement robust error handling:

```tsx
// src/utils/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Log the error
    console.error('Error boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI or default error message
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="error-container">
          <h2>Something went wrong</h2>
          <p className="error-message">{this.state.error?.message || 'Unknown error'}</p>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            className="retry-button"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

Use React ErrorBoundary for component-level errors:

```tsx
// src/App.tsx
import ErrorBoundary from './utils/ErrorBoundary';
import ErrorFallback from './components/ErrorFallback';

function App() {
  return (
    <ErrorBoundary 
      fallback={<ErrorFallback />}
      onError={(error, info) => {
        // Log to monitoring service
        console.error('App Error:', error, info);
      }}
    >
      <AppContent />
    </ErrorBoundary>
  );
}
```

### Key Resources:
- [React DApp Best Practices](https://meshjs.dev/react/best-practices)
- [Web3 UX Design Principles](https://medium.com/mycrypto/the-web3-design-principles-f21db2f240c1)
- [Blockchain UX Resources](https://uxdesign.cc/designing-for-blockchain-first-principles-and-templates-b3f5696157e)
- [Accessibility in DApps](https://www.w3.org/WAI/standards-guidelines/wcag/)

## 4.3 Security and Optimization

Security and performance are critical considerations for production dApps.

### Contract Security Vulnerabilities

Common security issues to watch for:

**Double Satisfaction Attacks**:
- Description: Multiple transactions attempt to consume the same UTXO
- Prevention: Use unique identifiers or nonces in datums
- Mitigation: Implement proper state transitions

**Time-of-Check vs. Time-of-Use**:
- Description: State changes between validation and execution
- Prevention: Use reference inputs for validation data
- Mitigation: Design contracts with atomic operations

**Datum Manipulation**:
- Description: Attacker provides unexpected datum values
- Prevention: Implement thorough datum validation
- Mitigation: Use strong types and pattern matching

**Script Reuse**:
- Description: Using script addresses or reference scripts unexpectedly
- Prevention: Include unique policy IDs or addresses in validation
- Mitigation: Parameterize contracts with unique values

Example secure validator with mitigations:

```rust
use aiken/transaction.{ScriptContext, Spend}
use aiken/list
use aiken/hash.{Blake2b_224, Hash}

type VerificationKeyHash = Hash<Blake2b_224, VerificationKey>

type SecureDatum {
  owner: VerificationKeyHash,
  nonce: Int,
  contract_id: ByteArray, // Unique identifier for this contract instance
  valid_until: Int
}

validator(contract_params: ByteArray) {
  fn secure_validator(datum: SecureDatum, redeemer: Data, ctx: ScriptContext) -> Bool {
    when ctx.purpose is {
      Spend(_) -> {
        // 1. Check contract identifier matches parameters
        // This prevents script reuse attacks
        if datum.contract_id != contract_params {
          False
        } else {
          // 2. Check datum validity - prevent datum manipulation
          if datum.valid_until < transaction.time_range.start {
            False
          } else {
            // 3. Check authorization - only owner can spend
            let is_signed = transaction.is_signed_by(ctx.transaction, datum.owner)
            
            // 4. Check continuation output to prevent double satisfaction
            // Simplified - in a real contract, verify the nonce is incremented
            // in at least one output with the same script
            
            // All conditions must be met
            is_signed
          }
        }
      }
      _ -> False
    }
  }
}
```

![Security Vulnerabilities](https://placehold.co/600x400)

### Execution Cost Optimization

Optimize your contracts for execution costs:

**Validator Optimization Techniques**:
- Use early returns for validation failures
- Minimize datum size and complexity
- Avoid redundant checks
- Use reference inputs for read-only data
- Prefer simple data structures

**Benchmarking Example**:

```bash
# Compile with benchmarking enabled
aiken build --benchmark

# View execution costs
aiken inspect --breakdown build/validators/optimized.plutus
```

Optimized validator structure:

```rust
// Optimized early-return pattern
validator {
  fn optimized_validator(datum: Datum, redeemer: Redeemer, ctx: ScriptContext) -> Bool {
    // Check purpose first - early return
    when ctx.purpose is {
      Spend(_) -> {
        // Validate signature first - cheapest check
        if !transaction.is_signed_by(ctx.transaction, datum.owner) {
          False
        } else {
          // Only proceed to more expensive checks if signature is valid
          validate_time_constraints(ctx, datum)
        }
      }
      _ -> False
    }
  }
}

// Separate function for time validation logic
fn validate_time_constraints(ctx: ScriptContext, datum: Datum) -> Bool {
  // More expensive validation logic here
  // Only executed if signature check passes
  True
}
```

### Transaction Size Optimization

Optimize transaction size to reduce fees:

**Transaction Size Reduction Strategies**:
- Use reference scripts instead of including scripts inline
- Use inline datums for small datums, hashed datums for large ones
- Batch related operations in single transactions where possible
- Minimize metadata size
- Use compact serialization formats for complex data

Example using reference scripts efficiently:

```typescript
import { Transaction } from '@meshsdk/core';

async function buildOptimizedTransaction(wallet, params) {
  // Create transaction builder
  const tx = new Transaction({ initiator: wallet });
  
  // Using reference script instead of including script in transaction
  tx.setScriptSourceToUtxo({
    txHash: params.referenceScriptTxHash,
    outputIndex: params.referenceScriptOutputIndex
  });
  
  // Add other transaction components
  // ...
  
  // Build transaction
  const unsignedTx = await tx.build();
  return unsignedTx;
}
```

### Security Best Practices

Follow these security best practices:

**Contract Development**:
- Use strong typing for all values
- Implement comprehensive test coverage
- Perform formal verification where possible
- Conduct security audits
- Follow secure contract patterns

**Frontend Security**:
- Validate all user inputs
- Implement proper error handling
- Use secure libraries with regular updates
- Protect private keys and sensitive data
- Implement rate limiting for API endpoints

**Operational Security**:
- Use secure deployment processes
- Monitor contract usage for anomalies
- Implement multi-signature for admin functions
- Create incident response procedures
- Regularly update dependencies

![Security Best Practices](https://placehold.co/600x400)

### Key Resources:
- [Cardano Smart Contract Security](https://developers.cardano.org/docs/governance/cardano-improvement-proposals/security-considerations/)
- [Plutus Execution Cost Guide](https://plutus.readthedocs.io/en/latest/explainers/cost-model.html)
- [Transaction Size Optimization](https://iohk.io/en/blog/posts/2022/03/21/increasing-the-transaction-throughput-of-cardano/)
- [Web3 Security Best Practices](https://consensys.github.io/smart-contract-best-practices/)

## 4.4 Building a Complete DApp

Now let's build a complete DApp that integrates everything we've learned. We'll explore four project options, each highlighting different aspects of Cardano development.

### Project Options

Choose one of these project options for your capstone:

**NFT Marketplace**:
- Minting and trading NFTs
- Display and search functionality
- Metadata handling
- Payment processing

**Token Swap Application**:
- Peer-to-peer token exchanges
- Automated pricing mechanism
- Order book management
- Transaction history

**DAO Voting Mechanism**:
- Proposal submission and management
- Token-weighted voting
- Result tabulation
- Automatic execution of approved proposals

**Timelock Vault**:
- Time-based asset locking
- Scheduled releases
- Emergency unlock mechanisms
- Beneficiary management

In this module, we'll implement the **NFT Marketplace** as our example project, but the concepts apply across all project types.

### Project Architecture

Let's outline the architecture for our NFT Marketplace:

**Smart Contracts**:
- Minting Policy: Controls NFT creation
- Listing Contract: Handles marketplace listings and sales
- Royalty Contract: Manages creator royalties

**Backend Components**:
- Metadata Storage: IPFS integration for NFT metadata
- Transaction Service: Handles marketplace operations
- Indexer: Tracks NFTs and listings
- API Server: Provides data to frontend

**Frontend Components**:
- Wallet Integration: Connects user wallets
- NFT Gallery: Displays available NFTs
- Listing Management: Create and manage listings
- Purchase Flow: Handles buying NFTs

![DApp Architecture](https://placehold.co/600x400)

### Implementing the Smart Contracts

Let's start with the core contracts for our NFT marketplace:

**1. NFT Minting Policy**:

```rust
use aiken/transaction.{ScriptContext, Mint}
use aiken/list
use aiken/hash.{Blake2b_224, Hash}

type MintParams {
  creator: ByteArray,
  project_id: ByteArray,
}

type MintRedeemer {
  Create { metadata_hash: ByteArray }
  Burn
}

validator(params: MintParams) {
  fn mint_policy(redeemer: MintRedeemer, ctx: ScriptContext) -> Bool {
    when ctx.purpose is {
      Mint(policy_id) -> {
        // Extract minted assets
        let minted_assets = transaction.minted_assets(ctx.transaction);
        
        when redeemer is {
          // NFT creation
          Create { metadata_hash } -> {
            // Validate minting requirements:
            // 1. Creator must sign the transaction
            let creator_signed = transaction.is_signed_by(ctx.transaction, params.creator);
            
            // 2. Check proper asset naming and uniqueness
            let valid_assets = validate_asset_names(minted_assets, params.project_id, metadata_hash);
            
            // 3. Check metadata attachment
            let has_metadata = transaction.contains_metadata(ctx.transaction, metadata_hash);
            
            // All conditions must be met
            creator_signed && valid_assets && has_metadata
          }
          
          // NFT burning (simplified)
          Burn -> {
            // For burning, we only check that all values are negative
            // (i.e., tokens are being burned, not minted)
            list.all(minted_assets, fn(asset) { asset.value < 0 })
          }
        }
      }
      _ -> False
    }
  }
}

// Validate asset names follow our convention
fn validate_asset_names(assets: List<Asset>, project_id: ByteArray, metadata_hash: ByteArray) -> Bool {
  // In a real implementation, would check:
  // - Asset names follow project convention
  // - Each asset has quantity 1
  // - Assets have proper metadata reference
  // Simplified for example
  True
}
```

**2. Marketplace Listing Contract**:

```rust
use aiken/transaction.{ScriptContext, Spend, Output}
use aiken/list
use aiken/hash.{Blake2b_224, Hash}
use aiken/time.{PosixTime}

type NftAsset {
  policy_id: ByteArray,
  asset_name: ByteArray,
}

type ListingDatum {
  // The NFT being sold
  nft: NftAsset,
  // Seller address
  seller: ByteArray,
  // Price in lovelace
  price: Int,
  // Optional expiration time
  expires_at: Option<PosixTime>,
  // Royalty percentage (basis points, e.g., 250 = 2.5%)
  royalty_bp: Int,
  // Royalty recipient
  royalty_address: ByteArray,
}

type ListingAction {
  Purchase { buyer: ByteArray }
  Cancel
  Update { new_price: Int, new_expires_at: Option<PosixTime> }
}

validator {
  fn marketplace(datum: ListingDatum, action: ListingAction, ctx: ScriptContext) -> Bool {
    when ctx.purpose is {
      Spend(_) -> {
        // Base validations for all actions
        
        // Check if listing is expired
        let current_time = transaction.validity_range.start(ctx.transaction);
        let is_expired = when datum.expires_at is {
          Some(expires_at) -> current_time > expires_at
          None -> False
        };
        
        when action is {
          // Purchase action
          Purchase { buyer } -> {
            // Prevent purchase of expired listings
            if is_expired {
              False
            } else {
              // 1. Ensure NFT goes to buyer
              let nft_to_buyer = transaction.nft_transferred_to(
                ctx.transaction,
                datum.nft,
                buyer
              );
              
              // 2. Ensure correct payment to seller
              let base_payment = datum.price * (10000 - datum.royalty_bp) / 10000;
              let seller_paid = transaction.lovelace_transferred_to(
                ctx.transaction,
                datum.seller,
                base_payment
              );
              
              // 3. Ensure royalty payment if applicable
              let royalty_amount = datum.price * datum.royalty_bp / 10000;
              let royalty_paid = if royalty_amount > 0 {
                transaction.lovelace_transferred_to(
                  ctx.transaction,
                  datum.royalty_address,
                  royalty_amount
                )
              } else {
                True
              };
              
              // All conditions must be met
              nft_to_buyer && seller_paid && royalty_paid
            }
          }
          
          // Cancel action - only seller can cancel
          Cancel -> {
            // Check if seller signed
            let seller_signed = transaction.is_signed_by(ctx.transaction, datum.seller);
            
            // Ensure NFT is returned to seller
            let nft_to_seller = transaction.nft_transferred_to(
              ctx.transaction,
              datum.nft,
              datum.seller
            );
            
            // Both conditions must be met
            seller_signed && nft_to_seller
          }
          
          // Update action - change price or expiration
          Update { new_price, new_expires_at } -> {
            // Check if seller signed
            let seller_signed = transaction.is_signed_by(ctx.transaction, datum.seller);
            
            // Ensure NFT stays in contract with updated datum
            let continuation_output = transaction.find_script_output(
              ctx.transaction,
              ctx.script_hash
            );
            
            when continuation_output is {
              Some(output) -> {
                let new_datum = ListingDatum {
                  nft: datum.nft,
                  seller: datum.seller,
                  price: new_price,
                  expires_at: new_expires_at,
                  royalty_bp: datum.royalty_bp,
                  royalty_address: datum.royalty_address,
                };
                
                // Verify output has correct datum and NFT
                transaction.output_has_datum(output, new_datum) &&
                transaction.output_contains_nft(output, datum.nft)
              }
              None -> False
            }
            
            seller_signed
          }
        }
      }
      _ -> False
    }
  }
}
```

These simplified contracts demonstrate:
- Controlled NFT minting with creator signatures
- Marketplace functionality for listing, buying, and canceling
- Royalty payments to content creators
- Time-based expirations for listings
- Update capabilities for sellers

### Backend Services Implementation

Now let's implement the key backend components:

**1. Metadata Service**:

```typescript
// src/services/metadata.ts
import { pinataSDK } from '@pinata/sdk';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

// Initialize Pinata client (IPFS provider)
const pinata = pinataSDK(
  process.env.PINATA_API_KEY,
  process.env.PINATA_API_SECRET
);

// NFT metadata structure (following CIP-25)
interface NftMetadata {
  name: string;
  description: string;
  image: string; // IPFS URI
  mediaType: string;
  files?: Array<{
    name: string;
    mediaType: string;
    src: string; // IPFS URI
  }>;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  // Additional fields as needed
}

// Upload image to IPFS
async function uploadImageToIPFS(imagePath: string, name: string): Promise<string> {
  try {
    // Read the image file
    const fileStream = fs.createReadStream(imagePath);
    
    // Upload to IPFS via Pinata
    const result = await pinata.pinFileToIPFS(fileStream, {
      pinataMetadata: {
        name: `${name}-${uuidv4().slice(0, 8)}`
      }
    });
    
    return `ipfs://${result.IpfsHash}`;
  } catch (error) {
    console.error('Failed to upload image to IPFS:', error);
    throw error;
  }
}

// Create and pin NFT metadata
async function createNftMetadata(
  name: string,
  description: string,
  imagePath: string,
  attributes: Array<{ trait_type: string, value: string | number }>
): Promise<{ metadataUri: string, metadataHash: string }> {
  try {
    // 1. Upload the image to IPFS
    const imageUri = await uploadImageToIPFS(imagePath, name);
    
    // 2. Create the metadata object
    const metadata: NftMetadata = {
      name,
      description,
      image: imageUri,
      mediaType: getMediaType(imagePath),
      attributes
    };
    
    // 3. Pin the metadata to IPFS
    const result = await pinata.pinJSONToIPFS(metadata, {
      pinataMetadata: {
        name: `metadata-${name}-${uuidv4().slice(0, 8)}`
      }
    });
    
    // 4. Return IPFS URI and hash
    return {
      metadataUri: `ipfs://${result.IpfsHash}`,
      metadataHash: result.IpfsHash
    };
  } catch (error) {
    console.error('Failed to create NFT metadata:', error);
    throw error;
  }
}

// Helper to determine media type
function getMediaType(filePath: string): string {
  const extension = filePath.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'gif':
      return 'image/gif';
    case 'svg':
      return 'image/svg+xml';
    case 'mp4':
      return 'video/mp4';
    case 'mp3':
      return 'audio/mpeg';
    default:
      return 'application/octet-stream';
  }
}

export {
  uploadImageToIPFS,
  createNftMetadata
};
```

**2. Marketplace Service**:

```typescript
// src/services/marketplace.ts
import { BlockfrostAPI } from '@blockfrost/blockfrost-js';
import { Transaction, Asset, ForgeScript, resolvePaymentKeyHash } from '@meshsdk/core';
import { createNftMetadata } from './metadata';

// Initialize Blockfrost client
const blockfrost = new BlockfrostAPI({
  projectId: process.env.BLOCKFROST_PROJECT_ID,
  network: process.env.CARDANO_NETWORK || 'preprod',
});

// Get policy ID and script from compiled Aiken contract
const NFT_POLICY_ID = 'YOUR_POLICY_ID';
const NFT_POLICY_SCRIPT = {
  type: 'PlutusV2',
  script: 'YOUR_COMPILED_SCRIPT'
};

// Get marketplace contract address
const MARKETPLACE_ADDRESS = 'addr_test1...';

// Mint an NFT
async function mintNFT(
  wallet: any,
  name: string,
  description: string,
  imagePath: string,
  attributes: Array<{ trait_type: string, value: string | number }>
) {
  try {
    // 1. Create and pin metadata
    const { metadataHash } = await createNftMetadata(
      name,
      description,
      imagePath,
      attributes
    );
    
    // 2. Generate asset name (must be unique under policy)
    const assetName = `${name.replace(/\s+/g, '')}${Date.now()}`;
    
    // 3. Prepare forge script for minting
    const forgeScript = ForgeScript.withMintingPolicy(NFT_POLICY_SCRIPT);
    
    // 4. Create the minting transaction
    const tx = new Transaction({ initiator: wallet });
    
    // 5. Mint the NFT
    tx.mintAsset(
      forgeScript,
      {
        assetName: assetName,
        assetQuantity: '1',
        metadata: {
          name: name,
          description: description,
          image: `ipfs://${metadataHash}`,
          mediaType: 'image/png',
          attributes: attributes
        },
        label: '721'
      }
    );
    
    // 6. Add the minting redeemer
    tx.setMintingRedeemer(
      forgeScript,
      {
        "constructor": 0,
        "fields": [
          {
            "bytes": metadataHash
          }
        ]
      }
    );
    
    // 7. Build, sign and submit transaction
    const unsignedTx = await tx.build();
    const signedTx = await wallet.signTx(unsignedTx, true);
    const txHash = await wallet.submitTx(signedTx);
    
    return {
      txHash,
      assetName,
      policyId: NFT_POLICY_ID,
      fullAssetId: `${NFT_POLICY_ID}.${assetName}`
    };
  } catch (error) {
    console.error('Failed to mint NFT:', error);
    throw error;
  }
}

// Create a marketplace listing
async function createListing(
  wallet: any,
  policyId: string,
  assetName: string,
  price: number,
  expiresAt?: Date,
  royaltyBp: number = 250, // Default 2.5%
  royaltyAddress: string = '' // Default to seller if empty
) {
  try {
    // 1. Get seller payment address and key hash
    const sellerAddress = await wallet.getUsedAddress();
    const sellerKeyHash = await resolvePaymentKeyHash(sellerAddress);
    
    // Use seller address as royalty address if not specified
    if (!royaltyAddress) {
      royaltyAddress = sellerAddress;
    }
    
    // 2. Create datum for the listing
    const listingDatum = {
      nft: {
        policy_id: policyId,
        asset_name: assetName
      },
      seller: sellerKeyHash,
      price: price,
      expires_at: expiresAt ? Math.floor(expiresAt.getTime() / 1000) : null,
      royalty_bp: royaltyBp,
      royalty_address: royaltyAddress
    };
    
    // 3. Create transaction to send NFT to marketplace contract
    const tx = new Transaction({ initiator: wallet });
    
    // 4. Add the NFT and listing datum to marketplace contract
    tx.sendAssets(
      MARKETPLACE_ADDRESS,
      [
        {
          unit: `${policyId}.${assetName}`,
          quantity: '1'
        }
      ],
      {
        datum: listingDatum,
        inline: true // Use inline datum for easier inspection
      }
    );
    
    // 5. Build, sign and submit transaction
    const unsignedTx = await tx.build();
    const signedTx = await wallet.signTx(unsignedTx);
    const txHash = await wallet.submitTx(signedTx);
    
    return {
      txHash,
      listingDatum
    };
  } catch (error) {
    console.error('Failed to create listing:', error);
    throw error;
  }
}

// Purchase an NFT from the marketplace
async function purchaseNFT(
  wallet: any,
  utxoId: string, // UTXO containing the listing
  listingDatum: any
) {
  try {
    // 1. Get buyer address and key hash
    const buyerAddress = await wallet.getUsedAddress();
    const buyerKeyHash = await resolvePaymentKeyHash(buyerAddress);
    
    // 2. Calculate payments
    const totalPrice = listingDatum.price;
    const royaltyAmount = Math.floor(totalPrice * listingDatum.royalty_bp / 10000);
    const sellerAmount = totalPrice - royaltyAmount;
    
    // 3. Create transaction to purchase NFT
    const tx = new Transaction({ initiator: wallet });
    
    // 4. Add the script input with redeemer
    tx.spendFromUtxo(
      utxoId,
      {
        "constructor": 0,
        "fields": [
          {
            "bytes": buyerKeyHash
          }
        ]
      }
    );
    
    // 5. Pay seller
    tx.sendLovelace(listingDatum.seller, `${sellerAmount}`);
    
    // 6. Pay royalty if applicable
    if (royaltyAmount > 0) {
      tx.sendLovelace(listingDatum.royalty_address, `${royaltyAmount}`);
    }
    
    // 7. Build, sign and submit transaction
    const unsignedTx = await tx.build();
    const signedTx = await wallet.signTx(unsignedTx);
    const txHash = await wallet.submitTx(signedTx);
    
    return {
      txHash
    };
  } catch (error) {
    console.error('Failed to purchase NFT:', error);
    throw error;
  }
}

export {
  mintNFT,
  createListing,
  purchaseNFT
};
```

**3. Indexing Service**:

```typescript
// src/services/indexer.ts
import { BlockfrostAPI } from '@blockfrost/blockfrost-js';
import { database } from '../database';
import { NFT_POLICY_ID, MARKETPLACE_ADDRESS } from '../config';

// Initialize Blockfrost client
const blockfrost = new BlockfrostAPI({
  projectId: process.env.BLOCKFROST_PROJECT_ID,
  network: process.env.CARDANO_NETWORK || 'preprod',
});

// Track marketplace listings
async function indexMarketplaceListings() {
  try {
    // 1. Get all UTXOs at the marketplace address
    const utxos = await blockfrost.addressesUtxos(MARKETPLACE_ADDRESS);
    
    // 2. Process each UTXO
    for (const utxo of utxos) {
      // Skip if already indexed
      const existingUtxo = await database.getUtxo(`${utxo.tx_hash}#${utxo.output_index}`);
      if (existingUtxo) continue;
      
      // 3. Get the transaction details
      const tx = await blockfrost.txs(utxo.tx_hash);
      
      // 4. Get datum if available
      let datum = null;
      if (utxo.data_hash) {
        try {
          datum = await blockfrost.scriptsDatum(utxo.data_hash);
        } catch (error) {
          console.warn(`Datum not found for ${utxo.data_hash}`);
        }
      }
      
      // 5. Check if the UTXO contains an NFT from our policy
      const nfts = utxo.amount
        .filter(asset => asset.unit !== 'lovelace' && asset.unit.startsWith(NFT_POLICY_ID));
      
      // 6. If we have NFTs and a datum, this is a listing
      if (nfts.length > 0 && datum) {
        // 7. Parse datum to get listing details
        const listingData = parseDatum(datum);
        
        // 8. Store the listing
        await database.storeListing({
          utxoId: `${utxo.tx_hash}#${utxo.output_index}`,
          txHash: utxo.tx_hash,
          outputIndex: utxo.output_index,
          blockHeight: tx.block_height,
          blockTime: tx.block_time,
          policyId: nfts[0].unit.split('.')[0],
          assetName: nfts[0].unit.split('.')[1],
          seller: listingData.seller,
          price: listingData.price,
          expiresAt: listingData.expires_at,
          royaltyBp: listingData.royalty_bp,
          royaltyAddress: listingData.royalty_address,
          status: 'active'
        });
      }
    }
    
    // 9. Mark completed listings (UTXOs no longer at address)
    await database.markCompletedListings(utxos.map(u => `${u.tx_hash}#${u.output_index}`));
    
    console.log(`Indexed ${utxos.length} UTXOs at marketplace address`);
  } catch (error) {
    console.error('Error indexing marketplace listings:', error);
  }
}

// Track NFT ownership
async function indexNftOwnership() {
  try {
    // 1. Get all assets under our policy
    const assets = await blockfrost.assetsPolicyByIdAll(NFT_POLICY_ID);
    
    // 2. Process each asset
    for (const asset of assets) {
      // 3. Get current holders
      const addresses = await blockfrost.assetAddresses(asset.asset);
      
      // 4. Update ownership in database
      if (addresses.length > 0) {
        await database.updateNftOwnership(
          asset.asset,
          addresses[0].address,
          addresses[0].quantity
        );
      }
    }
    
    console.log(`Indexed ${assets.length} NFTs`);
  } catch (error) {
    console.error('Error indexing NFT ownership:', error);
  }
}

// Helper to parse CBOR datum
function parseDatum(datumCbor) {
  // In a real implementation, would use proper CBOR parsing
  // For simplicity, assuming datum is already parsed to JSON
  return datumCbor;
}

// Export indexing functions
export {
  indexMarketplaceListings,
  indexNftOwnership
};
```

### Frontend Implementation

Finally, let's create the key frontend components:

**1. NFT Gallery Component**:

```tsx
// src/components/NftGallery.tsx
import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { fetchNfts } from '../api/nfts';
import NftCard from './NftCard';
import FilterBar from './FilterBar';
import LoadingSpinner from './LoadingSpinner';

// Filter options
interface FilterOptions {
  minPrice?: number;
  maxPrice?: number;
  sortBy: 'price_asc' | 'price_desc' | 'newest' | 'oldest';
  onlyAvailable: boolean;
}

export default function NftGallery() {
  // State for filters
  const [filters, setFilters] = useState<FilterOptions>({
    sortBy: 'newest',
    onlyAvailable: true
  });
  
  // Fetch NFTs with React Query
  const { data, isLoading, isError, refetch } = useQuery(
    ['nfts', filters],
    () => fetchNfts(filters),
    {
      refetchInterval: 60000, // Refetch every minute
      staleTime: 30000 // Consider data stale after 30 seconds
    }
  );
  
  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<FilterOptions>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (isError) {
    return <div className="error-message">Failed to load NFTs. Please try again.</div>;
  }
  
  return (
    <div className="nft-gallery">
      <h2>NFT Marketplace</h2>
      
      <FilterBar 
        filters={filters} 
        onFilterChange={handleFilterChange} 
      />
      
      <div className="refresh-control">
        <button onClick={() => refetch()} className="refresh-button">
          Refresh
        </button>
        <span className="last-updated">
          Last updated: {new Date().toLocaleTimeString()}
        </span>
      </div>
      
      {data?.length === 0 ? (
        <div className="empty-state">
          No NFTs found matching your criteria
        </div>
      ) : (
        <div className="nft-grid">
          {data?.map(nft => (
            <NftCard 
              key={nft.asset_id} 
              nft={nft} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

**2. NFT Card Component**:

```tsx
// src/components/NftCard.tsx
import React, { useState } from 'react';
import { useWallet } from '@meshsdk/react';
import { purchaseNft } from '../api/marketplace';
import IPFSImage from './IPFSImage';
import TransactionModal from './TransactionModal';

interface NftCardProps {
  nft: {
    asset_id: string;
    policy_id: string;
    asset_name: string;
    fingerprint: string;
    metadata: {
      name: string;
      description: string;
      image: string;
      attributes: Array<{
        trait_type: string;
        value: string | number;
      }>;
    };
    listing?: {
      utxo_id: string;
      price: number;
      seller: string;
      expires_at: number | null;
    };
  };
}

export default function NftCard({ nft }: NftCardProps) {
  const { connected, wallet } = useWallet();
  const [showDetails, setShowDetails] = useState(false);
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [txInProgress, setTxInProgress] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);
  
  // Format price in ADA
  const formatPrice = (lovelace: number) => {
    return (lovelace / 1000000).toFixed(2);
  };
  
  // Check if listing is expired
  const isExpired = nft.listing?.expires_at 
    ? new Date(nft.listing.expires_at * 1000) < new Date() 
    : false;
  
  // Handle purchase
  const handlePurchase = async () => {
    if (!connected || !nft.listing) return;
    
    setTxModalOpen(true);
    setTxInProgress(true);
    setTxHash(null);
    setTxError(null);
    
    try {
      // Call API to create purchase transaction
      const result = await purchaseNft(
        wallet, 
        nft.listing.utxo_id
      );
      
      setTxHash(result.txHash);
    } catch (error) {
      console.error('Purchase failed:', error);
      setTxError(error instanceof Error ? error.message : 'Transaction failed');
    } finally {
      setTxInProgress(false);
    }
  };
  
  return (
    <div className="nft-card">
      <div className="nft-image" onClick={() => setShowDetails(true)}>
        <IPFSImage 
          ipfsUri={nft.metadata.image} 
          alt={nft.metadata.name} 
        />
      </div>
      
      <div className="nft-info">
        <h3>{nft.metadata.name}</h3>
        
        {nft.listing ? (
          <div className="nft-price">
            {isExpired ? (
              <span className="expired-tag">Expired</span>
            ) : (
              <>
                <span className="price-value">{formatPrice(nft.listing.price)} ADA</span>
                {connected && (
                  <button 
                    className="buy-button"
                    onClick={handlePurchase}
                    disabled={isExpired}
                  >
                    Buy Now
                  </button>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="not-listed">Not for sale</div>
        )}
      </div>
      
      {/* Details Modal */}
      {showDetails && (
        <div className="nft-details-modal">
          <div className="modal-content">
            <button 
              className="close-button"
              onClick={() => setShowDetails(false)}
            >
              &times;
            </button>
            
            <div className="details-layout">
              <div className="details-image">
                <IPFSImage 
                  ipfsUri={nft.metadata.image} 
                  alt={nft.metadata.name} 
                  highQuality
                />
              </div>
              
              <div className="details-info">
                <h2>{nft.metadata.name}</h2>
                <p className="description">{nft.metadata.description}</p>
                
                <div className="attributes">
                  <h3>Attributes</h3>
                  <div className="attributes-grid">
                    {nft.metadata.attributes.map((attr, index) => (
                      <div key={index} className="attribute">
                        <span className="trait">{attr.trait_type}</span>
                        <span className="value">{attr.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="asset-details">
                  <h3>Asset Details</h3>
                  <div className="details-row">
                    <span>Policy ID:</span>
                    <span<span>Policy ID:</span>
                    <span className="hash">{nft.policy_id}</span>
                  </div>
                  <div className="details-row">
                    <span>Asset Name:</span>
                    <span>{nft.asset_name}</span>
                  </div>
                  <div className="details-row">
                    <span>Fingerprint:</span>
                    <span className="hash">{nft.fingerprint}</span>
                  </div>
                </div>
                
                {nft.listing && (
                  <div className="purchase-section">
                    <div className="price-box">
                      <span className="price-label">Price:</span>
                      <span className="price-amount">{formatPrice(nft.listing.price)} ADA</span>
                    </div>
                    
                    {isExpired ? (
                      <div className="expired-notice">This listing has expired</div>
                    ) : connected ? (
                      <button 
                        className="purchase-button"
                        onClick={handlePurchase}
                      >
                        Purchase NFT
                      </button>
                    ) : (
                      <div className="connect-notice">Connect wallet to purchase</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Transaction Modal */}
      <TransactionModal 
        isOpen={txModalOpen}
        onClose={() => setTxModalOpen(false)}
        inProgress={txInProgress}
        txHash={txHash}
        error={txError}
        title="Purchase NFT"
      />
    </div>
  );
}
```

**3. NFT Creation Form**:

```tsx
// src/components/CreateNftForm.tsx
import React, { useState } from 'react';
import { useWallet } from '@meshsdk/react';
import { mintNft } from '../api/marketplace';
import TransactionModal from './TransactionModal';

export default function CreateNftForm() {
  const { connected, wallet } = useWallet();
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [attributes, setAttributes] = useState([
    { trait_type: '', value: '' }
  ]);
  
  // Transaction state
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [txInProgress, setTxInProgress] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);
  
  // Preview image
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle attribute changes
  const handleAttributeChange = (index: number, field: 'trait_type' | 'value', value: string) => {
    const newAttributes = [...attributes];
    newAttributes[index][field] = value;
    setAttributes(newAttributes);
  };
  
  // Add new attribute field
  const addAttribute = () => {
    setAttributes([...attributes, { trait_type: '', value: '' }]);
  };
  
  // Remove attribute field
  const removeAttribute = (index: number) => {
    const newAttributes = [...attributes];
    newAttributes.splice(index, 1);
    setAttributes(newAttributes);
  };
  
  // Form validation
  const isFormValid = () => {
    return (
      name.trim() !== '' &&
      description.trim() !== '' &&
      image !== null &&
      attributes.every(attr => attr.trait_type.trim() !== '' && attr.value.trim() !== '')
    );
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!connected || !image || !isFormValid()) return;
    
    setTxModalOpen(true);
    setTxInProgress(true);
    setTxHash(null);
    setTxError(null);
    
    try {
      // Upload image and mint NFT
      const result = await mintNft(
        wallet,
        name,
        description,
        image,
        attributes
      );
      
      setTxHash(result.txHash);
      
      // Reset form on success
      if (result.txHash) {
        setName('');
        setDescription('');
        setImage(null);
        setImagePreview(null);
        setAttributes([{ trait_type: '', value: '' }]);
      }
    } catch (error) {
      console.error('Minting failed:', error);
      setTxError(error instanceof Error ? error.message : 'Transaction failed');
    } finally {
      setTxInProgress(false);
    }
  };
  
  if (!connected) {
    return (
      <div className="connect-wallet-prompt">
        <h2>Create New NFT</h2>
        <p>Please connect your wallet to create NFTs</p>
      </div>
    );
  }
  
  return (
    <div className="create-nft-form">
      <h2>Create New NFT</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-layout">
          <div className="form-left">
            <div className="form-group">
              <label htmlFor="nft-name">Name</label>
              <input
                type="text"
                id="nft-name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="NFT Name"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="nft-description">Description</label>
              <textarea
                id="nft-description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe your NFT"
                rows={4}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Attributes</label>
              {attributes.map((attr, index) => (
                <div key={index} className="attribute-row">
                  <input
                    type="text"
                    value={attr.trait_type}
                    onChange={e => handleAttributeChange(index, 'trait_type', e.target.value)}
                    placeholder="Trait Type (e.g., Color)"
                    required
                  />
                  <input
                    type="text"
                    value={attr.value}
                    onChange={e => handleAttributeChange(index, 'value', e.target.value)}
                    placeholder="Value (e.g., Blue)"
                    required
                  />
                  {attributes.length > 1 && (
                    <button
                      type="button"
                      className="remove-button"
                      onClick={() => removeAttribute(index)}
                    >
                      &times;
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="add-attribute-button"
                onClick={addAttribute}
              >
                + Add Attribute
              </button>
            </div>
          </div>
          
          <div className="form-right">
            <div className="form-group">
              <label htmlFor="nft-image">Image</label>
              <div className="image-upload-area">
                {imagePreview ? (
                  <div className="image-preview-container">
                    <img src={imagePreview} alt="Preview" className="image-preview" />
                    <button
                      type="button"
                      className="remove-image-button"
                      onClick={() => {
                        setImage(null);
                        setImagePreview(null);
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="upload-placeholder">
                    <input
                      type="file"
                      id="nft-image"
                      onChange={handleImageChange}
                      accept="image/png,image/jpeg,image/gif"
                      required
                      className="file-input"
                    />
                    <label htmlFor="nft-image" className="file-input-label">
                      <div className="upload-icon">+</div>
                      <div>Click to upload image</div>
                      <div className="file-types">PNG, JPG, or GIF</div>
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="form-actions">
          <button
            type="submit"
            className="create-button"
            disabled={!isFormValid()}
          >
            Create NFT
          </button>
        </div>
      </form>
      
      {/* Transaction Modal */}
      <TransactionModal 
        isOpen={txModalOpen}
        onClose={() => setTxModalOpen(false)}
        inProgress={txInProgress}
        txHash={txHash}
        error={txError}
        title="Create NFT"
      />
    </div>
  );
}
```

**4. Transaction Modal Component**:

```tsx
// src/components/TransactionModal.tsx
import React from 'react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  inProgress: boolean;
  txHash: string | null;
  error: string | null;
  title: string;
}

export default function TransactionModal({
  isOpen,
  onClose,
  inProgress,
  txHash,
  error,
  title
}: TransactionModalProps) {
  if (!isOpen) return null;
  
  return (
    <div className="transaction-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{title}</h3>
          {!inProgress && (
            <button className="close-button" onClick={onClose}>
              &times;
            </button>
          )}
        </div>
        
        <div className="modal-body">
          {inProgress && (
            <div className="transaction-progress">
              <div className="spinner"></div>
              <p>Processing transaction...</p>
              <p className="hint">Please confirm in your wallet when prompted</p>
            </div>
          )}
          
          {txHash && (
            <div className="transaction-success">
              <div className="success-icon">✓</div>
              <p>Transaction submitted successfully!</p>
              <div className="tx-details">
                <span>Transaction ID:</span>
                <span className="tx-hash">{txHash}</span>
              </div>
              <a
                href={`https://preprod.cardanoscan.io/transaction/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="explorer-link"
              >
                View on Explorer
              </a>
              <p className="confirmation-note">
                Please allow a few minutes for the transaction to confirm on the blockchain.
              </p>
            </div>
          )}
          
          {error && (
            <div className="transaction-error">
              <div className="error-icon">!</div>
              <p>Transaction failed</p>
              <div className="error-message">{error}</div>
              <button
                className="retry-button"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

### Project Completion and Deployment

Now that we have implemented the core components of our NFT marketplace, let's look at the final steps to complete and deploy the project.

#### Testing

Before deployment, thoroughly test all components:

1. **Smart Contract Testing**:
   - Test all contract paths with various inputs
   - Verify correct handling of edge cases
   - Ensure security properties are maintained

2. **Backend Service Testing**:
   - Test API endpoints with various inputs
   - Verify correct error handling
   - Check performance under load

3. **Frontend Testing**:
   - Test on different browsers and devices
   - Verify wallet integration
   - Test transaction flows

4. **Integration Testing**:
   - End-to-end testing of complete workflows
   - Verify data consistency across components
   - Test error scenarios and recovery

#### Deployment

Deploy your DApp to production:

1. **Smart Contract Deployment**:
   - Deploy to mainnet with proper parameters
   - Verify script addresses and hashes
   - Document deployed contract addresses

2. **Backend Deployment**:
   - Deploy to a reliable hosting service like AWS, Google Cloud, or Heroku
   - Set up monitoring and alerts
   - Configure proper scaling and failover

3. **Frontend Deployment**:
   - Deploy to a CDN or static hosting service like Netlify or Vercel
   - Configure proper caching and performance optimizations
   - Set up analytics to track usage

4. **Domain and SSL**:
   - Configure a custom domain
   - Set up SSL certificates
   - Ensure proper security headers

#### Monitoring and Maintenance

After deployment, maintain your DApp:

1. **Performance Monitoring**:
   - Track transaction throughput and success rates
   - Monitor API response times
   - Set up alerts for anomalies

2. **Security Monitoring**:
   - Watch for unusual transaction patterns
   - Monitor for contract exploits
   - Keep dependencies updated

3. **User Feedback**:
   - Collect and analyze user feedback
   - Identify pain points and areas for improvement
   - Prioritize feature requests

4. **Ongoing Development**:
   - Implement new features
   - Fix bugs and improve user experience
   - Adapt to ecosystem changes

### Key Resources:
- [Web3 Application Architecture](https://ethereum.org/en/developers/docs/dapps/)
- [Frontend Design for Blockchain](https://ethereum.org/en/developers/tutorials/set-up-web3js-to-use-ethereum-in-javascript/)
- [dApp Testing Strategies](https://consensys.github.io/smart-contract-best-practices/security-tools/testing/)
- [Production Deployment Checklist](https://12factor.net/)

## Practice Exercises

1. **NFT Marketplace**:
   - Implement a simplified NFT marketplace with minting and listing functionality
   - Create a frontend that displays available NFTs
   - Add wallet integration and transaction flows

2. **Token Swap Application**:
   - Create a contract for token swaps
   - Build a user interface for creating and accepting swap offers
   - Implement proper error handling and transaction feedback

3. **DAO Voting Mechanism**:
   - Implement voting contracts with token weighting
   - Build an interface for proposal creation and voting
   - Display voting results and implement execution mechanics

4. **Timelock Vault**:
   - Create a contract for time-locked asset storage
   - Build an interface showing lock status and time remaining
   - Implement withdrawal mechanics with proper validation

5. **Extended Challenge**:
   - Build a complete production-ready dApp of your choice
   - Implement proper error handling, security, and optimization
   - Deploy to testnet and create a demonstration video

## Next Steps

Congratulations on completing the Cardano Development with Aiken course! You now have the knowledge and skills to build complete decentralized applications on Cardano.

To continue your journey:

1. **Join the Cardano Developer Community**:
   - Participate in the [Cardano Stack Exchange](https://cardano.stackexchange.com/)
   - Join the [Cardano Developer Discord](https://discord.gg/Qq5vNTg9PT)
   - Follow [Cardano Developers](https://twitter.com/CardanoDevelopers) on Twitter

2. **Contribute to Ecosystem Projects**:
   - Explore open-source Cardano projects
   - Submit pull requests and improvements
   - Build libraries and tools for other developers

3. **Participate in Hackathons**:
   - Join Cardano hackathons to test your skills
   - Collaborate with other developers
   - Build innovative solutions to real-world problems

4. **Stay Updated**:
   - Follow the [Cardano roadmap](https://roadmap.cardano.org/)
   - Keep up with CIPs (Cardano Improvement Proposals)
   - Experiment with new features as they're released

## Additional Resources

### Development Resources:
- [Cardano Developer Portal](https://developers.cardano.org/)
- [Aiken Documentation](https://aiken-lang.org/)
- [Mesh SDK Documentation](https://meshjs.dev/)

### Blockchain Explorers:
- [Cardanoscan](https://cardanoscan.io/)
- [Cexplorer](https://cexplorer.io/)
- [Adastat](https://adastat.net/)

### API Providers:
- [Blockfrost](https://blockfrost.io/)
- [Maestro](https://www.gomaestro.org/dapp-platform)
- [Koios](https://koios.rest/)

### Community and Support:
- [Cardano Forum](https://forum.cardano.org/)
- [Cardano Stack Exchange](https://cardano.stackexchange.com/)
- [Aiken GitHub](https://github.com/aiken-lang/aiken)

Remember that the blockchain space is constantly evolving. Keep learning, experimenting, and building to stay at the forefront of Cardano development!