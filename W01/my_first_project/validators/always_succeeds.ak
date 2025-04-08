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
