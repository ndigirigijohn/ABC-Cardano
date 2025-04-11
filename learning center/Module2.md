# Module 2: Smart Contract Development with Aiken

In this module, you'll dive deep into Aiken programming and smart contract development on Cardano. Building on the fundamentals from Module 1, you'll learn how to create, test, and deploy various types of validators for real-world use cases.

![Aiken Smart Contract Development](/learning%20center/assets/M02.webp)


## Module Structure

### 2.1 [Deep Dive into the eUTxO Model](#21-deep-dive-into-the-eutxo-model)
- [Transaction Structure in Detail](#transaction-structure-in-detail)
- [Script Execution Process](#script-execution-process)
- [State Management in eUTxO](#state-management-in-eutxo)
- [Key Resources](#key-resources)

### 2.2 [Aiken Language Fundamentals](#22-aiken-language-fundamentals)
- [Type System](#type-system)
- [Functions and Control Flow](#functions-and-control-flow)
- [Working with Lists and Data](#working-with-lists-and-data)
- [Key Resources](#key-resources-1)

### 2.3 [Writing Validators in Aiken](#23-writing-validators-in-aiken)
- [Validator Structure](#validator-structure)
- [Types of Validators](#types-of-validators)
- [Building a Spending Validator](#building-a-spending-validator)
- [Creating a Minting Policy](#creating-a-minting-policy)
- [Managing Optional Datum](#managing-optional-datum)
- [Fallback Handler](#fallback-handler)
- [Parameterized Contracts](#parameterized-contracts)
- [Testing Validators](#testing-validators)

### [Practice Exercises](#practice-exercises-1)
### [Next Steps](#next-steps-1)
### [Key Resources](#key-resources-3)

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

![Detailed Transaction Structure](/learning%20center/assets/M02EUTXO.png)

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
- [Concurrency Solutions in Cardano](https://docs.cardano.org/about-cardano/explore-more/concurrency#:~:text=Concurrency%20refers%20to%20the%20ability,operations%20without%20causing%20system%20failures.)
- [Transaction Validation Rules](https://www.cardanesia.com/post/how-transactions-being-validated-on-cardano-blockchain)

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

![Aiken Type System Examples](/learning%20center/assets/M02Aiken.png)

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
- [Aiken Language Tour](https://aiken-lang.org/language-tour)

# 2.3 Writing Validators in Aiken

Now that we understand the language fundamentals, let's focus on writing validators—the core of Cardano smart contracts.

## Validator Structure

In Aiken, validators are defined using the `validator` keyword and can contain one or more handler functions:

```rust
use cardano/assets.{PolicyId}
use cardano/transaction.{Transaction}
 
validator my_script {
  mint(redeemer: MyRedeemer, policy_id: PolicyId, self: Transaction) {
    todo @"validator logic goes here"
  }
}
```

As shown above, a validator is a named block that contains handlers. Each handler is a predicate function that must return `True` or `False`.

## Types of Validators

Cardano supports several validator types through different handler names:

```rust
use cardano/address.{Credential}
use cardano/assets.{PolicyId}
use cardano/certificate.{Certificate}
use cardano/governance.{ProposalProcedure, Voter}
use cardano/transaction.{Transaction, OutputReference}
 
validator my_script {
  mint(redeemer: MyMintRedeemer, policy_id: PolicyId, self: Transaction) {
    todo @"mint logic goes here"
  }
 
  spend(datum: Option<MyDatum>, redeemer: MySpendRedeemer, utxo: OutputReference, self: Transaction) {
    todo @"spend logic goes here"
  }
 
  withdraw(redeemer: MyWithdrawRedeemer, account: Credential, self: Transaction) {
    todo @"withdraw logic goes here"
  }
 
  publish(redeemer: MyPublishRedeemer, certificate: Certificate, self: Transaction) {
    todo @"publish logic goes here"
  }
 
  vote(redeemer: MyVoteRedeemer, voter: Voter, self: Transaction) {
    todo @"vote logic goes here"
  }
 
  propose(redeemer: MyProposeRedeemer, proposal: ProposalProcedure, self: Transaction) {
    todo @"propose logic goes here"
  }
}
```

Each handler deals with a specific purpose:

1. **mint** - For minting or burning native tokens
2. **spend** - For controlling how UTXOs at a script address can be spent
3. **withdraw** - For withdrawing staking rewards
4. **publish** - For publishing delegation certificates
5. **vote** - For voting on governance proposals
6. **propose** - For constitution guardrails, executed when submitting governance proposals

With the exception of `spend`, handlers take three arguments:
- A redeemer (user-defined type)
- A target (type depends on the purpose)
- A transaction (the script context)

The `spend` handler takes an additional first argument: an optional datum.

## Building a Spending Validator

Let's explore a complete spending validator example:

```rust
use aiken/collection/list
use aiken/crypto.{VerificationKeyHash}
use aiken/primitive/string
use cardano/transaction.{OutputReference, Transaction}
 
pub type Datum {
  owner: VerificationKeyHash,
}
 
pub type Redeemer {
  msg: ByteArray,
}
 
validator hello_world {
  spend(
    datum: Option<Datum>,
    redeemer: Redeemer,
    _own_ref: OutputReference,
    self: Transaction,
  ) {
    trace @"redeemer": string.from_bytearray(redeemer.msg)
 
    expect Some(Datum { owner }) = datum
 
    let must_say_hello = redeemer.msg == "Hello, World!"
 
    let must_be_signed = list.has(self.extra_signatories, owner)
 
    must_say_hello? && must_be_signed?
  }
}
```

This validator ensures that:
1. The datum contains an owner key hash
2. The redeemer must contain the string "Hello, World!"
3. The transaction must be signed by the owner

The `?` operator traces the expression if it evaluates to `False`, which helps with debugging.

## Creating a Minting Policy

Here's an example of a simple minting policy that requires a specific UTxO to be consumed:

```rust
use aiken/collection/list
use cardano/assets.{PolicyId}
use cardano/transaction.{Transaction, OutputReference}
 
validator my_script(utxo_ref: OutputReference) {
  mint(redeemer: Data, policy_id: PolicyId, self: Transaction) {
    expect list.any(
      self.inputs,
      fn (input) { input.output_reference == utxo_ref }
    )
    todo @"rest of the logic goes here"
  }
}
```

This minting policy ensures that a specific UTxO is consumed during minting, which guarantees the policy can only be used once (since UTxOs can only be spent once).

## Managing Optional Datum

Because the datum in a spending validator might not always be present, it's provided as an `Option<T>`. You can enforce that a datum is present using `expect`:

```rust
use cardano/transaction.{Transaction, OutputReference}
 
validator my_script {
  spend(datum_opt: Option<MyDatum>, redeemer: MyRedeemer, input: OutputReference, self: Transaction) {
    expect Some(datum) = datum_opt
    todo @"validator logic goes here"
  }
}
```

## Fallback Handler

For cases where you need to handle multiple purposes or want to catch unhandled purposes, you can use a fallback handler:

```rust
use cardano/assets.{PolicyId}
use cardano/transaction.{Transaction, OutputReference}
use cardano/script_context.{ScriptContext}
 
validator my_multi_purpose_script {
  mint(redeemer: MyRedeemer, policy_id: PolicyId, self: Transaction) {
    todo @"validator logic goes here"
  }
 
  spend(datum_opt: Option<MyDatum>, redeemer: MyRedeemer, input: OutputReference, self: Transaction) {
    expect Some(datum) = datum_opt
    todo @"validator logic goes here"
  }
 
  else(_ctx: ScriptContext) {
    fail @"unsupported purpose"
  }
}
```

When no fallback is explicitly specified, Aiken defaults to a validator that always rejects.

## Parameterized Contracts

Validators can take parameters, which represent configuration elements provided when creating an instance of the validator:

```rust
use aiken/collection/list
use cardano/assets.{PolicyId}
use cardano/transaction.{Transaction, OutputReference}
 
validator my_script(utxo_ref: OutputReference) {
  mint(redeemer: Data, policy_id: PolicyId, self: Transaction) {
    expect list.any(
      self.inputs,
      fn (input) { input.output_reference == utxo_ref }
    )
    todo @"rest of the logic goes here"
  }
}
```

In this example, the validator is parameterized with a UTxO reference to ensure uniqueness of execution.

## Testing Validators

Testing is an essential part of smart contract development. Here's how to test a validator:

```rust
test hello_world_example() {
  let datum =
    Datum { owner: #"00000000000000000000000000000000000000000000000000000000" }
 
  let redeemer = Redeemer { msg: "Hello, World!" }
 
  let placeholder_utxo = OutputReference { transaction_id: "", output_index: 0 }
 
  hello_world.spend(
    Some(datum),
    redeemer,
    placeholder_utxo,
    Transaction { ..transaction.placeholder, extra_signatories: [datum.owner] },
  )
}
```

This test checks if our `hello_world` validator correctly validates when provided with the proper inputs.

Running the test with `aiken check` will execute the validator and report on success or failure, including any traces and execution costs:

```
❯ aiken check
        
  ┍━ hello_world ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  │ PASS [mem: 32451, cpu: 11921833] hello_world_example
  │ · with traces
  │ | redeemer: Hello, World!
  ┕━━━━━━━━━━━━━━━━━━━━━━━ 1 tests | 1 passed | 0 failed
```

## Practice Exercises

1. **Basic Spending Validator**:
   - Create a spending validator similar to the "Hello, World!" example, but require multiple signatures
   - Add a time constraint that only allows spending after a certain timestamp
   - Write tests for both successful and failed validation scenarios

2. **NFT Minting Policy**:
   - Implement a minting policy that can only mint once using the UTxO reference technique
   - Add a condition that limits the total number of tokens that can be minted
   - Ensure the policy enforces a specific naming convention for the tokens

3. **Multi-Purpose Validator**:
   - Create a validator with both spend and mint handlers
   - Implement a fallback handler that rejects other purposes with a meaningful error message
   - Write tests that verify the behavior of each handler

4. **Parameterized Contract**:
   - Design a token vesting contract that accepts parameters for the beneficiary and unlock time
   - Implement the spend validator logic to enforce the vesting schedule
   - Test the contract with different parameter values

5. **Debugging with Traces**:
   - Take one of the above exercises and add detailed traces
   - Use the trace-if-false operator `?` on all logical conditions
   - Run the tests with `aiken check` and analyze the trace output

## Next Steps

After mastering the basics of validator writing, you should:

1. **Explore Advanced Testing**: Learn to create more sophisticated test scenarios, including testing edge cases and failure modes.

2. **Understand Plutus Core**: Gain a deeper understanding of the compilation target and how your Aiken code translates to executable on-chain code.

3. **Study Contract Composition**: Learn how multiple validators can interact within a transaction to create complex applications.

4. **Investigate Common Patterns**: Familiarize yourself with established patterns like state machines, oracles, and multi-signature schemes.

5. **Experiment with Integration**: Try building a simple end-to-end application that includes both on-chain validators and off-chain code.

6. **Review Security Considerations**: Study common security pitfalls and best practices for secure smart contract development.

Before moving on to the next module, make sure you can write and test different types of validators and understand how they interact with the Cardano ledger.

## Key Resources

- [Aiken Language Tour - Validators](https://aiken-lang.org/language-tour/validators)
- [Aiken Hello World Example](https://aiken-lang.org/example--hello-world)
- [CIP-0057 Plutus Blueprint](https://github.com/cardano-foundation/CIPs/tree/master/CIP-0057)
- [Aiken Repository Examples](https://github.com/aiken-lang/aiken/tree/main/examples)
- [Cardano eUTxO Crash Course](https://aiken-lang.org/fundamentals/eutxo)
- [Aiken Testing Documentation](https://aiken-lang.org/language-tour/tests)