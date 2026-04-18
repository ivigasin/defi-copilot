/** Aave V3 mainnet contract addresses */
export const AAVE_V3 = {
  pool: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2' as const,
  uiPoolDataProvider: '0x91c0eA31b49B69Ea18607702c5d9aC360bf3dE7d' as const,
  rewardsController: '0x8164Cc65827dcFe994AB23944CBC90e0aa80bFcb' as const,
  poolAddressesProvider: '0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e' as const,
};

/** Lido mainnet contract addresses */
export const LIDO = {
  stETH: '0xae7ab96520de3a18e5e111b5eaab095312d7fe84' as const,
};

/** Minimal ERC-20 ABI for balanceOf + decimals */
export const ERC20_ABI = [
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
] as const;

/** Aave V3 Pool ABI (getUserAccountData) */
export const AAVE_POOL_ABI = [
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
] as const;

/** Aave V3 UiPoolDataProvider ABI (getUserReservesData) */
export const AAVE_UI_POOL_DATA_PROVIDER_ABI = [
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
] as const;

/** Aave V3 RewardsController ABI (getAllUserRewards) */
export const AAVE_REWARDS_ABI = [
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
] as const;
