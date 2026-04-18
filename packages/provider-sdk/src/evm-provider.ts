import { createPublicClient, http, type PublicClient } from 'viem';
import { mainnet } from 'viem/chains';
import { AssetBalance, PortfolioProvider, ProtocolPosition } from '@defi-copilot/domain';
import { TokenConfig, DEFAULT_TOKEN_LIST } from './config/tokens';
import { fetchBalances } from './providers/balance-fetcher';
import { fetchAavePositions } from './providers/aave-v3';
import { fetchLidoPositions } from './providers/lido';

export interface EvmProviderConfig {
  rpcUrl: string;
  chainId?: number;
  tokenList?: TokenConfig[];
}

export class EvmProvider implements PortfolioProvider {
  private client: PublicClient;
  private tokenList: TokenConfig[];

  constructor(config: EvmProviderConfig) {
    this.client = createPublicClient({
      chain: mainnet,
      transport: http(config.rpcUrl),
    });
    this.tokenList = config.tokenList ?? DEFAULT_TOKEN_LIST;
  }

  async getBalances(address: string): Promise<AssetBalance[]> {
    return fetchBalances(this.client, address, this.tokenList);
  }

  async getPositions(address: string): Promise<ProtocolPosition[]> {
    const results = await Promise.allSettled([
      fetchAavePositions(this.client, address),
      fetchLidoPositions(this.client, address),
    ]);

    const positions: ProtocolPosition[] = [];
    for (const result of results) {
      if (result.status === 'fulfilled') {
        positions.push(...result.value);
      } else {
        console.error('[evm-provider] Protocol fetch failed:', result.reason);
      }
    }

    return positions;
  }
}
