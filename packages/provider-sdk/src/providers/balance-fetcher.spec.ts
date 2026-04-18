import { fetchBalances } from './balance-fetcher';
import * as defiLlama from './defi-llama';

// Mock defi-llama module
jest.mock('./defi-llama');
const mockedDefiLlama = defiLlama as jest.Mocked<typeof defiLlama>;

const mockClient = {
  getBalance: jest.fn(),
  readContract: jest.fn(),
} as unknown as Parameters<typeof fetchBalances>[0];

const TEST_ADDRESS = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('fetchBalances', () => {
  it('returns ETH + ERC-20 balances with USD values', async () => {
    (mockClient.getBalance as jest.Mock).mockResolvedValue(2500000000000000000n); // 2.5 ETH
    (mockClient.readContract as jest.Mock)
      .mockResolvedValueOnce(1500000000n) // 1500 USDC (6 decimals)
      .mockResolvedValueOnce(0n); // 0 USDT

    mockedDefiLlama.fetchEthPrice.mockResolvedValue(3200);
    mockedDefiLlama.fetchTokenPrices.mockResolvedValue(
      new Map([
        ['0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', 1.0],
      ]),
    );

    const tokenList = [
      { symbol: 'USDC', address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', decimals: 6 },
      { symbol: 'USDT', address: '0xdac17f958d2ee523a2206206994597c13d831ec7', decimals: 6 },
    ];

    const balances = await fetchBalances(mockClient, TEST_ADDRESS, tokenList);

    expect(balances).toHaveLength(2); // ETH + USDC (USDT is 0)

    const eth = balances.find((b) => b.tokenSymbol === 'ETH');
    expect(eth).toBeDefined();
    expect(eth!.amount).toBeCloseTo(2.5);
    expect(eth!.usdValue).toBeCloseTo(8000);
    expect(eth!.chainId).toBe(1);

    const usdc = balances.find((b) => b.tokenSymbol === 'USDC');
    expect(usdc).toBeDefined();
    expect(usdc!.amount).toBeCloseTo(1500);
    expect(usdc!.usdValue).toBeCloseTo(1500);
  });

  it('skips tokens with zero balance', async () => {
    (mockClient.getBalance as jest.Mock).mockResolvedValue(0n);
    (mockClient.readContract as jest.Mock).mockResolvedValue(0n);

    mockedDefiLlama.fetchEthPrice.mockResolvedValue(3200);
    mockedDefiLlama.fetchTokenPrices.mockResolvedValue(new Map());

    const balances = await fetchBalances(mockClient, TEST_ADDRESS, [
      { symbol: 'USDC', address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', decimals: 6 },
    ]);

    expect(balances).toHaveLength(0);
  });

  it('handles failed ERC-20 reads gracefully', async () => {
    (mockClient.getBalance as jest.Mock).mockResolvedValue(1000000000000000000n); // 1 ETH
    (mockClient.readContract as jest.Mock).mockRejectedValue(new Error('revert'));

    mockedDefiLlama.fetchEthPrice.mockResolvedValue(3200);
    mockedDefiLlama.fetchTokenPrices.mockResolvedValue(new Map());

    const balances = await fetchBalances(mockClient, TEST_ADDRESS, [
      { symbol: 'USDC', address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', decimals: 6 },
    ]);

    // Should still return ETH, just skip the failed token
    expect(balances).toHaveLength(1);
    expect(balances[0].tokenSymbol).toBe('ETH');
  });

  it('sets walletAddress on all balances', async () => {
    (mockClient.getBalance as jest.Mock).mockResolvedValue(1000000000000000000n);
    (mockClient.readContract as jest.Mock).mockResolvedValue(500000000n);

    mockedDefiLlama.fetchEthPrice.mockResolvedValue(3200);
    mockedDefiLlama.fetchTokenPrices.mockResolvedValue(
      new Map([['0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', 1.0]]),
    );

    const balances = await fetchBalances(mockClient, TEST_ADDRESS, [
      { symbol: 'USDC', address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', decimals: 6 },
    ]);

    for (const b of balances) {
      expect(b.walletAddress).toBe(TEST_ADDRESS);
    }
  });
});
