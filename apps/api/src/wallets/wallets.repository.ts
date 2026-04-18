import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { AssetBalance, ProtocolPosition } from '@defi-copilot/domain';

@Injectable()
export class WalletsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllWallets() {
    return this.prisma.wallet.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async createWallet(dto: CreateWalletDto) {
    return this.prisma.wallet.create({
      data: { address: dto.address, label: dto.label },
    });
  }

  async findWallet(address: string) {
    return this.prisma.wallet.findUnique({ where: { address } });
  }

  async createSnapshot(walletAddress: string, totalUsdValue: number) {
    return this.prisma.portfolioSnapshot.create({
      data: { walletAddress, totalUsdValue },
    });
  }

  async replaceBalances(walletAddress: string, balances: AssetBalance[]) {
    await this.prisma.assetBalance.deleteMany({ where: { walletAddress } });
    await this.prisma.assetBalance.createMany({
      data: balances.map((b) => ({
        walletAddress: b.walletAddress,
        chainId: b.chainId,
        tokenSymbol: b.tokenSymbol,
        tokenAddress: b.tokenAddress,
        amount: b.amount,
        usdValue: b.usdValue,
      })),
    });
    return this.prisma.assetBalance.findMany({ where: { walletAddress } });
  }

  async replacePositions(walletAddress: string, positions: ProtocolPosition[]) {
    await this.prisma.protocolPosition.deleteMany({ where: { walletAddress } });
    await this.prisma.protocolPosition.createMany({
      data: positions.map((p) => ({
        id: p.id,
        walletAddress: p.walletAddress,
        chainId: p.chainId,
        protocol: p.protocol,
        positionType: p.positionType,
        assetSymbols: p.assetSymbols,
        usdValue: p.usdValue,
        debtUsd: p.debtUsd,
        apy: p.apy,
        rewardsUsd: p.rewardsUsd,
        healthFactor: p.healthFactor,
        riskScore: p.riskScore,
        metadata: p.metadata ? JSON.parse(JSON.stringify(p.metadata)) : undefined,
        updatedAt: p.updatedAt,
      })),
    });
    return this.prisma.protocolPosition.findMany({ where: { walletAddress } });
  }

  async findRecommendations(walletAddress: string) {
    return this.prisma.recommendation.findMany({
      where: { walletAddress },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAlertEvents(walletAddress: string) {
    return this.prisma.alertEvent.findMany({
      where: { walletAddress },
      orderBy: { createdAt: 'desc' },
    });
  }
}
