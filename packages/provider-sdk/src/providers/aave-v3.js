"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchAavePositions = fetchAavePositions;
const viem_1 = require("viem");
const domain_1 = require("@defi-copilot/domain");
const crypto_1 = require("crypto");
const contracts_1 = require("../config/contracts");
const defi_llama_1 = require("./defi-llama");
const tokens_1 = require("../config/tokens");
const CHAIN_ID_ETHEREUM = 1;
// Aave V3 base currency unit is 8 decimals (USD)
const BASE_DECIMALS = 8;
// Health factor has 18 decimals
const HF_DECIMALS = 18;
/**
 * Fetch Aave V3 positions for a wallet address.
 */
async function fetchAavePositions(client, address) {
    const addr = address;
    // Fetch account data and per-reserve data in parallel
    const [accountData, reservesResult] = await Promise.all([
        client.readContract({
            address: contracts_1.AAVE_V3.pool,
            abi: contracts_1.AAVE_POOL_ABI,
            functionName: 'getUserAccountData',
            args: [addr],
        }),
        client.readContract({
            address: contracts_1.AAVE_V3.uiPoolDataProvider,
            abi: contracts_1.AAVE_UI_POOL_DATA_PROVIDER_ABI,
            functionName: 'getUserReservesData',
            args: [contracts_1.AAVE_V3.poolAddressesProvider, addr],
        }),
    ]);
    const [totalCollateralBase, totalDebtBase, , , , healthFactorRaw,] = accountData;
    const totalCollateralUsd = Number((0, viem_1.formatUnits)(totalCollateralBase, BASE_DECIMALS));
    const totalDebtUsd = Number((0, viem_1.formatUnits)(totalDebtBase, BASE_DECIMALS));
    const healthFactor = Number((0, viem_1.formatUnits)(healthFactorRaw, HF_DECIMALS));
    // No positions if no collateral and no debt
    if (totalCollateralUsd === 0 && totalDebtUsd === 0) {
        return [];
    }
    // Parse per-reserve data
    const userReserves = reservesResult[0];
    // Build symbol lookup from known tokens
    const addressToSymbol = new Map();
    for (const token of tokens_1.DEFAULT_TOKEN_LIST) {
        addressToSymbol.set(token.address.toLowerCase(), token.symbol);
    }
    // Fetch prices and APYs
    const reserveAddresses = userReserves
        .filter((r) => r.scaledATokenBalance > 0n || r.scaledVariableDebt > 0n)
        .map((r) => r.underlyingAsset.toLowerCase());
    const [, apys] = await Promise.all([
        (0, defi_llama_1.fetchTokenPrices)(reserveAddresses),
        (0, defi_llama_1.fetchPoolApys)('aave-v3'),
    ]);
    const positions = [];
    const now = new Date();
    // Lending positions (supply)
    const supplyAssets = userReserves.filter((r) => r.scaledATokenBalance > 0n);
    if (supplyAssets.length > 0) {
        const symbols = supplyAssets.map((r) => addressToSymbol.get(r.underlyingAsset.toLowerCase()) ?? 'UNKNOWN');
        positions.push({
            id: (0, crypto_1.randomUUID)(),
            walletAddress: address,
            chainId: CHAIN_ID_ETHEREUM,
            protocol: 'Aave',
            positionType: domain_1.PositionType.Lending,
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
        const symbols = borrowAssets.map((r) => addressToSymbol.get(r.underlyingAsset.toLowerCase()) ?? 'UNKNOWN');
        positions.push({
            id: (0, crypto_1.randomUUID)(),
            walletAddress: address,
            chainId: CHAIN_ID_ETHEREUM,
            protocol: 'Aave',
            positionType: domain_1.PositionType.Borrowing,
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
function healthFactorToRiskScore(hf) {
    if (hf >= 3)
        return 10;
    if (hf >= 2)
        return 25;
    if (hf >= 1.5)
        return 40;
    if (hf >= 1.2)
        return 65;
    if (hf >= 1.05)
        return 85;
    return 95;
}
//# sourceMappingURL=aave-v3.js.map