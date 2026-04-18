import { fetchTokenPrices, fetchEthPrice, fetchPoolApys, clearDefiLlamaCache } from './defi-llama';

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  clearDefiLlamaCache();
  mockFetch.mockReset();
});

describe('fetchTokenPrices', () => {
  it('returns prices mapped by lowercase address', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        coins: {
          'ethereum:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': { price: 1.0, decimals: 6, symbol: 'USDC' },
          'ethereum:0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': { price: 65000, decimals: 8, symbol: 'WBTC' },
        },
      }),
    });

    const prices = await fetchTokenPrices([
      '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
    ]);

    expect(prices.get('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48')).toBe(1.0);
    expect(prices.get('0x2260fac5e5542a773aa44fbcfedf7c193bc2c599')).toBe(65000);
  });

  it('returns empty map for empty input', async () => {
    const prices = await fetchTokenPrices([]);
    expect(prices.size).toBe(0);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('caches results on second call', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ coins: { 'ethereum:0xabc': { price: 42, decimals: 18, symbol: 'TEST' } } }),
    });

    await fetchTokenPrices(['0xabc']);
    await fetchTokenPrices(['0xabc']);

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('throws on API error', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
    await expect(fetchTokenPrices(['0xabc'])).rejects.toThrow('DeFi Llama prices API error: 500');
  });
});

describe('fetchEthPrice', () => {
  it('returns ETH price', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ coins: { 'coingecko:ethereum': { price: 3200 } } }),
    });

    const price = await fetchEthPrice();
    expect(price).toBe(3200);
  });

  it('caches ETH price', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ coins: { 'coingecko:ethereum': { price: 3200 } } }),
    });

    await fetchEthPrice();
    await fetchEthPrice();
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});

describe('fetchPoolApys', () => {
  it('returns APYs filtered by project and chain', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [
          { pool: 'p1', project: 'aave-v3', chain: 'Ethereum', symbol: 'USDC', apy: 3.5, tvlUsd: 1e9 },
          { pool: 'p2', project: 'aave-v3', chain: 'Ethereum', symbol: 'DAI', apy: 2.8, tvlUsd: 5e8 },
          { pool: 'p3', project: 'compound-v3', chain: 'Ethereum', symbol: 'USDC', apy: 4.1, tvlUsd: 8e8 },
          { pool: 'p4', project: 'aave-v3', chain: 'Polygon', symbol: 'USDC', apy: 5.0, tvlUsd: 2e8 },
        ],
      }),
    });

    const apys = await fetchPoolApys('aave-v3');
    expect(apys.get('usdc')).toBe(3.5);
    expect(apys.get('dai')).toBe(2.8);
    expect(apys.has('compound')).toBe(false);
    expect(apys.size).toBe(2);
  });
});
