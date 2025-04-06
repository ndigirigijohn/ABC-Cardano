/**
 * Central file for managing dependencies
 * This helps with versioning and makes updates easier
 */

// Lucid library for Cardano interactions
export { Lucid, Blockfrost, Data, fromText, toText } from "lucid-cardano";
export type { SpendingValidator } from "lucid-cardano";

// Environment variable management for Deno
export { load as loadEnv } from "std/dotenv/mod.ts";

// Standard library utilities
export { encode, decode } from "std/encoding/base64.ts";