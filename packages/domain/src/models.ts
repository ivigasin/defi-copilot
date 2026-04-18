import { z } from 'zod';
import {
  PositionType,
  RecommendationType,
  AlertType,
  AlertSeverity,
} from './enums';

// --- Wallet ---

export const WalletSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid EVM address'),
  label: z.string().min(1).max(100).optional(),
  createdAt: z.date(),
});

export type Wallet = z.infer<typeof WalletSchema>;

// --- PortfolioSnapshot ---

export const PortfolioSnapshotSchema = z.object({
  walletAddress: z.string(),
  totalUsdValue: z.number().nonnegative(),
  timestamp: z.date(),
});

export type PortfolioSnapshot = z.infer<typeof PortfolioSnapshotSchema>;

// --- AssetBalance ---

export const AssetBalanceSchema = z.object({
  walletAddress: z.string(),
  chainId: z.number().int().positive(),
  tokenSymbol: z.string().min(1),
  tokenAddress: z.string().optional(),
  amount: z.number().nonnegative(),
  usdValue: z.number().nonnegative(),
});

export type AssetBalance = z.infer<typeof AssetBalanceSchema>;

// --- ProtocolPosition ---

export const ProtocolPositionSchema = z.object({
  id: z.string().uuid(),
  walletAddress: z.string(),
  chainId: z.number().int().positive(),
  protocol: z.string().min(1),
  positionType: z.nativeEnum(PositionType),
  assetSymbols: z.array(z.string().min(1)),
  usdValue: z.number().nonnegative(),
  debtUsd: z.number().nonnegative().optional(),
  apy: z.number().optional(),
  rewardsUsd: z.number().nonnegative().optional(),
  healthFactor: z.number().positive().optional(),
  riskScore: z.number().min(0).max(100).optional(),
  metadata: z.record(z.unknown()).optional(),
  updatedAt: z.date(),
});

export type ProtocolPosition = z.infer<typeof ProtocolPositionSchema>;

// --- Recommendation ---

export const RecommendationSchema = z.object({
  id: z.string().uuid(),
  walletAddress: z.string(),
  type: z.nativeEnum(RecommendationType),
  title: z.string().min(1),
  summary: z.string().min(1),
  rationale: z.array(z.string().min(1)),
  confidence: z.number().min(0).max(1),
  expectedImpactUsd: z.number().optional(),
  createdAt: z.date(),
});

export type Recommendation = z.infer<typeof RecommendationSchema>;

// --- AlertRule ---

export const AlertRuleSchema = z.object({
  id: z.string().uuid(),
  walletAddress: z.string(),
  type: z.nativeEnum(AlertType),
  threshold: z.number(),
  enabled: z.boolean(),
});

export type AlertRule = z.infer<typeof AlertRuleSchema>;

// --- AlertEvent ---

export const AlertEventSchema = z.object({
  id: z.string().uuid(),
  walletAddress: z.string(),
  ruleId: z.string().uuid(),
  message: z.string().min(1),
  severity: z.nativeEnum(AlertSeverity),
  createdAt: z.date(),
});

export type AlertEvent = z.infer<typeof AlertEventSchema>;
