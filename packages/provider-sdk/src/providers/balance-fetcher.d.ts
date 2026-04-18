import { type PublicClient } from 'viem';
import { AssetBalance } from "@defi-copilot/domain";
import { TokenConfig } from '../config/tokens';
/**
 * Fetches native ETH + ERC-20 token balances for a wallet.
 */
export declare function fetchBalances(client: PublicClient, address: string, tokenList?: TokenConfig[]): Promise<AssetBalance[]>;
//# sourceMappingURL=balance-fetcher.d.ts.map