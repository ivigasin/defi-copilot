import { type PublicClient } from 'viem';
import { ProtocolPosition } from "@defi-copilot/domain";
/**
 * Fetch Aave V3 positions for a wallet address.
 */
export declare function fetchAavePositions(client: PublicClient, address: string): Promise<ProtocolPosition[]>;
//# sourceMappingURL=aave-v3.d.ts.map