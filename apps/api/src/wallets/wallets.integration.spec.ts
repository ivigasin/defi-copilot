import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma.service';
import { AllExceptionsFilter } from '../common/filters/http-exception.filter';

// Mock PrismaService to avoid real DB dependency
const mockPrisma = {
  wallet: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
  portfolioSnapshot: {
    create: jest.fn(),
  },
  assetBalance: {
    deleteMany: jest.fn(),
    createMany: jest.fn(),
    findMany: jest.fn(),
  },
  protocolPosition: {
    deleteMany: jest.fn(),
    createMany: jest.fn(),
    findMany: jest.fn(),
  },
  recommendation: {
    findMany: jest.fn(),
  },
  alertEvent: {
    findMany: jest.fn(),
  },
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  $transaction: jest.fn(),
};
mockPrisma.$transaction.mockImplementation((fn: (tx: typeof mockPrisma) => Promise<unknown>) => fn(mockPrisma));

describe('Wallets API (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── GET /wallets ──────────────────────────────────────────────

  describe('GET /wallets', () => {
    const validAddress = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';

    it('returns list of registered wallets', async () => {
      mockPrisma.wallet.findMany.mockResolvedValue([
        { address: validAddress, label: null, createdAt: new Date() },
      ]);

      const res = await request(app.getHttpServer()).get('/wallets').expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0].address).toBe(validAddress);
    });

    it('returns empty array when no wallets registered', async () => {
      mockPrisma.wallet.findMany.mockResolvedValue([]);

      const res = await request(app.getHttpServer()).get('/wallets').expect(200);

      expect(res.body).toEqual([]);
    });
  });

  // ─── POST /wallets ─────────────────────────────────────────────

  describe('POST /wallets', () => {
    const validAddress = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';

    it('registers a new wallet', async () => {
      mockPrisma.wallet.findUnique.mockResolvedValue(null);
      mockPrisma.wallet.create.mockResolvedValue({
        address: validAddress,
        label: null,
        createdAt: new Date(),
      });

      const res = await request(app.getHttpServer())
        .post('/wallets')
        .send({ address: validAddress })
        .expect(201);

      expect(res.body.address).toBe(validAddress);
      expect(mockPrisma.wallet.create).toHaveBeenCalledWith({
        data: { address: validAddress, label: undefined },
      });
    });

    it('registers wallet with optional label', async () => {
      mockPrisma.wallet.findUnique.mockResolvedValue(null);
      mockPrisma.wallet.create.mockResolvedValue({
        address: validAddress,
        label: 'My Wallet',
        createdAt: new Date(),
      });

      const res = await request(app.getHttpServer())
        .post('/wallets')
        .send({ address: validAddress, label: 'My Wallet' })
        .expect(201);

      expect(res.body.label).toBe('My Wallet');
    });

    it('returns 409 for already-registered wallet', async () => {
      mockPrisma.wallet.findUnique.mockResolvedValue({
        address: validAddress,
        label: null,
        createdAt: new Date(),
      });

      await request(app.getHttpServer())
        .post('/wallets')
        .send({ address: validAddress })
        .expect(409);
    });

    it('returns 400 for invalid address format', async () => {
      await request(app.getHttpServer())
        .post('/wallets')
        .send({ address: 'not-an-address' })
        .expect(400);
    });

    it('returns 400 for missing address', async () => {
      await request(app.getHttpServer())
        .post('/wallets')
        .send({})
        .expect(400);
    });
  });

  // ─── GET /wallets/:address/portfolio ───────────────────────────

  describe('GET /wallets/:address/portfolio', () => {
    const address = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';

    it('returns portfolio snapshot with balances', async () => {
      mockPrisma.wallet.findUnique.mockResolvedValue({ address });
      mockPrisma.portfolioSnapshot.create.mockResolvedValue({
        id: 'snap-1',
        walletAddress: address,
        totalUsdValue: 12750,
        timestamp: new Date(),
      });
      mockPrisma.assetBalance.deleteMany.mockResolvedValue({ count: 0 });
      mockPrisma.assetBalance.createMany.mockResolvedValue({ count: 3 });
      mockPrisma.assetBalance.findMany.mockResolvedValue([
        { walletAddress: address, chainId: 1, tokenSymbol: 'ETH', amount: 2.5, usdValue: 8000 },
      ]);

      const res = await request(app.getHttpServer())
        .get(`/wallets/${address}/portfolio`)
        .expect(200);

      expect(res.body.totalUsdValue).toBe(12750);
      expect(res.body.balances).toHaveLength(1);
      expect(res.body.balances[0].tokenSymbol).toBe('ETH');
    });

    it('returns 404 for unregistered wallet', async () => {
      mockPrisma.wallet.findUnique.mockResolvedValue(null);

      await request(app.getHttpServer())
        .get(`/wallets/${address}/portfolio`)
        .expect(404);
    });
  });

  // ─── GET /wallets/:address/positions ───────────────────────────

  describe('GET /wallets/:address/positions', () => {
    const address = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';

    it('returns protocol positions', async () => {
      mockPrisma.wallet.findUnique.mockResolvedValue({ address });
      mockPrisma.protocolPosition.deleteMany.mockResolvedValue({ count: 0 });
      mockPrisma.protocolPosition.createMany.mockResolvedValue({ count: 2 });
      mockPrisma.protocolPosition.findMany.mockResolvedValue([
        {
          id: 'pos-1',
          walletAddress: address,
          chainId: 1,
          protocol: 'Aave',
          positionType: 'LENDING',
          assetSymbols: ['USDC'],
          usdValue: 5000,
          apy: 3.2,
          healthFactor: null,
          debtUsd: null,
          rewardsUsd: 65,
          riskScore: null,
          metadata: null,
          updatedAt: new Date(),
        },
      ]);

      const res = await request(app.getHttpServer())
        .get(`/wallets/${address}/positions`)
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].protocol).toBe('Aave');
    });

    it('returns 404 for unregistered wallet', async () => {
      mockPrisma.wallet.findUnique.mockResolvedValue(null);

      await request(app.getHttpServer())
        .get(`/wallets/${address}/positions`)
        .expect(404);
    });
  });

  // ─── GET /wallets/:address/recommendations ────────────────────

  describe('GET /wallets/:address/recommendations', () => {
    const address = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';

    it('returns recommendations list', async () => {
      mockPrisma.wallet.findUnique.mockResolvedValue({ address });
      mockPrisma.recommendation.findMany.mockResolvedValue([
        {
          id: 'rec-1',
          walletAddress: address,
          type: 'IDLE_STABLECOIN',
          title: 'Idle USDC',
          summary: 'Deploy your idle USDC',
          rationale: ['Reason 1'],
          confidence: 0.85,
          expectedImpactUsd: 150,
          createdAt: new Date(),
        },
      ]);

      const res = await request(app.getHttpServer())
        .get(`/wallets/${address}/recommendations`)
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].type).toBe('IDLE_STABLECOIN');
    });

    it('returns empty array when no recommendations', async () => {
      mockPrisma.wallet.findUnique.mockResolvedValue({ address });
      mockPrisma.recommendation.findMany.mockResolvedValue([]);

      const res = await request(app.getHttpServer())
        .get(`/wallets/${address}/recommendations`)
        .expect(200);

      expect(res.body).toEqual([]);
    });

    it('returns 404 for unregistered wallet', async () => {
      mockPrisma.wallet.findUnique.mockResolvedValue(null);

      await request(app.getHttpServer())
        .get(`/wallets/${address}/recommendations`)
        .expect(404);
    });
  });

  // ─── GET /wallets/:address/alerts ──────────────────────────────

  describe('GET /wallets/:address/alerts', () => {
    const address = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';

    it('returns alert events list', async () => {
      mockPrisma.wallet.findUnique.mockResolvedValue({ address });
      mockPrisma.alertEvent.findMany.mockResolvedValue([
        {
          id: 'alert-1',
          walletAddress: address,
          ruleId: 'rule-1',
          message: 'Health factor dropped below 1.5',
          severity: 'HIGH',
          createdAt: new Date(),
        },
      ]);

      const res = await request(app.getHttpServer())
        .get(`/wallets/${address}/alerts`)
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].severity).toBe('HIGH');
    });

    it('returns 404 for unregistered wallet', async () => {
      mockPrisma.wallet.findUnique.mockResolvedValue(null);

      await request(app.getHttpServer())
        .get(`/wallets/${address}/alerts`)
        .expect(404);
    });
  });
});
