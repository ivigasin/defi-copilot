export interface TokenConfig {
  symbol: string;
  address: string;
  decimals: number;
}

/** Top ERC-20 tokens on Ethereum mainnet */
export const DEFAULT_TOKEN_LIST: TokenConfig[] = [
  { symbol: 'USDC', address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', decimals: 6 },
  { symbol: 'USDT', address: '0xdac17f958d2ee523a2206206994597c13d831ec7', decimals: 6 },
  { symbol: 'DAI', address: '0x6b175474e89094c44da98b954eedeac495271d0f', decimals: 18 },
  { symbol: 'WBTC', address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', decimals: 8 },
  { symbol: 'WETH', address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', decimals: 18 },
  { symbol: 'stETH', address: '0xae7ab96520de3a18e5e111b5eaab095312d7fe84', decimals: 18 },
];
