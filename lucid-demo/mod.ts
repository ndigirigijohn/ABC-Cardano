import { Lucid } from "./deps.ts";
import { initializeLucid } from "./src/config.ts";
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




export async function runDemo(): Promise<void> {
    console.log("🚀 Starting Cardano Wallet Demo");
    
    try {
      // Initialize Lucid with default wallet (wallet 1)
      const lucid = await initializeLucid();


     // Get wallet address
        const address = await getWalletAddress(lucid);


        console.log("Address", address);
    }

    catch (err:any){
        console.log("err", err);
    }

}


runDemo();