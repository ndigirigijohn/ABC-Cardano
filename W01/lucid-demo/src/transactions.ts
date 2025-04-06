/**
 * Transactions module for Cardano interactions
 * Demonstrates how to build and submit transactions using Lucid
 */

import { Lucid } from "../deps.ts";
import { getWalletAddress, useWallet } from "./wallet.ts";
import type { TxComplete, TxSigned } from "lucid-cardano/types/src/core/types.d.ts";

/**
 * Build a simple transaction
 * @param lucid - Initialized Lucid instance
 * @param receiverAddress - Recipient address
 * @param lovelaceAmount - Amount to send in lovelace
 * @returns Completed transaction
 */
export async function buildSimpleTransaction(
  lucid: Lucid,
  receiverAddress: string,
  lovelaceAmount: bigint
): Promise<TxComplete> {
  try {
    console.log(`📝 Building transaction to send ${Number(lovelaceAmount) / 1000000} ADA to ${receiverAddress.slice(0, 20)}...`);
    
    const tx = await lucid
      .newTx()
      .payToAddress(receiverAddress, { lovelace: lovelaceAmount })
      .complete();
    
    console.log("✅ Transaction built successfully");
    return tx;
  } catch (error) {
    console.error("❌ Error building transaction:", error instanceof Error ? error.message : String(error));
    throw error;
  }
}

/**
 * Add metadata to a transaction
 * @param lucid - Initialized Lucid instance
 * @param receiverAddress - Recipient address
 * @param lovelaceAmount - Amount to send in lovelace
 * @param metadata - Metadata to attach
 * @returns Completed transaction with metadata
 */
export async function buildTransactionWithMetadata(
  lucid: Lucid,
  receiverAddress: string,
  lovelaceAmount: bigint,
  metadata: Record<string, unknown>
): Promise<TxComplete> {
  try {
    console.log(`📝 Building transaction with metadata`);
    
    const tx = await lucid
      .newTx()
      .payToAddress(receiverAddress, { lovelace: lovelaceAmount })
      .attachMetadata(674, metadata) // 674 is a commonly used metadata label
      .complete();
    
    console.log("✅ Transaction with metadata built successfully");
    return tx;
  } catch (error) {
    console.error("❌ Error building transaction with metadata:", error instanceof Error ? error.message : String(error));
    throw error;
  }
}

/**
 * Build a transaction with time constraints
 * @param lucid - Initialized Lucid instance
 * @param receiverAddress - Recipient address
 * @param lovelaceAmount - Amount to send in lovelace
 * @param validForMinutes - How many minutes the tx should be valid for
 * @returns Completed transaction with time constraints
 */
export async function buildTimeConstrainedTransaction(
  lucid: Lucid,
  receiverAddress: string,
  lovelaceAmount: bigint,
  validForMinutes: number
): Promise<TxComplete> {
  try {
    // Get current slot
    const currentSlot = await lucid.currentSlot();
    
    // Calculate slots for time constraint (1 slot ≈ 1 second, 20 slots ≈ 1 minute)
    const slotsPerMinute = 20n;
    const validForSlots = BigInt(validForMinutes) * slotsPerMinute;
    
    // Make sure currentSlot is treated as a number for the validTo parameter
    const currentSlotNumber = Number(currentSlot);
    const validUntilSlot = currentSlotNumber + Number(validForSlots);
    
    console.log(`⏱️ Building transaction valid for ${validForMinutes} minutes (current slot: ${currentSlot})`);
    
    const tx = await lucid
      .newTx()
      .payToAddress(receiverAddress, { lovelace: lovelaceAmount })
      .validTo(validUntilSlot) // Valid until specified slot
      .complete();
    
    console.log(`✅ Transaction with time constraints built successfully (valid until slot ${validUntilSlot})`);
    return tx;
  } catch (error) {
    console.error("❌ Error building time-constrained transaction:", error instanceof Error ? error.message : String(error));
    throw error;
  }
}

