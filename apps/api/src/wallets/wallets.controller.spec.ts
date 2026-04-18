import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { WalletsController } from './wallets.controller';
import { WalletsService } from './wallets.service';

const TEST_ADDRESS = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';

const mockService: jest.Mocked<Pick<WalletsService, 'listWallets' | 'registerWallet' | 'getPortfolio' | 'getPositions' | 'getRecommendations' | 'getAlerts'>> = {
  listWallets: jest.fn(),
  registerWallet: jest.fn(),
  getPortfolio: jest.fn(),
  getPositions: jest.fn(),
  getRecommendations: jest.fn(),
  getAlerts: jest.fn(),
};

describe('WalletsController', () => {
  let controller: WalletsController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WalletsController],
      providers: [{ provide: WalletsService, useValue: mockService }],
    }).compile();

    controller = module.get(WalletsController);
  });

  describe('GET /wallets', () => {
    it('delegates to service.listWallets', async () => {
      const wallets = [{ address: TEST_ADDRESS, label: null, createdAt: new Date() }];
      mockService.listWallets.mockResolvedValue(wallets);

      const result = await controller.listWallets();
      expect(result).toEqual(wallets);
      expect(mockService.listWallets).toHaveBeenCalled();
    });
  });

  describe('POST /wallets', () => {
    it('delegates to service.registerWallet', async () => {
      const wallet = { address: TEST_ADDRESS, label: null, createdAt: new Date() };
      mockService.registerWallet.mockResolvedValue(wallet);

      const result = await controller.registerWallet({ address: TEST_ADDRESS });
      expect(result).toEqual(wallet);
      expect(mockService.registerWallet).toHaveBeenCalledWith({ address: TEST_ADDRESS });
    });

    it('propagates ConflictException', async () => {
      mockService.registerWallet.mockRejectedValue(new ConflictException());
      await expect(controller.registerWallet({ address: TEST_ADDRESS })).rejects.toThrow(ConflictException);
    });
  });

  describe('GET /wallets/:address/portfolio', () => {
    it('delegates to service.getPortfolio', async () => {
      const portfolio = { id: 'snap-1', walletAddress: TEST_ADDRESS, totalUsdValue: 12750, timestamp: new Date(), balances: [] };
      mockService.getPortfolio.mockResolvedValue(portfolio);

      const result = await controller.getPortfolio(TEST_ADDRESS);
      expect(result).toEqual(portfolio);
    });

    it('propagates NotFoundException', async () => {
      mockService.getPortfolio.mockRejectedValue(new NotFoundException());
      await expect(controller.getPortfolio(TEST_ADDRESS)).rejects.toThrow(NotFoundException);
    });
  });

  describe('GET /wallets/:address/positions', () => {
    it('delegates to service.getPositions', async () => {
      mockService.getPositions.mockResolvedValue([]);
      const result = await controller.getPositions(TEST_ADDRESS);
      expect(result).toEqual([]);
    });
  });

  describe('GET /wallets/:address/recommendations', () => {
    it('delegates to service.getRecommendations', async () => {
      mockService.getRecommendations.mockResolvedValue([]);
      const result = await controller.getRecommendations(TEST_ADDRESS);
      expect(result).toEqual([]);
    });
  });

  describe('GET /wallets/:address/alerts', () => {
    it('delegates to service.getAlerts', async () => {
      mockService.getAlerts.mockResolvedValue([]);
      const result = await controller.getAlerts(TEST_ADDRESS);
      expect(result).toEqual([]);
    });
  });
});
