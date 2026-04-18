export enum PositionType {
  Lending = 'LENDING',
  Borrowing = 'BORROWING',
  LiquidityPool = 'LIQUIDITY_POOL',
  Staking = 'STAKING',
  Farming = 'FARMING',
  Vault = 'VAULT',
}

export enum RecommendationType {
  IdleStablecoin = 'IDLE_STABLECOIN',
  HighConcentration = 'HIGH_CONCENTRATION',
  LowHealthFactor = 'LOW_HEALTH_FACTOR',
  UnclaimedRewards = 'UNCLAIMED_REWARDS',
  LowYield = 'LOW_YIELD',
}

export enum AlertType {
  HealthFactor = 'HEALTH_FACTOR',
  PortfolioDrop = 'PORTFOLIO_DROP',
  YieldDrop = 'YIELD_DROP',
  LargeBalanceChange = 'LARGE_BALANCE_CHANGE',
}

export enum AlertSeverity {
  Low = 'LOW',
  Medium = 'MEDIUM',
  High = 'HIGH',
  Critical = 'CRITICAL',
}
