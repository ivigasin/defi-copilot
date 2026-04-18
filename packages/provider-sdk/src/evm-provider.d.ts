import { AssetBalance, PortfolioProvider, ProtocolPosition } from "@defi-copilot/domain";
import { TokenConfig } from './config/tokens';
export interface EvmProviderConfig {
    rpcUrl: string;
    chainId?: number;
    tokenList?: TokenConfig[];
}
export declare class EvmProvider implements PortfolioProvider {
    private client;
    private tokenList;
    constructor(config: EvmProviderConfig);
    getBalances(address: string): Promise<AssetBalance[]>;
    getPositions(address: string): Promise<ProtocolPosition[]>;
}
//# sourceMappingURL=evm-provider.d.ts.map