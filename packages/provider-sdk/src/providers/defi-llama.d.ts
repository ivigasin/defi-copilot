/**
 * Fetch current USD prices for tokens.
 * @param tokenAddresses Array of checksummed or lowercase Ethereum addresses
 * @returns Map of lowercase address → USD price
 */
export declare function fetchTokenPrices(tokenAddresses: string[]): Promise<Map<string, number>>;
/**
 * Fetch ETH price via the native coingecko ID.
 */
export declare function fetchEthPrice(): Promise<number>;
/**
 * Fetch APY for a specific project and chain.
 * @returns Map of lowercase pool symbol → APY percentage
 */
export declare function fetchPoolApys(project: string, chain?: string): Promise<Map<string, number>>;
/** Clear the price/yield cache (useful in tests) */
export declare function clearDefiLlamaCache(): void;
//# sourceMappingURL=defi-llama.d.ts.map