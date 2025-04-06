/**
 * Wallet module for Cardano interactions
 * Demonstrates how to work with Cardano wallets using Lucid
 */

import { Lucid } from "../deps.ts";
import { initializeLucid } from "./config.ts";
import type { UTxO } from "lucid-cardano/types/src/core/types.d.ts";

/**
 * Get wallet address
 * @param lucid - Initialized Lucid instance
 * @returns wallet address
 */
export async function getWalletAddress(lucid: Lucid): Promise<string> {
  try {
    const address = await lucid.wallet.address();
    console.log(`📬 Wallet address: ${address}`);
    return address;
  } catch (error) {
    console.error("❌ Error getting wallet address:", error instanceof Error ? error.message : String(error));
    throw error;
  }
}

/**
 * Get wallet UTXOs
 * @param lucid - Initialized Lucid instance
 * @returns Array of UTXOs
 */
export async function getWalletUtxos(lucid: Lucid): Promise<UTxO[]> {
  try {
    const utxos = await lucid.wallet.getUtxos();
    console.log(`🔍 Found ${utxos.length} UTXOs in wallet`);
    return utxos;
  } catch (error) {
    console.error("❌ Error getting wallet UTXOs:", error instanceof Error ? error.message : String(error));
    throw error;
  }
}

/**
 * Calculate wallet balance
 * @param lucid - Initialized Lucid instance
 * @returns Balance information
 */
export async function getWalletBalance(lucid: Lucid): Promise<{
  lovelace: bigint;
  ada: number;
}> {
  try {
    const utxos = await getWalletUtxos(lucid);
    
    // Calculate total lovelace (1 ADA = 1,000,000 lovelace)
    let totalLovelace = 0n;
    utxos.forEach((utxo) => {
      totalLovelace += utxo.assets.lovelace || 0n;
    });
    
    const adaBalance = Number(totalLovelace) / 1000000;
    
    console.log(`💰 Wallet balance: ${adaBalance} ADA (${totalLovelace} lovelace)`);
    
    return {
      lovelace: totalLovelace,
      ada: adaBalance,
    };
  } catch (error) {
    console.error("❌ Error calculating wallet balance:", error instanceof Error ? error.message : String(error));
    throw error;
  }
}

/**
 * Switch to a different wallet
 * @param walletNum - Which wallet to use (1 or 2)
 * @returns Lucid instance with selected wallet
 */
export async function useWallet(walletNum: 1 | 2): Promise<Lucid> {
  try {
    console.log(`🔄 Using wallet ${walletNum}...`);
    const lucid = await initializeLucid();
    
    // Get wallet seed based on number
    const walletSeed = Deno.env.get(walletNum === 1 ? "WALLET_1_SEED" : "WALLET_2_SEED");
    
    if (!walletSeed) {
      throw new Error(`Wallet ${walletNum} seed phrase not found in environment variables`);
    }
    
    // Select the wallet
    lucid.selectWalletFromSeed(walletSeed);
    
    // Display wallet address
    const address = await lucid.wallet.address();
    console.log(`✅ Using wallet ${walletNum} with address: ${address.slice(0, 20)}...${address.slice(-8)}`);
    
    return lucid;
  } catch (error) {
    console.error(`❌ Error switching to wallet ${walletNum}:`, error instanceof Error ? error.message : String(error));
    throw error;
  }
}

/**
 * Run wallet demonstration
 */
export async function runWalletDemo(): Promise<void> {
  console.log("🚀 Starting Cardano Wallet Demo");
  
  try {
    // Initialize Lucid with default wallet (wallet 1)
    const lucid = await initializeLucid();
    
    // PART 1: Basic wallet information
    console.log("\n📋 PART 1: Basic Wallet Information");
    console.log("------------------------------------------");
    
    // Get wallet address
    const address = await getWalletAddress(lucid);
    
    // Get wallet balance
    const balance = await getWalletBalance(lucid);
    
    // Get UTXOs and show their details
    const utxos = await getWalletUtxos(lucid);
    
    // Show the first UTXO details (if available)
    if (utxos.length > 0) {
      console.log("\n📦 Example UTXO details:");
      console.log(`   TX Hash: ${utxos[0].txHash.slice(0, 15)}...${utxos[0].txHash.slice(-8)}`);
      console.log(`   Output Index: ${utxos[0].outputIndex}`);
      console.log(`   Lovelace: ${utxos[0].assets.lovelace?.toString() || "0"}`);
      console.log(`   Datum: ${utxos[0].datum || "None"}`);
    }
    
    // PART 2: Wallet switching (if wallet 2 is available)
    const hasWallet2 = !!Deno.env.get("WALLET_2_SEED");
    
    if (hasWallet2) {
      console.log("\n📋 PART 2: Multiple Wallet Management");
      console.log("------------------------------------------");
      
      // Switch to wallet 2
      const lucid2 = await useWallet(2);
      
      // Get wallet 2 info
      const address2 = await getWalletAddress(lucid2);
      const balance2 = await getWalletBalance(lucid2);
      
      // Switch back to wallet 1
      await useWallet(1);
      console.log("✅ Successfully switched between wallets");
    }
    
    // Show wallet explorer link
    const network = Deno.env.get("NETWORK") || "Preprod";
    const explorerUrl = network === "Mainnet"
      ? `https://cardanoscan.io/address/${address}`
      : `https://${network.toLowerCase()}.cardanoscan.io/address/${address}`;
    
    console.log(`\n🔍 View wallet in explorer: ${explorerUrl}`);
    
    console.log("\n✅ Wallet demo completed successfully");
  } catch (error) {
    console.error("❌ Error in wallet demo:", error instanceof Error ? error.message : String(error));
  }
}

// Run the demo if this file is executed directly
if (import.meta.main) {
  await runWalletDemo();
}