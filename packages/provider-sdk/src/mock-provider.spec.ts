import { PositionType } from '@defi-copilot/domain';
import { MockPortfolioProvider } from './mock-provider';
import { createProvider } from './provider-factory';

const TEST_ADDRESS = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';

describe('MockPortfolioProvider', () => {
  let provider: MockPortfolioProvider;

  beforeEach(() => {
    provider = new MockPortfolioProvider();
  });

  describe('getBalances', () => {
    it('returns three token balances', async () => {
      const balances = await provider.getBalances(TEST_ADDRESS);
      expect(balances).toHaveLength(3);
    });

    it('sets walletAddress on every balance', async () => {
      const balances = await provider.getBalances(TEST_ADDRESS);
      expect(balances.every((b) => b.walletAddress === TEST_ADDRESS)).toBe(true);
    });

    it('includes ETH, USDC, and WBTC', async () => {
      const balances = await provider.getBalances(TEST_ADDRESS);
      const symbols = balances.map((b) => b.tokenSymbol);
      expect(symbols).toContain('ETH');
      expect(symbols).toContain('USDC');
      expect(symbols).toContain('WBTC');
    });

    it('returns non-negative usdValues', async () => {
      const balances = await provider.getBalances(TEST_ADDRESS);
      expect(balances.every((b) => b.usdValue >= 0)).toBe(true);
    });

    it('uses chainId 1 (Ethereum) for all balances', async () => {
      const balances = await provider.getBalances(TEST_ADDRESS);
      expect(balances.every((b) => b.chainId === 1)).toBe(true);
    });
  });

  describe('getPositions', () => {
    it('returns three positions', async () => {
      const positions = await provider.getPositions(TEST_ADDRESS);
      expect(positions).toHaveLength(3);
    });

    it('sets walletAddress on every position', async () => {
      const positions = await provider.getPositions(TEST_ADDRESS);
      expect(positions.every((p) => p.walletAddress === TEST_ADDRESS)).toBe(true);
    });

    it('includes Aave lending, Aave borrowing, and Lido staking', async () => {
      const positions = await provider.getPositions(TEST_ADDRESS);
      const aaveLending = positions.find(
        (p) => p.protocol === 'Aave' && p.positionType === PositionType.Lending,
      );
      const aaveBorrowing = positions.find(
        (p) => p.protocol === 'Aave' && p.positionType === PositionType.Borrowing,
      );
      const lido = positions.find((p) => p.protocol === 'Lido');

      expect(aaveLending).toBeDefined();
      expect(aaveBorrowing).toBeDefined();
      expect(lido).toBeDefined();
    });

    it('Aave borrowing position has healthFactor and debtUsd', async () => {
      const positions = await provider.getPositions(TEST_ADDRESS);
      const borrow = positions.find(
        (p) => p.protocol === 'Aave' && p.positionType === PositionType.Borrowing,
      )!;
      expect(borrow.healthFactor).toBeGreaterThan(0);
      expect(borrow.debtUsd).toBeGreaterThan(0);
    });

    it('Lido staking position has apy', async () => {
      const positions = await provider.getPositions(TEST_ADDRESS);
      const lido = positions.find((p) => p.protocol === 'Lido')!;
      expect(lido.apy).toBeGreaterThan(0);
    });

    it('returns stable UUIDs for positions', async () => {
      const first = await provider.getPositions(TEST_ADDRESS);
      const second = await provider.getPositions(TEST_ADDRESS);
      expect(first.map((p) => p.id)).toEqual(second.map((p) => p.id));
    });

    it('returns non-negative usdValues', async () => {
      const positions = await provider.getPositions(TEST_ADDRESS);
      expect(positions.every((p) => p.usdValue >= 0)).toBe(true);
    });
  });
});

describe('createProvider', () => {
  it('returns a MockPortfolioProvider for type "mock"', () => {
    const provider = createProvider('mock');
    expect(provider).toBeInstanceOf(MockPortfolioProvider);
  });
});
