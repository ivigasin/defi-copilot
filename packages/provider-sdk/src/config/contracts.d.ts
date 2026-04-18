/** Aave V3 mainnet contract addresses */
export declare const AAVE_V3: {
    pool: "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2";
    uiPoolDataProvider: "0x91c0eA31b49B69Ea18607702c5d9aC360bf3dE7d";
    rewardsController: "0x8164Cc65827dcFe994AB23944CBC90e0aa80bFcb";
    poolAddressesProvider: "0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e";
};
/** Lido mainnet contract addresses */
export declare const LIDO: {
    stETH: "0xae7ab96520de3a18e5e111b5eaab095312d7fe84";
};
/** Minimal ERC-20 ABI for balanceOf + decimals */
export declare const ERC20_ABI: readonly [{
    readonly name: "balanceOf";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly name: "account";
        readonly type: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
    }];
}, {
    readonly name: "decimals";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint8";
    }];
}];
/** Aave V3 Pool ABI (getUserAccountData) */
export declare const AAVE_POOL_ABI: readonly [{
    readonly name: "getUserAccountData";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly name: "user";
        readonly type: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "totalCollateralBase";
        readonly type: "uint256";
    }, {
        readonly name: "totalDebtBase";
        readonly type: "uint256";
    }, {
        readonly name: "availableBorrowsBase";
        readonly type: "uint256";
    }, {
        readonly name: "currentLiquidationThreshold";
        readonly type: "uint256";
    }, {
        readonly name: "ltv";
        readonly type: "uint256";
    }, {
        readonly name: "healthFactor";
        readonly type: "uint256";
    }];
}];
/** Aave V3 UiPoolDataProvider ABI (getUserReservesData) */
export declare const AAVE_UI_POOL_DATA_PROVIDER_ABI: readonly [{
    readonly name: "getUserReservesData";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly name: "provider";
        readonly type: "address";
    }, {
        readonly name: "user";
        readonly type: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "tuple[]";
        readonly components: readonly [{
            readonly name: "underlyingAsset";
            readonly type: "address";
        }, {
            readonly name: "scaledATokenBalance";
            readonly type: "uint256";
        }, {
            readonly name: "usageAsCollateralEnabledOnUser";
            readonly type: "bool";
        }, {
            readonly name: "stableBorrowRate";
            readonly type: "uint256";
        }, {
            readonly name: "scaledVariableDebt";
            readonly type: "uint256";
        }, {
            readonly name: "principalStableDebt";
            readonly type: "uint256";
        }, {
            readonly name: "stableBorrowLastUpdateTimestamp";
            readonly type: "uint256";
        }];
    }, {
        readonly name: "userEmodeCategoryId";
        readonly type: "uint8";
    }];
}];
/** Aave V3 RewardsController ABI (getAllUserRewards) */
export declare const AAVE_REWARDS_ABI: readonly [{
    readonly name: "getAllUserRewards";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly name: "assets";
        readonly type: "address[]";
    }, {
        readonly name: "user";
        readonly type: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "rewardsList";
        readonly type: "address[]";
    }, {
        readonly name: "unclaimedAmounts";
        readonly type: "uint256[]";
    }];
}];
//# sourceMappingURL=contracts.d.ts.map