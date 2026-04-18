import {
  WalletSchema,
  PortfolioSnapshotSchema,
  AssetBalanceSchema,
  ProtocolPositionSchema,
  RecommendationSchema,
  AlertRuleSchema,
  AlertEventSchema,
} from './models';
import { PositionType, RecommendationType, AlertType, AlertSeverity } from './enums';

describe('WalletSchema', () => {
  it('accepts a valid wallet', () => {
    const result = WalletSchema.safeParse({
      address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
      createdAt: new Date(),
    });
    expect(result.success).toBe(true);
  });

  it('accepts wallet with optional label', () => {
    const result = WalletSchema.safeParse({
      address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
      label: 'My Wallet',
      createdAt: new Date(),
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid EVM address', () => {
    const result = WalletSchema.safeParse({
      address: 'not-an-address',
      createdAt: new Date(),
    });
    expect(result.success).toBe(false);
  });

  it('rejects address without 0x prefix', () => {
    const result = WalletSchema.safeParse({
      address: 'd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
      createdAt: new Date(),
    });
    expect(result.success).toBe(false);
  });

  it('rejects address with wrong length', () => {
    const result = WalletSchema.safeParse({
      address: '0xd8dA6BF269',
      createdAt: new Date(),
    });
    expect(result.success).toBe(false);
  });
});

describe('PortfolioSnapshotSchema', () => {
  it('accepts valid snapshot', () => {
    const result = PortfolioSnapshotSchema.safeParse({
      walletAddress: '0x123',
      totalUsdValue: 12750,
      timestamp: new Date(),
    });
    expect(result.success).toBe(true);
  });

  it('rejects negative totalUsdValue', () => {
    const result = PortfolioSnapshotSchema.safeParse({
      walletAddress: '0x123',
      totalUsdValue: -100,
      timestamp: new Date(),
    });
    expect(result.success).toBe(false);
  });
});

describe('AssetBalanceSchema', () => {
  it('accepts valid balance', () => {
    const result = AssetBalanceSchema.safeParse({
      walletAddress: '0x123',
      chainId: 1,
      tokenSymbol: 'ETH',
      amount: 2.5,
      usdValue: 8000,
    });
    expect(result.success).toBe(true);
  });

  it('rejects negative amount', () => {
    const result = AssetBalanceSchema.safeParse({
      walletAddress: '0x123',
      chainId: 1,
      tokenSymbol: 'ETH',
      amount: -1,
      usdValue: 0,
    });
    expect(result.success).toBe(false);
  });

  it('rejects zero chainId', () => {
    const result = AssetBalanceSchema.safeParse({
      walletAddress: '0x123',
      chainId: 0,
      tokenSymbol: 'ETH',
      amount: 1,
      usdValue: 3000,
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty tokenSymbol', () => {
    const result = AssetBalanceSchema.safeParse({
      walletAddress: '0x123',
      chainId: 1,
      tokenSymbol: '',
      amount: 1,
      usdValue: 3000,
    });
    expect(result.success).toBe(false);
  });
});

describe('ProtocolPositionSchema', () => {
  const validPosition = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    walletAddress: '0x123',
    chainId: 1,
    protocol: 'Aave',
    positionType: PositionType.Lending,
    assetSymbols: ['USDC'],
    usdValue: 5000,
    updatedAt: new Date(),
  };

  it('accepts valid position', () => {
    expect(ProtocolPositionSchema.safeParse(validPosition).success).toBe(true);
  });

  it('accepts position with all optional fields', () => {
    const result = ProtocolPositionSchema.safeParse({
      ...validPosition,
      debtUsd: 2000,
      apy: 3.2,
      rewardsUsd: 65,
      healthFactor: 1.8,
      riskScore: 40,
      metadata: { extra: 'data' },
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid positionType', () => {
    const result = ProtocolPositionSchema.safeParse({
      ...validPosition,
      positionType: 'INVALID',
    });
    expect(result.success).toBe(false);
  });

  it('rejects riskScore above 100', () => {
    const result = ProtocolPositionSchema.safeParse({
      ...validPosition,
      riskScore: 101,
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative healthFactor', () => {
    const result = ProtocolPositionSchema.safeParse({
      ...validPosition,
      healthFactor: -1,
    });
    expect(result.success).toBe(false);
  });
});

describe('RecommendationSchema', () => {
  const validRec = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    walletAddress: '0x123',
    type: RecommendationType.IdleStablecoin,
    title: 'Idle USDC',
    summary: 'Deploy your USDC',
    rationale: ['Reason 1'],
    confidence: 0.85,
    createdAt: new Date(),
  };

  it('accepts valid recommendation', () => {
    expect(RecommendationSchema.safeParse(validRec).success).toBe(true);
  });

  it('rejects confidence above 1', () => {
    expect(RecommendationSchema.safeParse({ ...validRec, confidence: 1.5 }).success).toBe(false);
  });

  it('rejects confidence below 0', () => {
    expect(RecommendationSchema.safeParse({ ...validRec, confidence: -0.1 }).success).toBe(false);
  });

  it('rejects empty rationale array member', () => {
    expect(RecommendationSchema.safeParse({ ...validRec, rationale: [''] }).success).toBe(false);
  });
});

describe('AlertRuleSchema', () => {
  it('accepts valid rule', () => {
    const result = AlertRuleSchema.safeParse({
      id: '550e8400-e29b-41d4-a716-446655440000',
      walletAddress: '0x123',
      type: AlertType.HealthFactor,
      threshold: 1.5,
      enabled: true,
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid alert type', () => {
    const result = AlertRuleSchema.safeParse({
      id: '550e8400-e29b-41d4-a716-446655440000',
      walletAddress: '0x123',
      type: 'NONEXISTENT',
      threshold: 1.5,
      enabled: true,
    });
    expect(result.success).toBe(false);
  });
});

describe('AlertEventSchema', () => {
  it('accepts valid event', () => {
    const result = AlertEventSchema.safeParse({
      id: '550e8400-e29b-41d4-a716-446655440000',
      walletAddress: '0x123',
      ruleId: '550e8400-e29b-41d4-a716-446655440001',
      message: 'Health factor dropped',
      severity: AlertSeverity.High,
      createdAt: new Date(),
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty message', () => {
    const result = AlertEventSchema.safeParse({
      id: '550e8400-e29b-41d4-a716-446655440000',
      walletAddress: '0x123',
      ruleId: '550e8400-e29b-41d4-a716-446655440001',
      message: '',
      severity: AlertSeverity.High,
      createdAt: new Date(),
    });
    expect(result.success).toBe(false);
  });
});
