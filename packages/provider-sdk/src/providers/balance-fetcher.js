"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchBalances = fetchBalances;
const viem_1 = require("viem");
const tokens_1 = require("../config/tokens");
const contracts_1 = require("../config/contracts");
const defi_llama_1 = require("./defi-llama");
const CHAIN_ID_ETHEREUM = 1;
/**
 * Fetches native ETH + ERC-20 token balances for a wallet.
 */
async function fetchBalances(client, address, tokenList = tokens_1.DEFAULT_TOKEN_LIST) {
    const balances = [];
    const addr = address;
    // Fetch ETH balance + ERC-20 balances in parallel
    const tokenAddresses = tokenList.map((t) => t.address);
    const [ethBalanceWei, tokenBalancesRaw, ethPrice, tokenPrices] = await Promise.all([
        client.getBalance({ address: addr }),
        Promise.all(tokenList.map((token) => client
            .readContract({
            address: token.address,
            abi: contracts_1.ERC20_ABI,
            functionName: 'balanceOf',
            args: [addr],
        })
            .catch(() => 0n))),
        (0, defi_llama_1.fetchEthPrice)(),
        (0, defi_llama_1.fetchTokenPrices)(tokenAddresses),
    ]);
    // Native ETH
    const ethAmount = Number((0, viem_1.formatUnits)(ethBalanceWei, 18));
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
        if (rawBalance === 0n)
            continue;
        const amount = Number((0, viem_1.formatUnits)(rawBalance, token.decimals));
        if (amount <= 0)
            continue;
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
//# sourceMappingURL=balance-fetcher.js.map