/**
 * Sign a transaction
 * @param tx - Completed transaction
 * @returns Signed transaction
 */
export async function signTransaction(tx: TxComplete): Promise<TxSigned> {
  try {
    console.log("✍️ Signing transaction...");
    const signedTx = await tx.sign().complete();
    
    console.log(`✅ Transaction signed successfully (txHash: ${signedTx.toHash().slice(0, 10)}...)`);
    return signedTx;
  } catch (error) {
    console.error("❌ Error signing transaction:", error instanceof Error ? error.message : String(error));
    throw error;
  }
}

/**
 * Submit a signed transaction to the network
 * @param signedTx - Signed transaction
 * @returns Transaction hash
 */
// deno-lint-ignore require-await
export async function submitTransaction(signedTx: TxSigned): Promise<string> {
  try {
    console.log("🚀 Submitting transaction to the network...");
    
    // For demo purposes, let's just return the hash without actually submitting
    // Uncomment the next line to actually submit the transaction
    // const txHash = await signedTx.submit();
    
    const txHash = signedTx.toHash();
    console.log(`🔍 Transaction would be submitted with hash: ${txHash}`);
    console.log(`   (Transaction submission is disabled in demo mode)`);
    
    // Return the hash
    return txHash;
  } catch (error) {
    console.error("❌ Error submitting transaction:", error instanceof Error ? error.message : String(error));
    throw error;
  }
}

/**
 * Calculate transaction fee
 * @param lucid - Initialized Lucid instance
 * @param receiverAddress - Recipient address
 * @param lovelaceAmount - Amount to send in lovelace
 * @returns Transaction fee in lovelace
 */
export async function calculateTransactionFee(
  lucid: Lucid,
  receiverAddress: string,
  lovelaceAmount: bigint
): Promise<bigint> {
  try {
    // Build a sample transaction to estimate fee
    const tx = await lucid
      .newTx()
      .payToAddress(receiverAddress, { lovelace: lovelaceAmount })
      .complete();
    
    // Get the fee amount
    const fee = tx.fee;
    
    console.log(`💵 Estimated transaction fee: ${Number(fee) / 1000000} ADA (${fee} lovelace)`);
    return BigInt(fee);
  } catch (error) {
    console.error("❌ Error calculating transaction fee:", error instanceof Error ? error.message : String(error));
    throw error;
  }
}

/**
 * Transfer between wallet 1 and wallet 2
 * @param fromWalletNum - Source wallet (1 or 2)
 * @param toWalletNum - Destination wallet (1 or 2)
 * @param lovelaceAmount - Amount to send in lovelace
 * @returns Transaction hash
 */
export async function transferBetweenWallets(
  fromWalletNum: 1 | 2,
  toWalletNum: 1 | 2,
  lovelaceAmount: bigint
): Promise<string> {
  try {
    if (fromWalletNum === toWalletNum) {
      throw new Error("Source and destination wallets must be different");
    }
    
    // Initialize the source wallet
    const sourceLucid = await useWallet(fromWalletNum);
    
    // Get the destination wallet address
    const targetLucid = await useWallet(toWalletNum);
    const targetAddress = await targetLucid.wallet.address();
    
    console.log(`💸 Transferring ${Number(lovelaceAmount) / 1000000} ADA from Wallet ${fromWalletNum} to Wallet ${toWalletNum}`);
    
    // Build the transaction
    const tx = await buildSimpleTransaction(sourceLucid, targetAddress, lovelaceAmount);
    
    // Sign and submit
    const signedTx = await signTransaction(tx);
    const txHash = await submitTransaction(signedTx);
    
    return txHash;
  } catch (error) {
    console.error("❌ Error transferring between wallets:", error instanceof Error ? error.message : String(error));
    throw error;
  }
}

/**
 * Run transactions demonstration
 */
