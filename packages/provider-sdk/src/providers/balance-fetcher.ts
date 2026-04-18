import { type PublicClient, formatUnits } from 'viem';
import { AssetBalance } from '@defi-copilot/domain';
import { TokenConfig, DEFAULT_TOKEN_LIST } from '../config/tokens';
import { ERC20_ABI } from '../config/contracts';
import { fetchTokenPrices, fetchEthPrice } from './defi-llama';

const CHAIN_ID_ETHEREUM = 1;

/**
 * Fetches native ETH + ERC-20 token balances for a wallet.
 */
export async function fetchBalances(
  client: PublicClient,
  address: string,
  tokenList: TokenConfig[] = DEFAULT_TOKEN_LIST,
): Promise<AssetBalance[]> {
  const balances: AssetBalance[] = [];
  const addr = address as `0x${string}`;

  // Fetch ETH balance + ERC-20 balances in parallel
  const tokenAddresses = tokenList.map((t) => t.address);
  const [ethBalanceWei, tokenBalancesRaw, ethPrice, tokenPrices] = await Promise.all([
    client.getBalance({ address: addr }),
    Promise.all(
      tokenList.map((token) =>
        client
          .readContract({
            address: token.address as `0x${string}`,
            abi: ERC20_ABI,
            functionName: 'balanceOf',
            args: [addr],
          })
          .catch(() => 0n),
      ),
    ),
    fetchEthPrice(),
    fetchTokenPrices(tokenAddresses),
  ]);

  // Native ETH
  const ethAmount = Number(formatUnits(ethBalanceWei, 18));
  if (ethAmount > 0) {
    balances.push({
      walletAddress: address,
      chainId: CHAIN_ID_ETHEREUM,
      tokenSymbol: 'ETH',
      amount: ethAmount,
      usdValue: ethAmount * ethPrice,
    });
  }

  // ERC-20 tokens
  for (let i = 0; i < tokenList.length; i++) {
    const token = tokenList[i];
    const rawBalance = tokenBalancesRaw[i];
    if (rawBalance === 0n) continue;

    const amount = Number(formatUnits(rawBalance as bigint, token.decimals));
    if (amount <= 0) continue;

    const price = tokenPrices.get(token.address.toLowerCase()) ?? 0;

    balances.push({
      walletAddress: address,
      chainId: CHAIN_ID_ETHEREUM,
      tokenSymbol: token.symbol,
      tokenAddress: token.address,
      amount,
      usdValue: amount * price,
    });
  }

  return balances;
}
