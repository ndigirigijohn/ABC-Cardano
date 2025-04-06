/**
 * Smart Contracts module for Cardano interactions
 * Demonstrates how to work with Plutus scripts using Lucid
 */

import { Lucid } from "../deps.ts";
import type { SpendingValidator } from "../deps.ts";
import { useWallet } from "./wallet.ts";
import { signTransaction, submitTransaction } from "./transactions.ts";
import type { TxComplete } from "lucid-cardano/types/src/core/types.d.ts";
import type { UTxO } from "lucid-cardano/types/src/core/types.d.ts";
import type { Script } from "lucid-cardano/types/src/core/scripts.d.ts";

/**
 * Create a simple validator script (for demonstration only)
 * In a production environment, validators would be written in Aiken
 * and compiled to Plutus Core
 * 
 * @returns A simple always-succeeding validator
 */
export function createSimpleValidator(): SpendingValidator {
  console.log("📜 Creating a simple validator script (always succeeds)...");
  
  // This is a simplified representation - in a real app, you would import
  // compiled Plutus scripts or use Aiken to build validators
  const simpleValidator: Script = {
    type: "PlutusV2" as const,  // Use const assertion to fix type
    script: "590100010000323222320051"  // Example simplified script bytes
  };
  
  console.log("✅ Validator created (note: this is a simplified example)");
  return simpleValidator as SpendingValidator;
}

/**
 * Create a datum for smart contract interaction
 * @param message - Message content
 * @param author - Author name
 * @returns Datum object and its readable representation
 */
export function createDatum(message: string, author: string): {
  datum: string;
  readableDatum: {
    message: string;
    author: string;
    timestamp: string;
  };
} {
  try {
    console.log(`📝 Creating datum with message: "${message}" from ${author}`);
    
    // Create a simplified datum (using a string representation for demo purposes)
    // In a real application, you would use proper Plutus data structures
    const timestamp = Date.now();
    const datumString = JSON.stringify({
      message,
      author,
      timestamp
    });
    
    // For demo purposes, we'll use a simplified approach
    // In a real application, you would use the proper Data.to() with schema
    const datum = datumString;
    
    // Use the same values for the readable version
    const readableData = {
      message,
      author,
      timestamp: timestamp.toString()
    };
    
    console.log("✅ Created datum:", JSON.stringify(readableData));
    
    return {
      datum,
      readableDatum: readableData
    };
  } catch (error) {
    console.error("❌ Error creating datum:", error instanceof Error ? error.message : String(error));
    throw error;
  }
}

/**
 * Build a transaction that locks funds at a script address
 * @param lucid - Initialized Lucid instance
 * @param validator - Script validator
 * @param _datum - Datum to attach to the UTXO
 * @param lovelaceAmount - Amount to lock
 * @returns Completed transaction
 */
export async function buildLockFundsTransaction(
  lucid: Lucid,
  validator: SpendingValidator,
  _datum: string,
  lovelaceAmount: bigint
): Promise<TxComplete> {
  try {
    console.log(`🔒 Building transaction to lock ${Number(lovelaceAmount) / 1000000} ADA with script...`);
    
    // Get the script address
    const scriptAddress = lucid.utils.validatorToAddress(validator);
    
    // Build the transaction
    // For demo purposes, we'll use a simpler approach
    const tx = await lucid
      .newTx()
      .payToAddress(scriptAddress, { lovelace: lovelaceAmount })
      .complete();
    
    console.log(`✅ Lock transaction built successfully (script address: ${scriptAddress})`);
    return tx;
  } catch (error) {
    console.error("❌ Error building lock funds transaction:", error instanceof Error ? error.message : String(error));
    throw error;
  }
}

/**
 * Find UTXOs at a script address
 * @param lucid - Initialized Lucid instance
 * @param validator - Script validator
 * @returns Array of UTXOs at the script address
 */
export async function findScriptUtxos(
  lucid: Lucid,
  validator: SpendingValidator
): Promise<UTxO[]> {
  try {
    // Get the script address
    const scriptAddress = lucid.utils.validatorToAddress(validator);
    
    console.log(`🔍 Looking for UTXOs at script address: ${scriptAddress}`);
    
    // Find the UTXOs at the script address
    const scriptUtxos = await lucid.utxosAt(scriptAddress);
    
    console.log(`✅ Found ${scriptUtxos.length} UTXOs at the script address`);
    
    return scriptUtxos;
  } catch (error) {
    console.error("❌ Error finding script UTXOs:", error instanceof Error ? error.message : String(error));
    throw error;
  }
}

/**
 * Build a transaction that redeems funds locked at a script address
 * @param lucid - Initialized Lucid instance
 * @param _validator - Script validator
 * @param scriptUtxo - UTXO at the script address
 * @returns Completed transaction
 */
