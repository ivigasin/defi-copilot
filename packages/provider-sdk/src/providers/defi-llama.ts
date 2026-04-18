const PRICES_API = 'https://coins.llama.fi/prices/current';
const YIELDS_API = 'https://yields.llama.fi/pools';

interface PriceResult {
  coins: Record<string, { price: number; decimals: number; symbol: string }>;
}

interface YieldPool {
  pool: string;
  project: string;
  chain: string;
  symbol: string;
  apy: number;
  tvlUsd: number;
}

interface YieldsResult {
  data: YieldPool[];
}

/** Simple in-memory cache with TTL */
const cache = new Map<string, { data: unknown; expiresAt: number }>();
const CACHE_TTL_MS = 60_000; // 60 seconds

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry || Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache(key: string, data: unknown): void {
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

/**
 * Fetch current USD prices for tokens.
 * @param tokenAddresses Array of checksummed or lowercase Ethereum addresses
 * @returns Map of lowercase address → USD price
 */
export async function fetchTokenPrices(tokenAddresses: string[]): Promise<Map<string, number>> {
  if (tokenAddresses.length === 0) return new Map();

  const coins = tokenAddresses.map((a) => `ethereum:${a.toLowerCase()}`).join(',');
  const cacheKey = `prices:${coins}`;

  const cached = getCached<Map<string, number>>(cacheKey);
  if (cached) return cached;

  const res = await fetch(`${PRICES_API}/${coins}`);
  if (!res.ok) {
    throw new Error(`DeFi Llama prices API error: ${res.status}`);
  }

  const body: PriceResult = await res.json();
  const prices = new Map<string, number>();

  for (const [key, val] of Object.entries(body.coins)) {
    // key format: "ethereum:0x..."
    const addr = key.split(':')[1]?.toLowerCase();
    if (addr) {
      prices.set(addr, val.price);
    }
  }

  setCache(cacheKey, prices);
  return prices;
}

/**
 * Fetch ETH price via the native coingecko ID.
 */
export async function fetchEthPrice(): Promise<number> {
  const cacheKey = 'price:eth';
  const cached = getCached<number>(cacheKey);
  if (cached !== null) return cached;

  const res = await fetch(`${PRICES_API}/coingecko:ethereum`);
  if (!res.ok) {
    throw new Error(`DeFi Llama ETH price API error: ${res.status}`);
  }

  const body: PriceResult = await res.json();
  const price = body.coins['coingecko:ethereum']?.price;
  if (price === undefined) {
    throw new Error('ETH price not found in DeFi Llama response');
  }

  setCache(cacheKey, price);
  return price;
}

/**
 * Fetch APY for a specific project and chain.
 * @returns Map of lowercase pool symbol → APY percentage
 */
export async function fetchPoolApys(
  project: string,
  chain: string = 'Ethereum',
): Promise<Map<string, number>> {
  const cacheKey = `yields:${project}:${chain}`;
  const cached = getCached<Map<string, number>>(cacheKey);
  if (cached) return cached;

  const res = await fetch(YIELDS_API);
  if (!res.ok) {
    throw new Error(`DeFi Llama yields API error: ${res.status}`);
  }

  const body: YieldsResult = await res.json();
  const apys = new Map<string, number>();

  for (const pool of body.data) {
    if (pool.project.toLowerCase() === project.toLowerCase() && pool.chain === chain) {
      apys.set(pool.symbol.toLowerCase(), pool.apy);
    }
  }

  setCache(cacheKey, apys);
  return apys;
}

/** Clear the price/yield cache (useful in tests) */
export function clearDefiLlamaCache(): void {
  cache.clear();
}
