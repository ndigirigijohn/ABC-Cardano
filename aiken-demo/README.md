# Simple Aiken Gift Card Demo

This project demonstrates a basic smart contract in Aiken for the Cardano blockchain. 
The contract implements a simple "gift card" that can only be claimed by its intended recipient.

## Overview

The gift card validator has two simple requirements:
1. The transaction must be signed by the designated recipient
2. The recipient must provide a non-empty thank you message

## Project Structure

```
aiken-demo/
├── aiken.toml           # Project configuration
├── lib/                 # Library code
│   └── gift/
│       └── types.ak     # Data types
└── validators/          # Smart contract validators
    └── gift.ak          # Gift card validator
```

## Smart Contract Logic

The validator works as follows:
- When funds are sent to the validator, they are locked with a datum containing the recipient's verification key hash
- To claim the funds, the recipient must:
  1. Sign the transaction with their key
  2. Include a "thank you" message in the redeemer

## Building and Testing

```bash
# Check and test the contract
aiken check

# Build the contract
aiken build
```

## Example Usage

### Locking Funds
To lock funds in this contract, you would:
1. Get the validator address from the built contract
2. Create a datum with the recipient's verification key hash
3. Send ADA to the validator address with that datum

### Claiming Funds
To claim funds from this contract, the recipient would:
1. Create a transaction that spends the UTxO at the validator address
2. Include their verification key hash as a transaction signer
3. Add a thank you message in the redeemer
4. Submit the transaction to the network