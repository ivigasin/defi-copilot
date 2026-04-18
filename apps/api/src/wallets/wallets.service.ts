import { Injectable, ConflictException, NotFoundException, Inject } from '@nestjs/common';
import { PortfolioProvider } from '@defi-copilot/domain';
import { WalletsRepository } from './wallets.repository';
import { CreateWalletDto } from './dto/create-wallet.dto';

@Injectable()
export class WalletsService {
  constructor(
    private readonly repository: WalletsRepository,
    @Inject('PORTFOLIO_PROVIDER') private readonly provider: PortfolioProvider,
  ) {}

  async listWallets() {
    return this.repository.findAllWallets();
  }

  async registerWallet(dto: CreateWalletDto) {
    const existing = await this.repository.findWallet(dto.address);
    if (existing) {
      throw new ConflictException(`Wallet ${dto.address} is already registered`);
    }
    return this.repository.createWallet(dto);
  }

  async getPortfolio(address: string) {
    await this.assertWalletExists(address);

    const balances = await this.provider.getBalances(address);
    const totalUsdValue = balances.reduce((sum, b) => sum + b.usdValue, 0);

    const snapshot = await this.repository.createSnapshot(address, totalUsdValue);
    const stored = await this.repository.replaceBalances(address, balances);

    return { ...snapshot, balances: stored };
  }

  async getPositions(address: string) {
    await this.assertWalletExists(address);

    const positions = await this.provider.getPositions(address);
    return this.repository.replacePositions(address, positions);
  }

  async getRecommendations(address: string) {
    await this.assertWalletExists(address);
    return this.repository.findRecommendations(address);
  }

  async getAlerts(address: string) {
    await this.assertWalletExists(address);
    return this.repository.findAlertEvents(address);
  }

  private async assertWalletExists(address: string) {
    const wallet = await this.repository.findWallet(address);
    if (!wallet) {
      throw new NotFoundException(`Wallet ${address} not found`);
    }
  }
}
