// use aiken/builtin
// use gift/types.{Datum, Redeemer}

// /// Create a sample datum for testing
// pub fn sample_datum() -> Datum {
//   Datum { owner: #"deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef" }
// }

// /// Create an accepting redeemer
// pub fn accepting_redeemer() -> Redeemer {
//   Redeemer { msg: "Thank you for the gift!" }
// }

// /// Check if a message is non-empty
// pub fn is_valid_message(msg: ByteArray) -> Bool {
//   builtin.length_of_bytearray(msg) > 0
// }

// /// Helper to extract value from an option
// pub fn unwrap(opt: Option<a>) -> a {
//   when opt is {
//     Some(val) -> val
//     None -> fail
//   }
// }