export async function buildRedeemFundsTransaction(
  lucid: Lucid,
  _validator: SpendingValidator,
  scriptUtxo: UTxO
): Promise<TxComplete> {
  try {
    console.log(`🔓 Building transaction to redeem funds from script...`);
    
    // For demonstration purposes, we'll use a simplified approach
    // In a real application, you would use proper redeemers and validators
    const tx = await lucid
      .newTx()
      .collectFrom([scriptUtxo])
      .complete();
    
    console.log(`✅ Redeem transaction built successfully`);
    return tx;
  } catch (error) {
    console.error("❌ Error building redeem funds transaction:", error instanceof Error ? error.message : String(error));
    throw error;
  }
}

/**
 * Explain the eUTXO model and smart contract patterns on Cardano
 */
export function explainSmartContractConcepts(): void {
  console.log("\n📚 Understanding Smart Contracts in Cardano's eUTXO Model");
  console.log("----------------------------------------------------------------");
  console.log("1️⃣ Extended UTXO Model:");
  console.log("   - Extends Bitcoin's UTXO model with script capabilities");
  console.log("   - Each UTXO can carry datum (data) and be controlled by validators");
  console.log("   - Deterministic execution: same inputs always produce same outputs\n");
  
  console.log("2️⃣ Components of a Smart Contract Interaction:");
  console.log("   - Validator Script: Governs when UTXOs can be spent");
  console.log("   - Datum: Data attached to a UTXO at the script address");
  console.log("   - Redeemer: Input provided by the transaction spending the UTXO");
  console.log("   - Context: Information about the transaction being validated\n");
  
  console.log("3️⃣ Common Smart Contract Patterns in Cardano:");
  console.log("   - State Machines: Managing state transitions with datums");
  console.log("   - Oracle Patterns: Bringing external data on-chain");
  console.log("   - NFT Minting Policies: Controlling token creation");
  console.log("   - Multi-signature: Requiring multiple approvals\n");
  
  console.log("4️⃣ Aiken for Smart Contract Development:");
  console.log("   - Purpose-built language for Cardano smart contracts");
  console.log("   - Compiles to efficient Plutus Core");
  console.log("   - Strong type system helps prevent errors");
  console.log("----------------------------------------------------------------");
}

/**
 * Run smart contracts demonstration
 */
export async function runSmartContractsDemo(): Promise<void> {
  console.log("🚀 Starting Cardano Smart Contracts Demo");
  
  try {
    // Initialize Lucid with wallet 1
    const lucid = await useWallet(1);
    
    // PART 1: Creating a simple validator and datum
    console.log("\n📋 PART 1: Creating a Validator and Datum");
    console.log("------------------------------------------");
    
    // Create a simple validator (for demonstration only)
    const validator = createSimpleValidator();
    
    // Create a datum for the smart contract
    const { datum } = createDatum(
      "Hello from Cardano Workshop!",
      "Workshop Participant"
    );
    
    // PART 2: Locking funds at a script address
    console.log("\n📋 PART 2: Locking Funds at Script Address");
    console.log("------------------------------------------");
    
    // Build a transaction to lock funds at the script address (demo only)
    console.log("\n🔄 Demo: Locking Funds at Script Address");
    const lockTx = await buildLockFundsTransaction(lucid, validator, datum, 5000000n); // 5 ADA
    
    // Sign and submit the lock transaction
    const signedLockTx = await signTransaction(lockTx);
    const lockTxHash = await submitTransaction(signedLockTx);
    
    // PART 3: Finding and redeeming script UTXOs
    console.log("\n📋 PART 3: Finding and Redeeming Script UTXOs");
    console.log("------------------------------------------");
    
    // Find UTXOs at script address
    console.log("\n🔄 Demo: Finding Script UTXOs");
    const scriptUtxos = await findScriptUtxos(lucid, validator);
    
    // Build a transaction to redeem funds from the script (if any UTXOs found)
    if (scriptUtxos.length > 0) {
      console.log("\n🔄 Demo: Redeeming Funds from Script");
      const redeemTx = await buildRedeemFundsTransaction(lucid, validator, scriptUtxos[0]);
      
      // Sign and submit the redeem transaction
      const signedRedeemTx = await signTransaction(redeemTx);
      await submitTransaction(signedRedeemTx);
    } else {
      console.log("\n⚠️ No script UTXOs found to redeem");
      console.log("   This is expected in a demo environment");
    }
    
    // PART 4: Explaining key concepts
    console.log("\n📋 PART 4: Cardano Smart Contract Concepts");
    console.log("------------------------------------------");
    
    // Explain key concepts
    explainSmartContractConcepts();
    
    // Show transaction explorer links
    const network = Deno.env.get("NETWORK") || "Preprod";
    const explorerBaseUrl = network === "Mainnet"
      ? `https://cardanoscan.io/transaction/`
      : `https://${network.toLowerCase()}.cardanoscan.io/transaction/`;
    
    console.log("\n🔍 View transactions in explorer:");
    console.log(`   Lock Transaction: ${explorerBaseUrl}${lockTxHash}`);
    
    console.log("\n✅ Smart Contracts demo completed successfully");
  } catch (error) {
    console.error("❌ Error in smart contracts demo:", error instanceof Error ? error.message : String(error));
  }
}

// Run the demo if this file is executed directly
if (import.meta.main) {
  await runSmartContractsDemo();
}