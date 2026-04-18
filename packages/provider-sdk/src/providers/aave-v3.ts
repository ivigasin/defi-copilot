import { type PublicClient, formatUnits } from 'viem';
import { ProtocolPosition, PositionType } from '@defi-copilot/domain';
import { randomUUID } from 'crypto';
import { AAVE_V3, AAVE_POOL_ABI, AAVE_UI_POOL_DATA_PROVIDER_ABI } from '../config/contracts';
import { fetchPoolApys, fetchTokenPrices } from './defi-llama';
import { DEFAULT_TOKEN_LIST } from '../config/tokens';

const CHAIN_ID_ETHEREUM = 1;
// Aave V3 base currency unit is 8 decimals (USD)
const BASE_DECIMALS = 8;
// Health factor has 18 decimals
const HF_DECIMALS = 18;

interface AaveUserReserve {
  underlyingAsset: string;
  scaledATokenBalance: bigint;
  scaledVariableDebt: bigint;
}

/**
 * Fetch Aave V3 positions for a wallet address.
 */
export async function fetchAavePositions(
  client: PublicClient,
  address: string,
): Promise<ProtocolPosition[]> {
  const addr = address as `0x${string}`;

  // Fetch account data and per-reserve data in parallel
  const [accountData, reservesResult] = await Promise.all([
    client.readContract({
      address: AAVE_V3.pool,
      abi: AAVE_POOL_ABI,
      functionName: 'getUserAccountData',
      args: [addr],
    }),
    client.readContract({
      address: AAVE_V3.uiPoolDataProvider,
      abi: AAVE_UI_POOL_DATA_PROVIDER_ABI,
      functionName: 'getUserReservesData',
      args: [AAVE_V3.poolAddressesProvider, addr],
    }),
  ]);

  const [
    totalCollateralBase,
    totalDebtBase,
    ,
    ,
    ,
    healthFactorRaw,
  ] = accountData;

  const totalCollateralUsd = Number(formatUnits(totalCollateralBase, BASE_DECIMALS));
  const totalDebtUsd = Number(formatUnits(totalDebtBase, BASE_DECIMALS));
  const healthFactor = Number(formatUnits(healthFactorRaw, HF_DECIMALS));

  // No positions if no collateral and no debt
  if (totalCollateralUsd === 0 && totalDebtUsd === 0) {
    return [];
  }

  // Parse per-reserve data
  const userReserves = reservesResult[0] as unknown as AaveUserReserve[];

  // Build symbol lookup from known tokens
  const addressToSymbol = new Map<string, string>();
  for (const token of DEFAULT_TOKEN_LIST) {
    addressToSymbol.set(token.address.toLowerCase(), token.symbol);
  }

  // Fetch prices and APYs
  const reserveAddresses = userReserves
    .filter((r) => r.scaledATokenBalance > 0n || r.scaledVariableDebt > 0n)
    .map((r) => (r.underlyingAsset as string).toLowerCase());

  const [, apys] = await Promise.all([
    fetchTokenPrices(reserveAddresses),
    fetchPoolApys('aave-v3'),
  ]);

  const positions: ProtocolPosition[] = [];
  const now = new Date();

  // Lending positions (supply)
  const supplyAssets = userReserves.filter((r) => r.scaledATokenBalance > 0n);
  if (supplyAssets.length > 0) {
    const symbols = supplyAssets.map(
      (r) => addressToSymbol.get((r.underlyingAsset as string).toLowerCase()) ?? 'UNKNOWN',
    );

    positions.push({
      id: randomUUID(),
      walletAddress: address,
      chainId: CHAIN_ID_ETHEREUM,
      protocol: 'Aave',
      positionType: PositionType.Lending,
      assetSymbols: symbols,
      usdValue: totalCollateralUsd,
      apy: apys.get(symbols[0]?.toLowerCase() ?? '') ?? undefined,
      healthFactor: totalDebtUsd > 0 ? healthFactor : undefined,
      updatedAt: now,
    });
  }

  // Borrowing positions (debt)
  const borrowAssets = userReserves.filter((r) => r.scaledVariableDebt > 0n);
  if (borrowAssets.length > 0) {
    const symbols = borrowAssets.map(
      (r) => addressToSymbol.get((r.underlyingAsset as string).toLowerCase()) ?? 'UNKNOWN',
    );

    positions.push({
      id: randomUUID(),
      walletAddress: address,
      chainId: CHAIN_ID_ETHEREUM,
      protocol: 'Aave',
      positionType: PositionType.Borrowing,
      assetSymbols: symbols,
      usdValue: totalDebtUsd,
      debtUsd: totalDebtUsd,
      healthFactor: healthFactor,
      riskScore: healthFactorToRiskScore(healthFactor),
      updatedAt: now,
    });
  }

  return positions;
}

function healthFactorToRiskScore(hf: number): number {
  if (hf >= 3) return 10;
  if (hf >= 2) return 25;
  if (hf >= 1.5) return 40;
  if (hf >= 1.2) return 65;
  if (hf >= 1.05) return 85;
  return 95;
}