export async function runTransactionsDemo(): Promise<void> {
  console.log("🚀 Starting Cardano Transactions Demo");
  
  try {
    // Initialize Lucid with wallet 1
    const lucid = await useWallet(1);
    
    // Get wallet address
    const address = await getWalletAddress(lucid);
    
    // PART 1: Simple transaction (to self)
    console.log("\n📋 PART 1: Simple Transaction");
    console.log("------------------------------------------");
    
    // Build, sign, and submit a simple transaction to self
    console.log("\n🔄 Demo: Simple Transaction (to self)");
    const simpleTx = await buildSimpleTransaction(lucid, address, 1000000n); // 1 ADA to self
    const signedSimpleTx = await signTransaction(simpleTx);
    const simpleHash = await submitTransaction(signedSimpleTx);
    
    // PART 2: Transaction with metadata
    console.log("\n📋 PART 2: Transaction with Metadata");
    console.log("------------------------------------------");
    
    // Add metadata to a transaction
    console.log("\n🔄 Demo: Transaction with Metadata");
    const metadata = { 
      message: "Hello from Cardano Workshop!",
      timestamp: Date.now(),
      workshop: "Lucid Demo",
      author: "Workshop Participant"
    };
    
    const metadataTx = await buildTransactionWithMetadata(lucid, address, 1500000n, metadata); // 1.5 ADA to self
    const signedMetadataTx = await signTransaction(metadataTx);
    const metadataHash = await submitTransaction(signedMetadataTx);
    
    // PART 3: Time-constrained transaction
    console.log("\n📋 PART 3: Time-Constrained Transaction");
    console.log("------------------------------------------");
    
    // Build a transaction with time constraints
    console.log("\n🔄 Demo: Transaction with Time Constraints");
    const timeConstrainedTx = await buildTimeConstrainedTransaction(lucid, address, 2000000n, 30); // Valid for 30 minutes
    const signedTimeConstrainedTx = await signTransaction(timeConstrainedTx);
    const timeConstrainedHash = await submitTransaction(signedTimeConstrainedTx);
    
    // PART 4: Transaction fee calculation
    console.log("\n📋 PART 4: Transaction Fee Calculation");
    console.log("------------------------------------------");
    
    // Calculate fee for a transaction
    await calculateTransactionFee(lucid, address, 1000000n);
    
    // PART 5: Transfer between wallets (if wallet 2 is available)
    const hasWallet2 = !!Deno.env.get("WALLET_2_SEED");
    
    if (hasWallet2) {
      console.log("\n📋 PART 5: Inter-Wallet Transfer");
      console.log("------------------------------------------");
      
      // Transfer from wallet 1 to wallet 2
      console.log("\n🔄 Demo: Transfer from Wallet 1 to Wallet 2");
      await transferBetweenWallets(1, 2, 2000000n); // 2 ADA
      
      // Transfer from wallet 2 to wallet 1
      console.log("\n🔄 Demo: Transfer from Wallet 2 to Wallet 1");
      await transferBetweenWallets(2, 1, 1500000n); // 1.5 ADA
    }
    
    // Show transaction explorer links
    const network = Deno.env.get("NETWORK") || "Preprod";
    const explorerBaseUrl = network === "Mainnet"
      ? `https://cardanoscan.io/transaction/`
      : `https://${network.toLowerCase()}.cardanoscan.io/transaction/`;
    
    console.log("\n🔍 View transactions in explorer:");
    console.log(`   Simple Transaction: ${explorerBaseUrl}${simpleHash}`);
    console.log(`   Metadata Transaction: ${explorerBaseUrl}${metadataHash}`);
    console.log(`   Time-constrained Transaction: ${explorerBaseUrl}${timeConstrainedHash}`);
    
    console.log("\n✅ Transactions demo completed successfully");
  } catch (error) {
    console.error("❌ Error in transactions demo:", error instanceof Error ? error.message : String(error));
  }
}

// Run the demo if this file is executed directly
if (import.meta.main) {
  await runTransactionsDemo();
}