/**
 * Assets module for Cardano interactions
 * Demonstrates how to work with native assets (tokens) using Lucid
 */

import { Lucid, fromText, toText } from "../deps.ts";
import { initializeLucid } from "./config.ts";
import { getWalletUtxos, useWallet } from "./wallet.ts";
import { signTransaction, submitTransaction } from "./transactions.ts";
import type { TxComplete } from "lucid-cardano/types/src/core/types.d.ts";
import type { NativeScript } from "lucid-cardano/types/src/core/libs/nativeScripts.d.ts";

/**
 * List all native assets in the wallet
 * @param lucid - Initialized Lucid instance
 * @returns Object containing all assets and their amounts
 */
export async function listNativeAssets(
  lucid: Lucid
): Promise<Record<string, bigint>> {
  try {
    console.log("🏦 Listing all native assets in wallet...");
    
    // Get all UTXOs in the wallet
    const utxos = await getWalletUtxos(lucid);
    
    // Aggregate all assets (excluding lovelace/ADA)
    const assets: Record<string, bigint> = {};
    utxos.forEach((utxo) => {
      for (const [assetId, amount] of Object.entries(utxo.assets)) {
        if (assetId === "lovelace") continue; // Skip lovelace (ADA)
        
        const assetAmount = amount as bigint;
        if (assets[assetId]) {
          assets[assetId] += assetAmount;
        } else {
          assets[assetId] = assetAmount;
        }
      }
    });
    
    // Print assets
    const assetCount = Object.keys(assets).length;
    if (assetCount > 0) {
      console.log(`✅ Found ${assetCount} native assets in wallet:`);
      for (const [assetId, amount] of Object.entries(assets)) {
        // Decode policy ID and asset name
        const policyId = assetId.slice(0, 56);
        const assetNameHex = assetId.slice(56);
        
        // Try to decode the asset name
        let decodedName: string;
        try {
          decodedName = toText(assetNameHex);
        } catch (e) {
          decodedName = `<non-UTF8: ${assetNameHex}>`;
        }
        
        console.log(`   - ${decodedName || assetNameHex} (Policy: ${policyId.slice(0, 8)}...): ${amount.toString()}`);
      }
    } else {
      console.log("✅ No native assets found in wallet");
    }
    
    return assets;
  } catch (error) {
    console.error("❌ Error listing native assets:", error instanceof Error ? error.message : String(error));
    throw error;
  }
}

/**
 * Create a policy ID for minting tokens
 * @param lucid - Initialized Lucid instance
 * @returns Policy ID and private key
 */
export async function createMintingPolicy(
  lucid: Lucid
): Promise<{
  policyId: string;
  mintingPolicy: NativeScript;
}> {
  try {
    console.log("🏭 Creating a new minting policy...");
    
    // Get wallet address to create a policy that the wallet can control
    const walletAddress = await lucid.wallet.address();
    const addressDetails = lucid.utils.getAddressDetails(walletAddress);
    
    if (!addressDetails.paymentCredential) {
      throw new Error("Unable to get payment credential from wallet address");
    }
    
    // Create a simple one-signature minting policy
    const mintingPolicy = lucid.utils.nativeScriptFromJson({
      type: "sig",
      keyHash: addressDetails.paymentCredential.hash,
    });
    
    const policyId = lucid.utils.mintingPolicyToId(mintingPolicy);
    
    console.log(`✅ Created minting policy with ID: ${policyId}`);
    
    return {
      policyId,
      mintingPolicy
    };
  } catch (error) {
    console.error("❌ Error creating minting policy:", error instanceof Error ? error.message : String(error));
    throw error;
  }
}

/**
 * Build a token minting transaction
 * @param lucid - Initialized Lucid instance
 * @param policyId - Policy ID for minting
 * @param assetName - Name of the asset to mint
 * @param amount - Amount to mint
 * @param mintingPolicy - Minting policy object
 * @returns Completed transaction
 */
export async function buildMintingTransaction(
  lucid: Lucid,
  policyId: string,
  assetName: string,
  amount: bigint,
  mintingPolicy: NativeScript
): Promise<TxComplete> {
  try {
    console.log(`🔨 Building transaction to mint ${amount} of ${assetName}...`);
    
    // Convert the asset name to hex
    const assetNameHex = fromText(assetName);
    const assetId = policyId + assetNameHex;
    
    // Get the receiver address (our own wallet in this case)
    const receiverAddress = await lucid.wallet.address();
    
    // Create an asset object to mint
    const asset: Record<string, bigint> = {};
    asset[assetId] = amount;
    
    // Build the transaction
    const tx = await lucid
      .newTx()
      .mintAssets(asset, mintingPolicy)
      .payToAddress(receiverAddress, { [assetId]: amount })
      .attachMetadata(721, { // Commonly used label for NFT metadata
        [policyId]: {
          [assetName]: {
            name: assetName,
            description: "Minted during Cardano Workshop Demo",
            image: "ipfs://QmRzTZkW3LZkPAxCZBXYUeJMC5YKMRXQpNYGmkPsJRYFnN", // Example IPFS image
            attributes: {
              rarity: "workshop",
              edition: 1
            }
          }
        }
      })
      .complete();
    
    console.log("✅ Minting transaction built successfully");
    return tx;
  } catch (error) {
    console.error("❌ Error building minting transaction:", error instanceof Error ? error.message : String(error));
    throw error;
  }
}

