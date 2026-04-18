import { AssetBalance, ProtocolPosition } from './models';

export interface PortfolioProvider {
  getBalances(address: string): Promise<AssetBalance[]>;
  getPositions(address: string): Promise<ProtocolPosition[]>;
}
