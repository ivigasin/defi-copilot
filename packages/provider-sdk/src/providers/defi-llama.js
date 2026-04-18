"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchTokenPrices = fetchTokenPrices;
exports.fetchEthPrice = fetchEthPrice;
exports.fetchPoolApys = fetchPoolApys;
exports.clearDefiLlamaCache = clearDefiLlamaCache;
const PRICES_API = 'https://coins.llama.fi/prices/current';
const YIELDS_API = 'https://yields.llama.fi/pools';
/** Simple in-memory cache with TTL */
const cache = new Map();
const CACHE_TTL_MS = 60_000; // 60 seconds
function getCached(key) {
    const entry = cache.get(key);
    if (!entry || Date.now() > entry.expiresAt) {
        cache.delete(key);
        return null;
    }
    return entry.data;
}
function setCache(key, data) {
    cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}
/**
 * Fetch current USD prices for tokens.
 * @param tokenAddresses Array of checksummed or lowercase Ethereum addresses
 * @returns Map of lowercase address → USD price
 */
async function fetchTokenPrices(tokenAddresses) {
    if (tokenAddresses.length === 0)
        return new Map();
    const coins = tokenAddresses.map((a) => `ethereum:${a.toLowerCase()}`).join(',');
    const cacheKey = `prices:${coins}`;
    const cached = getCached(cacheKey);
    if (cached)
        return cached;
    const res = await fetch(`${PRICES_API}/${coins}`);
    if (!res.ok) {
        throw new Error(`DeFi Llama prices API error: ${res.status}`);
    }
    const body = (await res.json());
    const prices = new Map();
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
async function fetchEthPrice() {
    const cacheKey = 'price:eth';
    const cached = getCached(cacheKey);
    if (cached !== null)
        return cached;
    const res = await fetch(`${PRICES_API}/coingecko:ethereum`);
    if (!res.ok) {
        throw new Error(`DeFi Llama ETH price API error: ${res.status}`);
    }
    const body = (await res.json());
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
async function fetchPoolApys(project, chain = 'Ethereum') {
    const cacheKey = `yields:${project}:${chain}`;
    const cached = getCached(cacheKey);
    if (cached)
        return cached;
    const res = await fetch(YIELDS_API);
    if (!res.ok) {
        throw new Error(`DeFi Llama yields API error: ${res.status}`);
    }
    const body = (await res.json());
    const apys = new Map();
    for (const pool of body.data) {
        if (pool.project.toLowerCase() === project.toLowerCase() && pool.chain === chain) {
            apys.set(pool.symbol.toLowerCase(), pool.apy);
        }
    }
    setCache(cacheKey, apys);
    return apys;
}
/** Clear the price/yield cache (useful in tests) */
function clearDefiLlamaCache() {
    cache.clear();
}
//# sourceMappingURL=defi-llama.js.map