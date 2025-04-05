# Module 2: Smart Contract Development with Aiken

In this module, you'll dive deep into Aiken programming and smart contract development on Cardano. Building on the fundamentals from Module 1, you'll learn how to create, test, and deploy various types of validators for real-world use cases.

![Aiken Smart Contract Development](https://placehold.co/600x400)

## 2.1 Deep Dive into the eUTxO Model

Before writing advanced smart contracts, it's essential to understand how the eUTxO model influences contract design and execution.

### Transaction Structure in Detail

A Cardano transaction consists of several key components:

**Inputs**:
- References to existing UTXOs (transaction hash + output index)
- Each input must be fully consumed
- Inputs can be from regular addresses or script addresses

**Outputs**:
- New UTXOs created by the transaction
- Each contains an address, value, and optional datum
- The sum of output values + fees must equal input values

**Datums**:
- Arbitrary data attached to script outputs
- Serves as on-chain state for smart contracts
- Must be provided when spending a script UTXO

**Redeemers**:
- Transaction-specific data provided for script execution
- Different from datum - specific to the spending transaction
- Controls how the script validates the spend

**Validity Intervals**:
- Time range in which the transaction is valid
- Specified as slot numbers or POSIX time
- Enables time-based contract conditions

![Detailed Transaction Structure](https://placehold.co/600x400)

### Script Execution Process

When a transaction attempts to spend a script-controlled UTXO, the following process occurs:

1. **Phase 1: UTxO Selection**
   - Transaction specifies which UTXOs to consume
   - Script UTXOs require appropriate datum and redeemer

2. **Phase 2: Validation**
   - For each script input, the corresponding validator is executed
   - Validator receives datum, redeemer, and script context
   - All validators must return `True` for the transaction to be valid

3. **Phase 3: Execution**
   - If all validations pass, inputs are consumed
   - New outputs are created
   - Ledger state is updated

This process ensures that script execution is deterministic and can be verified by all network participants.

### State Management in eUTxO

Unlike account-based models, eUTxO does not have persistent storage for contracts. Instead, state is managed through the UTXOs themselves:

**State Representation**:
- Contract state is stored in datum attached to UTXOs
- To update state, consume the existing UTXO and create a new one
- The "current state" is represented by unspent script outputs

**State Transition Patterns**:
- Linear: Single UTXO represents the current state
- Forking: Multiple UTXOs represent different branches of state
- Merging: Combine multiple state UTXOs into one

**Concurrency Considerations**:
- Multiple users attempting to update the same state UTXO will conflict
- Only one transaction can consume a given UTXO
- Patterns like state channels and resource tokens help mitigate concurrency issues

Understanding these patterns is crucial for designing effective smart contracts on Cardano.

### Key Resources:
- [eUTxO Deep Dive](https://ucarecdn.com/3da33f2f-73ac-4c9b-844b-f215dcce0628/EUTXOhandbook_for_EC.pdf)
- [Concurrency Solutions in Cardano](https://iohk.io/en/blog/posts/2021/09/10/concurrency-and-all-that-cardano-smart-contracts-and-the-eutxo-model/)
- [Transaction Validation Rules](https://docs.cardano.org/plutus/transaction-validation/)

## 2.2 Aiken Language Fundamentals

Aiken provides a modern, ergonomic language for writing Cardano smart contracts. Let's explore its core features and syntax.

### Type System

Aiken has a strong, static type system that helps catch errors at compile time:

**Built-in Types**:
```rust
// Primitive types
let a: Int = 42                   // Signed integer
let b: ByteArray = #"deadbeef"    // Raw bytes
let c: Bool = True                // Boolean
let d: String = "Hello, Cardano"  // String (UTF-8)

// Collection types
let e: List<Int> = [1, 2, 3, 4]   // List of integers
let f: (Int, String) = (42, "answer") // Tuple
```

**Custom Types**:
```rust
// Type alias
type PublicKeyHash = ByteArray

// Record type
type TokenPolicy {
  policy_id: ByteArray,
  asset_name: ByteArray,
  amount: Int,
}

// Enumeration (with variants)
type Action {
  Mint
  Burn(Int)
  Transfer { from: ByteArray, to: ByteArray, amount: Int }
}
```

**Type Safety Features**:
- No implicit type conversion
- Exhaustive pattern matching
- Type inference for cleaner code
- Generic types for reusable components

![Aiken Type System Examples](https://placehold.co/600x400)

### Functions and Control Flow

Aiken uses pure functions and pattern matching for control flow:

**Function Definition**:
```rust
// Simple function
fn add(a: Int, b: Int) -> Int {
  a + b
}

// Function with pattern matching
fn is_empty(items: List<a>) -> Bool {
  when items is {
    [] -> True
    _ -> False
  }
}

// Anonymous function (lambda)
let double = fn(x) { x * 2 }
```

**Pattern Matching**:
```rust
fn describe_list(items: List<Int>) -> String {
  when items is {
    [] -> "Empty list"
    [x] -> "Single item: " ++ to_string(x)
    [x, y, ..rest] -> "List starting with " ++ to_string(x) ++ " and " ++ to_string(y)
    _ -> "Some other list"
  }
}
```

**Control Flow with Results**:
```rust
type Error {
  InvalidAmount
  InsufficientFunds
  Unauthorized
}

fn transfer(amount: Int, balance: Int) -> Result<Int, Error> {
  if amount <= 0 {
    Error(InvalidAmount)
  } else if amount > balance {
    Error(InsufficientFunds)
  } else {
    Ok(balance - amount)
  }
}

// Using the Result
let result = transfer(50, 100)
let new_balance = when result is {
  Ok(balance) -> balance
  Error(e) -> panic(e)
}
```

### Working with Lists and Data

Manipulating collections and data is a common task in smart contracts:

**List Operations**:
```rust
use aiken/list

// Creating and accessing lists
let numbers = [1, 2, 3, 4, 5]
let first = list.at(numbers, 0)? // Returns Option<Int>

// Transforming lists
let doubled = list.map(numbers, fn(n) { n * 2 }) // [2, 4, 6, 8, 10]
let even_numbers = list.filter(numbers, fn(n) { n % 2 == 0 }) // [2, 4]
let sum = list.foldl(numbers, 0, fn(acc, n) { acc + n }) // 15

// Combining lists
let more_numbers = [6, 7, 8]
let combined = list.concat(numbers, more_numbers) // [1, 2, 3, 4, 5, 6, 7, 8]
```

**Working with Option and Result Types**:
```rust
// Option type for values that might be missing
let maybe_value: Option<Int> = Some(42)
let extracted = when maybe_value is {
  Some(value) -> value
  None -> 0
}

// Result type for operations that might fail
type MathError {
  DivByZero
}

fn safe_divide(a: Int, b: Int) -> Result<Int, MathError> {
  if b == 0 {
    Error(DivByZero)
  } else {
    Ok(a / b)
  }
}

// Using a Result
let result = safe_divide(10, 2)
let answer = when result is {
  Ok(value) -> value
  Error(_) -> 0
}
```

### Key Resources:
- [Aiken Language Tour](https://aiken-lang.org/language-tour/getting-started)
- [Type System Documentation](https://aiken-lang.org/language-tour/built-in-types)
- [Pattern Matching Guide](https://aiken-lang.org/language-tour/pattern-matching)

## 2.3 Writing Validators in Aiken

Now that we understand the language fundamentals, let's focus on writing validators—the core of Cardano smart contracts.

### Validator Structure

All Aiken validators follow a common structure:

```rust
use aiken/transaction.{ScriptContext}

validator {
  fn validate(datum: Datum, redeemer: Redeemer, context: ScriptContext) -> Bool {
    // Validation logic goes here
    True
  }
}
```

The key components are:
- **Datum**: State or data attached to the UTXO
- **Redeemer**: Data provided by the spending transaction
- **ScriptContext**: Information about the transaction and execution
- **Return Value**: Boolean indicating whether validation passes

### Types of Validators

Cardano supports three main types of validators:

**1. Spending Validators**:
Control how UTXOs at a script address can be spent.

```rust
use aiken/transaction.{ScriptContext, Spend}

validator {
  fn spend_validator(datum: Data, redeemer: Data, context: ScriptContext) -> Bool {
    when context.purpose is {
      Spend(output_reference) -> {
        // Validate spending conditions
        True
      }
      _ -> False
    }
  }
}
```

**2. Minting Policies**:
Control the creation and destruction of native tokens.

```rust
use aiken/transaction.{ScriptContext, Mint}
use aiken/transaction/value.{PolicyId}

validator {
  fn mint_policy(redeemer: Data, context: ScriptContext) -> Bool {
    when context.purpose is {
      Mint(policy_id) -> {
        // Validate minting conditions
        True
      }
      _ -> False
    }
  }
}
```

**3. Stake Validators**:
Control delegation and stake-related operations.

```rust
use aiken/transaction.{ScriptContext, Stake}

validator {
  fn stake_validator(redeemer: Data, context: ScriptContext) -> Bool {
    when context.purpose is {
      Stake(stake_credential) -> {
        // Validate staking conditions
        True
      }
      _ -> False
    }
  }
}
```

![Validator Types](https://placehold.co/600x400)

### Building a Spending Validator

Let's build a spending validator that implements a simple vesting contract:

```rust
use aiken/transaction.{ScriptContext, Spend, Transaction}
use aiken/transaction/credential.{VerificationKey, verify}
use aiken/hash.{Blake2b_224, Hash}
use aiken/interval.{Interval, after}
use aiken/time.{PosixTime}

type VerificationKeyHash = Hash<Blake2b_224, VerificationKey>

type VestingDatum {
  // Beneficiary who can claim funds
  beneficiary: VerificationKeyHash,
  // Unlock time when funds become available
  unlock_time: PosixTime,
}

type VestingRedeemer {
  Claim
}

validator {
  fn vesting(datum: VestingDatum, redeemer: VestingRedeemer, ctx: ScriptContext) -> Bool {
    when ctx.purpose is {
      Spend(_) -> {
        // Get the transaction being validated
        let Transaction { validity_range, inputs, .. } = ctx.transaction
        
        // Check if we're after the unlock time
        let time_condition = after(validity_range, datum.unlock_time)
        
        // Check if the beneficiary signed the transaction
        let signed_by_beneficiary = transaction.is_signed_by(ctx.transaction, datum.beneficiary)
        
        // Both conditions must be met
        time_condition && signed_by_beneficiary
      }
      _ -> False
    }
  }
}
```

This validator ensures that:
1. The transaction is only valid after the unlock time
2. The beneficiary's signature is present in the transaction

### Creating a Minting Policy

Now let's implement a simple NFT minting policy:

```rust
use aiken/transaction.{ScriptContext, Mint, spend_input}
use aiken/transaction/value.{AssetName}
use aiken/hash.{Blake2b_224, Hash}
use aiken/list

type MintRedeemer {
  // No special data needed for this example
}

validator {
  fn nft_policy(redeemer: MintRedeemer, ctx: ScriptContext) -> Bool {
    when ctx.purpose is {
      Mint(policy_id) -> {
        // Get the minted assets under this policy
        let minted_assets = value.from_minted_value(ctx.transaction.mint)
          |> value.tokens(policy_id)
          |> map.to_list()
        
        // Check we're minting exactly one token with quantity 1
        when minted_assets is {
          [(asset_name, quantity)] -> {
            // Ensure quantity is exactly 1
            if quantity != 1 {
              False
            } else {
              // Ensure NFT can only be minted once by requiring a specific UTXO
              // (this makes it a true NFT)
              let must_consume_utxo = #"deadbeef..."
              
              list.any(
                ctx.transaction.inputs,
                fn(input) { input.output_reference.transaction_id == must_consume_utxo }
              )
            }
          }
          _ -> False
        }
      }
      _ -> False
    }
  }
}
```

This policy ensures:
1. Exactly one token is minted with quantity 1
2. A specific UTXO must be consumed (ensuring the policy can only be used once)

### Parameterized Contracts

Often, we want to reuse contract logic with different parameters. Aiken supports parameterized contracts through its blueprint system:

```rust
use aiken/transaction.{ScriptContext}
use aiken/hash.{Blake2b_224, Hash}
use aiken/transaction/credential.{VerificationKey}

type VerificationKeyHash = Hash<Blake2b_224, VerificationKey>

// Parameters defined in the blueprint
type MultiSigParams {
  // Required number of signatures
  required_signatures: Int,
  // List of allowed signers
  allowed_signers: List<VerificationKeyHash>,
}

validator(params: MultiSigParams) {
  fn multi_sig(_datum: Data, _redeemer: Data, ctx: ScriptContext) -> Bool {
    // Count how many of the allowed signers signed the transaction
    let signature_count = 
      list.count(
        params.allowed_signers,
        fn(signer) { transaction.is_signed_by(ctx.transaction, signer) }
      )
    
    // Ensure we have enough signatures
    signature_count >= params.required_signatures
  }
}
```

When compiling this contract, you can generate different instances by providing different parameters:

```bash
# Compile with parameters for a 2-of-3 multisig
aiken build \
  --blueprint-params '{"required_signatures": 2, "allowed_signers": ["abc...", "def...", "ghi..."]}'
```

### Key Resources:
- [Aiken Validator Guide](https://aiken-lang.org/example--hello-world/validator)
- [Minting Policies](https://aiken-lang.org/example--nft/minting)
- [Parameterized Contracts](https://aiken-lang.org/language-tour/parameters)

## 2.4 Testing Smart Contracts

Testing is crucial for smart contract development to avoid costly bugs. Aiken includes a built-in testing framework.

### Unit Testing Basics

Aiken tests are defined using the `test` keyword:

```rust
use validators/vesting

// Simple test function
test vesting_after_deadline() {
  // Create test data
  let datum = VestingDatum {
    beneficiary: #"deadbeef...",
    unlock_time: 1000,
  }
  
  let redeemer = Claim
  
  // Create a script context where the current time is after unlock_time
  let context = create_test_context(
    validity_range: interval.after(1500),
    signatories: [#"deadbeef..."],
  )
  
  // Verify the validator returns True
  vesting.validate(datum, redeemer, context) == True
}

// Test expected failure
test vesting_before_deadline_fails() {
  // Similar setup but with time before unlock_time
  let datum = VestingDatum {
    beneficiary: #"deadbeef...",
    unlock_time: 2000,
  }
  
  let context = create_test_context(
    validity_range: interval.before(1500),
    signatories: [#"deadbeef..."],
  )
  
  // Verify the validator returns False
  vesting.validate(datum, Claim, context) == False
}
```

### Creating Test Contexts

To test validators effectively, you need to create realistic `ScriptContext` values:

```rust
fn create_test_context(
  validity_range: Interval<PosixTime>,
  signatories: List<VerificationKeyHash>,
) -> ScriptContext {
  ScriptContext {
    transaction: Transaction {
      inputs: [],
      outputs: [],
      fee: value.zero(),
      validity_range: validity_range,
      signatories: signatories,
      mint: value.from_asset("", "", 0),
      // Other fields...
    },
    purpose: Spend(OutputReference { transaction_id: #"", output_index: 0 }),
  }
}
```

### Testing Strategies

Apply these strategies for comprehensive testing:

**1. Test Happy Paths**:
- Validate expected successful conditions
- Cover all valid use cases

**2. Test Edge Cases**:
- Boundary values (e.g., exactly at unlock time)
- Empty lists, zero values
- Maximum input sizes

**3. Test Failure Modes**:
- Ensure validation fails when it should
- Verify that proper security checks prevent unauthorized actions

**4. Test Interaction Patterns**:
- Multiple transactions forming a sequence
- Competing transactions attempting to use the same resource

### Running Tests

Execute tests using the Aiken CLI:

```bash
# Run all tests
aiken check

# Run tests with more verbose output
aiken check -v

# Run specific test file
aiken check tests/vesting_test.ak
```

![Testing Output](https://placehold.co/600x400)

### Key Resources:
- [Aiken Testing Guide](https://aiken-lang.org/language-tour/testing)
- [Test Utilities](https://aiken-lang.org/language-tour/packages)
- [Testing Best Practices](https://aiken-lang.org/example--best-practices/testing)

## 2.5 Advanced Contract Patterns

Now let's explore some advanced patterns that are useful for real-world applications.

### State Machines

Many contracts can be modeled as state machines, where assets move through defined states:

```rust
use aiken/transaction.{ScriptContext, Spend}

type State {
  Created
  Active
  Completed
  Cancelled
}

type StateMachineDatum {
  current_state: State,
  owner: ByteArray,
  // Other state data...
}

type StateTransition {
  Activate
  Complete
  Cancel
}

validator {
  fn state_machine(datum: StateMachineDatum, redeemer: StateTransition, ctx: ScriptContext) -> Bool {
    when ctx.purpose is {
      Spend(_) -> {
        // Ensure owner signed the transaction
        let signed_by_owner = transaction.is_signed_by(ctx.transaction, datum.owner)
        
        // Validate state transition
        let valid_transition = when (datum.current_state, redeemer) is {
          // Valid transitions
          (Created, Activate) -> True
          (Active, Complete) -> True
          (Active, Cancel) -> True
          // Any other transition is invalid
          _ -> False
        }
        
        // Both conditions must be met
        signed_by_owner && valid_transition
      }
      _ -> False
    }
  }
}
```

### Multi-Party Contracts

Contracts involving multiple participants require careful design:

```rust
use aiken/transaction.{ScriptContext, Spend}

type Party {
  key_hash: ByteArray,
  role: Role,
}

type Role {
  Buyer
  Seller
  Arbiter
}

type EscrowDatum {
  parties: List<Party>,
  item_price: Int,
  deposit_paid: Bool,
  item_delivered: Bool,
  dispute_raised: Bool,
}

type EscrowAction {
  PayDeposit
  ConfirmDelivery
  RaiseDispute
  ResolveDispute { in_favor_of_buyer: Bool }
  Cancel
}

validator {
  fn escrow(datum: EscrowDatum, action: EscrowAction, ctx: ScriptContext) -> Bool {
    when ctx.purpose is {
      Spend(_) -> {
        // Find specific parties by role
        let buyer = find_party_by_role(datum.parties, Buyer)
        let seller = find_party_by_role(datum.parties, Seller)
        let arbiter = find_party_by_role(datum.parties, Arbiter)
        
        // Check who signed the transaction
        let buyer_signed = transaction.is_signed_by(ctx.transaction, buyer.key_hash)
        let seller_signed = transaction.is_signed_by(ctx.transaction, seller.key_hash)
        let arbiter_signed = transaction.is_signed_by(ctx.transaction, arbiter.key_hash)
        
        // Validate action
        when action is {
          PayDeposit -> buyer_signed && !datum.deposit_paid
          ConfirmDelivery -> buyer_signed && datum.deposit_paid && !datum.item_delivered
          RaiseDispute -> buyer_signed && datum.deposit_paid && !datum.dispute_raised
          ResolveDispute { in_favor_of_buyer } -> arbiter_signed && datum.dispute_raised
          Cancel -> {
            if datum.deposit_paid {
              buyer_signed && seller_signed  // Both must agree after deposit
            } else {
              buyer_signed  // Only buyer can cancel before deposit
            }
          }
        }
      }
      _ -> False
    }
  }
}
```

### Oracle Integration

Smart contracts often need off-chain data, which can be provided through oracles:

```rust
use aiken/transaction.{ScriptContext, Spend}

type OracleFeed {
  oracle_public_key: ByteArray,
  last_update_time: Int,
  exchange_rate: Int,  // Price in lovelace (millionths of ADA)
}

type PriceDatum {
  oracle_feed: OracleFeed,
  base_price: Int,
  // Other data...
}

type BuyAction {
  // Action data...
}

validator {
  fn price_controlled_purchase(datum: PriceDatum, action: BuyAction, ctx: ScriptContext) -> Bool {
    when ctx.purpose is {
      Spend(_) -> {
        // Check oracle signature
        let oracle_signed = transaction.is_signed_by(ctx.transaction, datum.oracle_feed.oracle_public_key)
        
        // Check oracle data is recent (within last 24 hours)
        let current_time = interval.start(ctx.transaction.validity_range)
        let oracle_data_fresh = current_time - datum.oracle_feed.last_update_time < 86400000
        
        // Calculate price in ADA based on oracle exchange rate
        let price_in_lovelace = datum.base_price * datum.oracle_feed.exchange_rate
        
        // Check payment is sufficient
        let payment_sufficient = validate_payment(ctx, price_in_lovelace)
        
        // All conditions must be met
        oracle_signed && oracle_data_fresh && payment_sufficient
      }
      _ -> False
    }
  }
}
```

### Handling Time Constraints

Time-based logic is common in contracts:

```rust
use aiken/transaction.{ScriptContext}
use aiken/interval.{Interval, before, after, during}
use aiken/time.{PosixTime}

type TimeConstraint {
  NotBefore(PosixTime)
  NotAfter(PosixTime)
  Between(PosixTime, PosixTime)
}

fn validate_time_constraint(constraint: TimeConstraint, validity_range: Interval<PosixTime>) -> Bool {
  when constraint is {
    NotBefore(min_time) -> after(validity_range, min_time)
    NotAfter(max_time) -> before(validity_range, max_time)
    Between(min_time, max_time) -> {
      after(validity_range, min_time) && before(validity_range, max_time)
    }
  }
}
```

### Key Resources:
- [State Machine Example](https://aiken-lang.org/example--state-machine)
- [Multi-Signature Patterns](https://aiken-lang.org/example--multi-sig)
- [Oracle Integration Guide](https://github.com/aiken-lang/aiken/tree/main/examples/oracles)

## Practice Exercises

1. **Basic Spending Validator**:
   - Create a spending validator that requires a specific signature
   - Write tests for both successful and failed validation
   - Compile the validator and examine the output

2. **NFT Minting Policy**:
   - Implement a minting policy for an NFT collection
   - Add metadata handling for the NFTs
   - Limit minting to a specific quantity or time period

3. **State Machine Contract**:
   - Design a simple auction contract as a state machine
   - Implement state transitions for bidding and ending the auction
   - Test all valid and invalid state transitions

4. **Multi-Party Escrow**:
   - Extend the escrow example with refund mechanisms
   - Add a timeout for automatic resolution
   - Test different scenarios including disputes

5. **Extended Challenge**:
   - Create a token-controlled validator (one that requires specific tokens to use)
   - Implement a voting mechanism with token weights
   - Write comprehensive tests for all edge cases

## Next Steps

Congratulations on completing Module 2! You now have a solid understanding of Aiken smart contract development. In the next module, you'll learn how to interact with your contracts from off-chain code using Mesh SDK and cardano-cli.

Before moving on:
- Make sure you understand the eUTxO model and how it affects contract design
- Verify that you can write and test validators for different use cases
- Review any patterns that were challenging to implement
- Experiment with combining different patterns into more complex contracts

## Additional Resources

- [Aiken Documentation](https://aiken-lang.org/)
- [Aiken GitHub Repository](https://github.com/aiken-lang/aiken)
- [Aiken Examples](https://aiken-lang.org/examples)
- [Cardano Developer Portal](https://developers.cardano.org/)
- [Plutus Core Specification](https://hydra.iohk.io/build/7654130/download/1/plutus-core-specification.pdf)
- [Marlowe: Alternative Smart Contract Language](https://marlowe.iohk.io/)
- [Cardano Blockchain Insights](https://insights.adastat.net/)