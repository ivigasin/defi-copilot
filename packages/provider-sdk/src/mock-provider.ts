import { AssetBalance, PortfolioProvider, ProtocolPosition, PositionType } from '@defi-copilot/domain';

const CHAIN_ID_ETHEREUM = 1;

// Deterministic UUIDs so tests can rely on stable IDs
const POSITION_IDS = {
  aaveLending: 'a1b2c3d4-0001-4000-8000-000000000001',
  aaveBorrowing: 'a1b2c3d4-0002-4000-8000-000000000002',
  lidoStaking: 'a1b2c3d4-0003-4000-8000-000000000003',
} as const;

export class MockPortfolioProvider implements PortfolioProvider {
  async getBalances(address: string): Promise<AssetBalance[]> {
    return [
      {
        walletAddress: address,
        chainId: CHAIN_ID_ETHEREUM,
        tokenSymbol: 'ETH',
        tokenAddress: undefined,
        amount: 2.5,
        usdValue: 8000,
      },
      {
        walletAddress: address,
        chainId: CHAIN_ID_ETHEREUM,
        tokenSymbol: 'USDC',
        tokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        amount: 1500,
        usdValue: 1500,
      },
      {
        walletAddress: address,
        chainId: CHAIN_ID_ETHEREUM,
        tokenSymbol: 'WBTC',
        tokenAddress: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
        amount: 0.05,
        usdValue: 3250,
      },
    ];
  }

  async getPositions(address: string): Promise<ProtocolPosition[]> {
    const now = new Date();

    return [
      // Aave: supplying USDC, borrowing DAI — health factor 1.8
      {
        id: POSITION_IDS.aaveLending,
        walletAddress: address,
        chainId: CHAIN_ID_ETHEREUM,
        protocol: 'Aave',
        positionType: PositionType.Lending,
        assetSymbols: ['USDC'],
        usdValue: 5000,
        apy: 3.2,
        rewardsUsd: 65,
        updatedAt: now,
      },
      {
        id: POSITION_IDS.aaveBorrowing,
        walletAddress: address,
        chainId: CHAIN_ID_ETHEREUM,
        protocol: 'Aave',
        positionType: PositionType.Borrowing,
        assetSymbols: ['DAI'],
        usdValue: 2000,
        debtUsd: 2000,
        apy: 4.5,
        healthFactor: 1.8,
        riskScore: 40,
        updatedAt: now,
      },
      // Lido: staking ETH
      {
        id: POSITION_IDS.lidoStaking,
        walletAddress: address,
        chainId: CHAIN_ID_ETHEREUM,
        protocol: 'Lido',
        positionType: PositionType.Staking,
        assetSymbols: ['stETH'],
        usdValue: 3840,
        apy: 3.8,
        rewardsUsd: 12,
        updatedAt: now,
      },
    ];
  }
}
