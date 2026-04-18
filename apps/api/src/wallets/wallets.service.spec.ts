import { ConflictException, NotFoundException } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { WalletsRepository } from './wallets.repository';
import { MockPortfolioProvider } from '@defi-copilot/provider-sdk';
import { PositionType } from '@defi-copilot/domain';

const TEST_ADDRESS = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';

function makeRepo(): jest.Mocked<WalletsRepository> {
  return {
    findAllWallets: jest.fn(),
    createWallet: jest.fn(),
    findWallet: jest.fn(),
    createSnapshot: jest.fn(),
    replaceBalances: jest.fn(),
    replacePositions: jest.fn(),
    findRecommendations: jest.fn(),
    findAlertEvents: jest.fn(),
  } as unknown as jest.Mocked<WalletsRepository>;
}

describe('WalletsService', () => {
  let service: WalletsService;
  let repo: jest.Mocked<WalletsRepository>;
  let provider: MockPortfolioProvider;

  beforeEach(() => {
    repo = makeRepo();
    provider = new MockPortfolioProvider();
    service = new WalletsService(repo, provider);
  });

  describe('listWallets', () => {
    it('returns all wallets from repository', async () => {
      const wallets = [{ address: TEST_ADDRESS, label: null, createdAt: new Date() }];
      repo.findAllWallets.mockResolvedValue(wallets);

      const result = await service.listWallets();
      expect(result).toEqual(wallets);
      expect(repo.findAllWallets).toHaveBeenCalled();
    });
  });

  describe('registerWallet', () => {
    it('creates wallet when address is new', async () => {
      repo.findWallet.mockResolvedValue(null);
      const wallet = { address: TEST_ADDRESS, label: null, createdAt: new Date() };
      repo.createWallet.mockResolvedValue(wallet);

      const result = await service.registerWallet({ address: TEST_ADDRESS });
      expect(result).toEqual(wallet);
      expect(repo.createWallet).toHaveBeenCalledWith({ address: TEST_ADDRESS });
    });

    it('throws ConflictException when wallet already exists', async () => {
      repo.findWallet.mockResolvedValue({ address: TEST_ADDRESS, label: null, createdAt: new Date() });

      await expect(service.registerWallet({ address: TEST_ADDRESS })).rejects.toThrow(
        ConflictException,
      );
      expect(repo.createWallet).not.toHaveBeenCalled();
    });
  });

  describe('getPortfolio', () => {
    it('throws NotFoundException for unknown wallet', async () => {
      repo.findWallet.mockResolvedValue(null);
      await expect(service.getPortfolio(TEST_ADDRESS)).rejects.toThrow(NotFoundException);
    });

    it('returns snapshot with balances', async () => {
      repo.findWallet.mockResolvedValue({ address: TEST_ADDRESS, label: null, createdAt: new Date() });
      const snapshot = { id: 'snap-1', walletAddress: TEST_ADDRESS, totalUsdValue: 12750, timestamp: new Date() };
      repo.createSnapshot.mockResolvedValue(snapshot);
      const storedBalances = [{ id: 'b1', walletAddress: TEST_ADDRESS, chainId: 1, tokenSymbol: 'ETH', tokenAddress: null, amount: 2.5, usdValue: 8000 }];
      repo.replaceBalances.mockResolvedValue(storedBalances);

      const result = await service.getPortfolio(TEST_ADDRESS);
      expect(result.walletAddress).toBe(TEST_ADDRESS);
      expect(result.totalUsdValue).toBeGreaterThan(0);
      expect(result.balances).toEqual(storedBalances);
    });

    it('computes totalUsdValue as sum of balance usdValues', async () => {
      repo.findWallet.mockResolvedValue({ address: TEST_ADDRESS, label: null, createdAt: new Date() });
      repo.createSnapshot.mockImplementation(async (_addr, total) => ({
        id: 'snap-1', walletAddress: TEST_ADDRESS, totalUsdValue: total, timestamp: new Date(),
      }));
      repo.replaceBalances.mockResolvedValue([]);

      const result = await service.getPortfolio(TEST_ADDRESS);
      // Mock provider returns ETH $8000 + USDC $1500 + WBTC $3250 = $12750
      expect(result.totalUsdValue).toBe(12750);
    });
  });

  describe('getPositions', () => {
    it('throws NotFoundException for unknown wallet', async () => {
      repo.findWallet.mockResolvedValue(null);
      await expect(service.getPositions(TEST_ADDRESS)).rejects.toThrow(NotFoundException);
    });

    it('returns positions from provider', async () => {
      repo.findWallet.mockResolvedValue({ address: TEST_ADDRESS, label: null, createdAt: new Date() });
      const storedPositions = [
        { id: 'p1', walletAddress: TEST_ADDRESS, chainId: 1, protocol: 'Aave', positionType: PositionType.Lending, assetSymbols: ['USDC'], usdValue: 5000, debtUsd: null, apy: 3.2, rewardsUsd: 65, healthFactor: null, riskScore: null, metadata: null, updatedAt: new Date() },
      ];
      repo.replacePositions.mockResolvedValue(storedPositions);

      const result = await service.getPositions(TEST_ADDRESS);
      expect(result).toEqual(storedPositions);
      expect(repo.replacePositions).toHaveBeenCalledWith(TEST_ADDRESS, expect.any(Array));
    });
  });

  describe('getRecommendations', () => {
    it('throws NotFoundException for unknown wallet', async () => {
      repo.findWallet.mockResolvedValue(null);
      await expect(service.getRecommendations(TEST_ADDRESS)).rejects.toThrow(NotFoundException);
    });

    it('returns recommendations from repository', async () => {
      repo.findWallet.mockResolvedValue({ address: TEST_ADDRESS, label: null, createdAt: new Date() });
      repo.findRecommendations.mockResolvedValue([]);

      const result = await service.getRecommendations(TEST_ADDRESS);
      expect(result).toEqual([]);
    });
  });

  describe('getAlerts', () => {
    it('throws NotFoundException for unknown wallet', async () => {
      repo.findWallet.mockResolvedValue(null);
      await expect(service.getAlerts(TEST_ADDRESS)).rejects.toThrow(NotFoundException);
    });

    it('returns alert events from repository', async () => {
      repo.findWallet.mockResolvedValue({ address: TEST_ADDRESS, label: null, createdAt: new Date() });
      repo.findAlertEvents.mockResolvedValue([]);

      const result = await service.getAlerts(TEST_ADDRESS);
      expect(result).toEqual([]);
    });
  });
});
