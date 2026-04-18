import { PortfolioProvider } from '@defi-copilot/domain';
import { MockPortfolioProvider } from './mock-provider';
import { EvmProvider } from './evm-provider';

export type ProviderType = 'mock' | 'evm';

export function createProvider(type: ProviderType): PortfolioProvider {
  switch (type) {
    case 'mock':
      return new MockPortfolioProvider();
    case 'evm': {
      const rpcUrl = process.env.EVM_RPC_URL;
      if (!rpcUrl) {
        throw new Error('EVM_RPC_URL environment variable is required for evm provider');
      }
      return new EvmProvider({ rpcUrl });
    }
    default:
      throw new Error(`Unknown provider type: ${type}`);
  }
}
