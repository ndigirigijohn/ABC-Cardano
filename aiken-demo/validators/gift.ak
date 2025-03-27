/// A simple "Hello, World!" validator that always returns True
validator hello_world(datum: Data, redeemer: Data, ctx: Data) {
  True
}

// A test to verify the validator works
test hello_world_test() {
  hello_world(Data, Data, Data)
}