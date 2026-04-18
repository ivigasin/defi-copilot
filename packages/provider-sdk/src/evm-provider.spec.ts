import { EvmProvider } from './evm-provider';
import * as balanceFetcher from './providers/balance-fetcher';
import * as aaveV3 from './providers/aave-v3';
import * as lido from './providers/lido';
import { PositionType } from '@defi-copilot/domain';

jest.mock('./providers/balance-fetcher');
jest.mock('./providers/aave-v3');
jest.mock('./providers/lido');
jest.mock('viem', () => ({
  createPublicClient: jest.fn(() => ({})),
  http: jest.fn(() => ({})),
  formatUnits: jest.requireActual('viem').formatUnits,
}));
jest.mock('viem/chains', () => ({
  mainnet: { id: 1, name: 'Ethereum' },
}));

const mockedBalanceFetcher = balanceFetcher as jest.Mocked<typeof balanceFetcher>;
const mockedAave = aaveV3 as jest.Mocked<typeof aaveV3>;
const mockedLido = lido as jest.Mocked<typeof lido>;

const TEST_ADDRESS = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('EvmProvider', () => {
  const provider = new EvmProvider({ rpcUrl: 'http://localhost:8545' });

  describe('getBalances', () => {
    it('delegates to fetchBalances', async () => {
      const mockBalances = [
        { walletAddress: TEST_ADDRESS, chainId: 1, tokenSymbol: 'ETH', amount: 2.5, usdValue: 8000 },
      ];
      mockedBalanceFetcher.fetchBalances.mockResolvedValue(mockBalances);

      const balances = await provider.getBalances(TEST_ADDRESS);
      expect(balances).toEqual(mockBalances);
      expect(mockedBalanceFetcher.fetchBalances).toHaveBeenCalledTimes(1);
    });
  });

  describe('getPositions', () => {
    it('combines Aave + Lido positions', async () => {
      const now = new Date();
      mockedAave.fetchAavePositions.mockResolvedValue([
        {
          id: 'aave-1',
          walletAddress: TEST_ADDRESS,
          chainId: 1,
          protocol: 'Aave',
          positionType: PositionType.Lending,
          assetSymbols: ['USDC'],
          usdValue: 5000,
          updatedAt: now,
        },
      ]);
      mockedLido.fetchLidoPositions.mockResolvedValue([
        {
          id: 'lido-1',
          walletAddress: TEST_ADDRESS,
          chainId: 1,
          protocol: 'Lido',
          positionType: PositionType.Staking,
          assetSymbols: ['stETH'],
          usdValue: 3840,
          updatedAt: now,
        },
      ]);

      const positions = await provider.getPositions(TEST_ADDRESS);
      expect(positions).toHaveLength(2);
      expect(positions[0].protocol).toBe('Aave');
      expect(positions[1].protocol).toBe('Lido');
    });

    it('continues when one protocol fails', async () => {
      const now = new Date();
      mockedAave.fetchAavePositions.mockRejectedValue(new Error('RPC error'));
      mockedLido.fetchLidoPositions.mockResolvedValue([
        {
          id: 'lido-1',
          walletAddress: TEST_ADDRESS,
          chainId: 1,
          protocol: 'Lido',
          positionType: PositionType.Staking,
          assetSymbols: ['stETH'],
          usdValue: 3840,
          updatedAt: now,
        },
      ]);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const positions = await provider.getPositions(TEST_ADDRESS);

      expect(positions).toHaveLength(1);
      expect(positions[0].protocol).toBe('Lido');
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('returns empty when both protocols fail', async () => {
      mockedAave.fetchAavePositions.mockRejectedValue(new Error('fail'));
      mockedLido.fetchLidoPositions.mockRejectedValue(new Error('fail'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const positions = await provider.getPositions(TEST_ADDRESS);

      expect(positions).toHaveLength(0);
      consoleSpy.mockRestore();
    });
  });
});

describe('createProvider with evm type', () => {
  it('throws when EVM_RPC_URL is not set', () => {
    delete process.env.EVM_RPC_URL;
    const { createProvider } = require('./provider-factory');
    expect(() => createProvider('evm')).toThrow('EVM_RPC_URL environment variable is required');
  });
});
