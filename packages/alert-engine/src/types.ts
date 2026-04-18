import { AlertRule, AlertEvent, AssetBalance, ProtocolPosition, PortfolioSnapshot } from '@defi-copilot/domain';

export interface AlertContext {
  walletAddress: string;
  rules: AlertRule[];
  balances: AssetBalance[];
  positions: ProtocolPosition[];
  currentSnapshot: PortfolioSnapshot;
  previousSnapshot?: PortfolioSnapshot;
  previousBalances?: AssetBalance[];
}

export type AlertEvaluator = (context: AlertContext) => AlertEvent[];
