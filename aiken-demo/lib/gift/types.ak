/// Simple datum containing recipient information
pub type Datum {
  /// The verification key hash of the recipient
  owner: ByteArray,
}

/// Simple redeemer for claiming gifts
pub type Redeemer {
  /// A thank you message
  msg: ByteArray,
}
