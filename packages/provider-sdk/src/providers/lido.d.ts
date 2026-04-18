import { type PublicClient } from 'viem';
import { ProtocolPosition } from "@defi-copilot/domain";
/**
 * Fetch Lido stETH staking position for a wallet.
 */
export declare function fetchLidoPositions(client: PublicClient, address: string): Promise<ProtocolPosition[]>;
//# sourceMappingURL=lido.d.ts.map