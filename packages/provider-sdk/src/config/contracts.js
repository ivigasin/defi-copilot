"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AAVE_REWARDS_ABI = exports.AAVE_UI_POOL_DATA_PROVIDER_ABI = exports.AAVE_POOL_ABI = exports.ERC20_ABI = exports.LIDO = exports.AAVE_V3 = void 0;
/** Aave V3 mainnet contract addresses */
exports.AAVE_V3 = {
    pool: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
    uiPoolDataProvider: '0x91c0eA31b49B69Ea18607702c5d9aC360bf3dE7d',
    rewardsController: '0x8164Cc65827dcFe994AB23944CBC90e0aa80bFcb',
    poolAddressesProvider: '0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e',
};
/** Lido mainnet contract addresses */
exports.LIDO = {
    stETH: '0xae7ab96520de3a18e5e111b5eaab095312d7fe84',
};
/** Minimal ERC-20 ABI for balanceOf + decimals */
exports.ERC20_ABI = [
    {
        name: 'balanceOf',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'account', type: 'address' }],
        outputs: [{ name: '', type: 'uint256' }],
    },
    {
        name: 'decimals',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'uint8' }],
    },
];
/** Aave V3 Pool ABI (getUserAccountData) */
exports.AAVE_POOL_ABI = [
    {
        name: 'getUserAccountData',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'user', type: 'address' }],
        outputs: [
            { name: 'totalCollateralBase', type: 'uint256' },
            { name: 'totalDebtBase', type: 'uint256' },
            { name: 'availableBorrowsBase', type: 'uint256' },
            { name: 'currentLiquidationThreshold', type: 'uint256' },
            { name: 'ltv', type: 'uint256' },
            { name: 'healthFactor', type: 'uint256' },
        ],
    },
];
/** Aave V3 UiPoolDataProvider ABI (getUserReservesData) */
exports.AAVE_UI_POOL_DATA_PROVIDER_ABI = [
    {
        name: 'getUserReservesData',
        type: 'function',
        stateMutability: 'view',
        inputs: [
            { name: 'provider', type: 'address' },
            { name: 'user', type: 'address' },
        ],
        outputs: [
            {
                name: '',
                type: 'tuple[]',
                components: [
                    { name: 'underlyingAsset', type: 'address' },
                    { name: 'scaledATokenBalance', type: 'uint256' },
                    { name: 'usageAsCollateralEnabledOnUser', type: 'bool' },
                    { name: 'stableBorrowRate', type: 'uint256' },
                    { name: 'scaledVariableDebt', type: 'uint256' },
                    { name: 'principalStableDebt', type: 'uint256' },
                    { name: 'stableBorrowLastUpdateTimestamp', type: 'uint256' },
                ],
            },
            { name: 'userEmodeCategoryId', type: 'uint8' },
        ],
    },
];
/** Aave V3 RewardsController ABI (getAllUserRewards) */
exports.AAVE_REWARDS_ABI = [
    {
        name: 'getAllUserRewards',
        type: 'function',
        stateMutability: 'view',
        inputs: [
            { name: 'assets', type: 'address[]' },
            { name: 'user', type: 'address' },
        ],
        outputs: [
            { name: 'rewardsList', type: 'address[]' },
            { name: 'unclaimedAmounts', type: 'uint256[]' },
        ],
    },
];
//# sourceMappingURL=contracts.js.map