/**
 * Build a token burning transaction (negative mint amount)
 * @param lucid - Initialized Lucid instance
 * @param policyId - Policy ID for minting
 * @param assetName - Name of the asset to burn
 * @param amount - Amount to burn (positive number)
 * @param mintingPolicy - Minting policy object
 * @returns Completed transaction
 */
export async function buildBurningTransaction(
  lucid: Lucid,
  policyId: string,
  assetName: string,
  amount: bigint,
  mintingPolicy: NativeScript
): Promise<TxComplete> {
  try {
    console.log(`🔥 Building transaction to burn ${amount} of ${assetName}...`);
    
    // Convert the asset name to hex
    const assetNameHex = fromText(assetName);
    const assetId = policyId + assetNameHex;
    
    // Create an asset object to burn (negative amount)
    const asset: Record<string, bigint> = {};
    asset[assetId] = -amount; // Negative for burning
    
    // Build the transaction
    const tx = await lucid
      .newTx()
      .mintAssets(asset, mintingPolicy)
      .complete();
    
    console.log("✅ Burning transaction built successfully");
    return tx;
  } catch (error) {
    console.error("❌ Error building burning transaction:", error instanceof Error ? error.message : String(error));
    throw error;
  }
}

/**
 * Run assets demonstration
 */
export async function runAssetsDemo(): Promise<void> {
  console.log("🚀 Starting Cardano Native Assets Demo");
  
  try {
    // Initialize Lucid with wallet 1
    const lucid = await useWallet(1);
    
    // PART 1: Listing assets
    console.log("\n📋 PART 1: Listing Native Assets");
    console.log("------------------------------------------");
    
    // List all assets in the wallet
    const assets = await listNativeAssets(lucid);
    
    // PART 2: Creating a minting policy
    console.log("\n📋 PART 2: Creating a Minting Policy");
    console.log("------------------------------------------");
    
    // Create a minting policy
    const { policyId, mintingPolicy } = await createMintingPolicy(lucid);
    
    // PART 3: Minting tokens
    console.log("\n📋 PART 3: Minting Tokens");
    console.log("------------------------------------------");
    
    // Build a token minting transaction
    const assetName = "WorkshopToken";
    const mintAmount = 100n;
    
    console.log(`\n🔄 Demo: Minting ${mintAmount} ${assetName}`);
    const mintTx = await buildMintingTransaction(
      lucid,
      policyId,
      assetName,
      mintAmount,
      mintingPolicy
    );
    
    // Sign and submit the minting transaction
    const signedMintTx = await signTransaction(mintTx);
    const mintTxHash = await submitTransaction(signedMintTx);
    
    // PART 4: Burning tokens
    console.log("\n📋 PART 4: Burning Tokens");
    console.log("------------------------------------------");
    
    // Build a token burning transaction
    const burnAmount = 10n;
    
    console.log(`\n🔄 Demo: Burning ${burnAmount} ${assetName}`);
    const burnTx = await buildBurningTransaction(
      lucid,
      policyId,
      assetName,
      burnAmount,
      mintingPolicy
    );
    
    // Sign and submit the burning transaction
    const signedBurnTx = await signTransaction(burnTx);
    const burnTxHash = await submitTransaction(signedBurnTx);
    
    // Show transaction explorer links
    const network = Deno.env.get("NETWORK") || "Preprod";
    const explorerBaseUrl = network === "Mainnet"
      ? `https://cardanoscan.io/transaction/`
      : `https://${network.toLowerCase()}.cardanoscan.io/transaction/`;
    
    console.log("\n🔍 View transactions in explorer:");
    console.log(`   Minting Transaction: ${explorerBaseUrl}${mintTxHash}`);
    console.log(`   Burning Transaction: ${explorerBaseUrl}${burnTxHash}`);
    
    console.log("\n✅ Assets demo completed successfully");
  } catch (error) {
    console.error("❌ Error in assets demo:", error instanceof Error ? error.message : String(error));
  }
}

// Run the demo if this file is executed directly
if (import.meta.main) {
  await runAssetsDemo();
}