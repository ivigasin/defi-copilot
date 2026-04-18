import { AssetBalance, ProtocolPosition, Recommendation } from '@defi-copilot/domain';

export interface PortfolioData {
  walletAddress: string;
  balances: AssetBalance[];
  positions: ProtocolPosition[];
}

export type RecommendationRule = (data: PortfolioData) => Recommendation[];
