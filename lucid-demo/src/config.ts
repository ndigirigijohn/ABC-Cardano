/**
 * Configuration module for Lucid Cardano interactions
 * Initializes Lucid with Blockfrost API and sets up the wallet
 */

import { Lucid, Blockfrost, loadEnv } from "../deps.ts";
import type { Network } from "lucid-cardano/types/src/provider/index.d.ts";

// Load environment variables
const env = await loadEnv({ export: true });

// Network URLs for different Cardano networks
const NETWORK_URLS: Record<string, string> = {
  Preview: "https://cardano-preview.blockfrost.io/api/v0",
  Preprod: "https://cardano-preprod.blockfrost.io/api/v0",
  Mainnet: "https://cardano-mainnet.blockfrost.io/api/v0",
};

// Valid network types
const VALID_NETWORKS = ["Preview", "Preprod", "Mainnet"] as const;
type ValidNetwork = typeof VALID_NETWORKS[number];

/**
 * Initialize Lucid with Blockfrost API
 * @returns initialized Lucid instance
 */
export async function initializeLucid(): Promise<Lucid> {
  console.log(`📡 Initializing Lucid on ${Deno.env.get("NETWORK") || "Preprod"} network...`);
  
  try {
    // Determine network to use (default to Preprod if not specified)
    const networkInput = Deno.env.get("NETWORK") || "Preprod";
    
    // Validate network
    if (!VALID_NETWORKS.includes(networkInput as ValidNetwork)) {
      throw new Error(
        `Invalid network: ${networkInput}. Must be one of: ${VALID_NETWORKS.join(", ")}`
      );
    }
    
    const network = networkInput as Network;
    const apiUrl = NETWORK_URLS[network];
    
    const blockfrostApiKey = Deno.env.get("BLOCKFROST_API_KEY");
    if (!blockfrostApiKey) {
      throw new Error("BLOCKFROST_API_KEY not found in environment variables");
    }
    
    // Initialize Lucid with Blockfrost provider
    const lucid = await Lucid.new(
      new Blockfrost(apiUrl, blockfrostApiKey),
      network
    );
    
    console.log(`✅ Successfully connected to Cardano ${network} network`);
    
    // Set up wallet using seed phrase
    const wallet1Seed = Deno.env.get("WALLET_1_SEED");
    const wallet2Seed = Deno.env.get("WALLET_2_SEED");
    
    if (wallet1Seed) {
      lucid.selectWalletFromSeed(wallet1Seed);
      console.log("👛 Wallet 1 loaded from seed phrase");
    } else {
      console.log("⚠️ Wallet 1 seed phrase not provided. Demo will be limited.");
      console.log("   Please add WALLET_1_SEED to your .env file");
    }
    
    return lucid;
  } catch (error) {
    console.error("❌ Error initializing Lucid:", error instanceof Error ? error.message : String(error));
    throw error;
  }
}