validator {
  fn token_lock(datum: Datum, redeemer: Redeemer, context: ScriptContext) -> Bool {
    let owner = datum.owner
    let signed_by_owner = tx_signed_by(context.transaction, owner)
    
    // Only the owner can unlock the tokens
    signed_by_owner
  }
}