import { type PublicClient, formatUnits } from 'viem';
import { ProtocolPosition, PositionType } from '@defi-copilot/domain';
import { randomUUID } from 'crypto';
import { LIDO, ERC20_ABI } from '../config/contracts';
import { fetchTokenPrices, fetchPoolApys } from './defi-llama';

const CHAIN_ID_ETHEREUM = 1;

/**
 * Fetch Lido stETH staking position for a wallet.
 */
export async function fetchLidoPositions(
  client: PublicClient,
  address: string,
): Promise<ProtocolPosition[]> {
  const addr = address as `0x${string}`;

  const stETHBalanceRaw = await client
    .readContract({
      address: LIDO.stETH,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [addr],
    })
    .catch(() => 0n);

  if (stETHBalanceRaw === 0n) return [];

  const amount = Number(formatUnits(stETHBalanceRaw, 18));
  if (amount <= 0) return [];

  // Fetch stETH price and Lido APY in parallel
  const [prices, apys] = await Promise.all([
    fetchTokenPrices([LIDO.stETH]),
    fetchPoolApys('lido'),
  ]);

  const stETHPrice = prices.get(LIDO.stETH.toLowerCase()) ?? 0;
  const usdValue = amount * stETHPrice;

  // Lido pool symbol is typically "STETH"
  const apy = apys.get('steth') ?? apys.get('eth') ?? undefined;

  return [
    {
      id: randomUUID(),
      walletAddress: address,
      chainId: CHAIN_ID_ETHEREUM,
      protocol: 'Lido',
      positionType: PositionType.Staking,
      assetSymbols: ['stETH'],
      usdValue,
      apy,
      updatedAt: new Date(),
    },
  ];
}
