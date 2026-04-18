"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchLidoPositions = fetchLidoPositions;
const viem_1 = require("viem");
const domain_1 = require("@defi-copilot/domain");
const crypto_1 = require("crypto");
const contracts_1 = require("../config/contracts");
const defi_llama_1 = require("./defi-llama");
const CHAIN_ID_ETHEREUM = 1;
/**
 * Fetch Lido stETH staking position for a wallet.
 */
async function fetchLidoPositions(client, address) {
    const addr = address;
    const stETHBalanceRaw = await client
        .readContract({
        address: contracts_1.LIDO.stETH,
        abi: contracts_1.ERC20_ABI,
        functionName: 'balanceOf',
        args: [addr],
    })
        .catch(() => 0n);
    if (stETHBalanceRaw === 0n)
        return [];
    const amount = Number((0, viem_1.formatUnits)(stETHBalanceRaw, 18));
    if (amount <= 0)
        return [];
    // Fetch stETH price and Lido APY in parallel
    const [prices, apys] = await Promise.all([
        (0, defi_llama_1.fetchTokenPrices)([contracts_1.LIDO.stETH]),
        (0, defi_llama_1.fetchPoolApys)('lido'),
    ]);
    const stETHPrice = prices.get(contracts_1.LIDO.stETH.toLowerCase()) ?? 0;
    const usdValue = amount * stETHPrice;
    // Lido pool symbol is typically "STETH"
    const apy = apys.get('steth') ?? apys.get('eth') ?? undefined;
    return [
        {
            id: (0, crypto_1.randomUUID)(),
            walletAddress: address,
            chainId: CHAIN_ID_ETHEREUM,
            protocol: 'Lido',
            positionType: domain_1.PositionType.Staking,
            assetSymbols: ['stETH'],
            usdValue,
            apy,
            updatedAt: new Date(),
        },
    ];
}
//# sourceMappingURL=lido.js.map