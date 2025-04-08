use cardano/transaction.{OutputReference, Transaction}
use cardano/types.{Time}

type Datum {
  // The owner's public key hash
  owner: ByteArray,
  // The time after which funds can be spent
  unlock_time: Time,
}

validator time_lock {
  spend(datum: Datum, _redeemer: Data, _input: OutputReference, tx: Transaction) {
    // Get the transaction's validity start time
    let current_time = tx.validity_start
    // Check if the current time is after the unlock time
    if current_time >= datum.unlock_time {
      // Time condition met, allow spending
      True
    } else {
      // Time condition not met, reject transaction
      False
    }
  }

  else(_) {
    fail
  }
}

test time_lock_after_unlock_time() {
  let datum = Datum { owner: #"deadbeef", unlock_time: 100 }
  let output_reference =
    OutputReference {
      transaction_id: #"0000000000000000000000000000000000000000000000000000000000000000",
      output_index: 0,
    }
  // Create a transaction with validity start time after unlock time
  let tx = Transaction { ..placeholder, validity_start: Some(101) }
  // Test with current time after unlock time - should succeed
  let result = time_lock.spend(datum, Void, output_reference, tx)
  trace @"Testing time_lock after unlock time"
  trace @"Expected: True, Actual: "
  trace result
  result == True
}

test time_lock_before_unlock_time() {
  let datum = Datum { owner: #"deadbeef", unlock_time: 100 }
  let output_reference =
    OutputReference {
      transaction_id: #"0000000000000000000000000000000000000000000000000000000000000000",
      output_index: 0,
    }
  // Create a transaction with validity start time before unlock time
  let tx = Transaction { ..placeholder, validity_start: Some(99) }
  // Test with current time before unlock time - should fail
  let result = time_lock.spend(datum, Void, output_reference, tx)
  trace @"Testing time_lock before unlock time"
  trace @"Expected: False, Actual: "
  trace result
  result == False
}
