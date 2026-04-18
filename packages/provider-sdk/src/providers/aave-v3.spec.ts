import { fetchAavePositions } from './aave-v3';
import { PositionType } from '@defi-copilot/domain';
import * as defiLlama from './defi-llama';

jest.mock('./defi-llama');
const mockedDefiLlama = defiLlama as jest.Mocked<typeof defiLlama>;

const TEST_ADDRESS = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';

// Helper to create bigints for Aave's 8-decimal base currency
const toBase = (usd: number) => BigInt(Math.round(usd * 1e8));
// Health factor uses 18 decimals
const toHF = (hf: number) => BigInt(Math.round(hf * 1e18));

function createMockClient(collateralUsd: number, debtUsd: number, hf: number, reserves: unknown[] = []) {
  return {
    readContract: jest.fn().mockImplementation(({ functionName }: { functionName: string }) => {
      if (functionName === 'getUserAccountData') {
        return Promise.resolve([
          toBase(collateralUsd),  // totalCollateralBase
          toBase(debtUsd),       // totalDebtBase
          toBase(1000),          // availableBorrowsBase
          8000n,                 // liquidationThreshold
          7500n,                 // ltv
          toHF(hf),             // healthFactor
        ]);
      }
      if (functionName === 'getUserReservesData') {
        return Promise.resolve([reserves, 0]);
      }
      return Promise.resolve(null);
    }),
  } as unknown as Parameters<typeof fetchAavePositions>[0];
}

beforeEach(() => {
  jest.clearAllMocks();
  mockedDefiLlama.fetchTokenPrices.mockResolvedValue(new Map());
  mockedDefiLlama.fetchPoolApys.mockResolvedValue(new Map([['usdc', 3.5]]));
});

describe('fetchAavePositions', () => {
  it('returns empty array when no collateral or debt', async () => {
    const client = createMockClient(0, 0, 0);
    const positions = await fetchAavePositions(client, TEST_ADDRESS);
    expect(positions).toHaveLength(0);
  });

  it('returns lending position for collateral', async () => {
    const reserves = [
      {
        underlyingAsset: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        scaledATokenBalance: 5000000000n, // some supply
        scaledVariableDebt: 0n,
      },
    ];
    const client = createMockClient(5000, 0, 0, reserves);

    const positions = await fetchAavePositions(client, TEST_ADDRESS);

    expect(positions).toHaveLength(1);
    expect(positions[0].protocol).toBe('Aave');
    expect(positions[0].positionType).toBe(PositionType.Lending);
    expect(positions[0].usdValue).toBe(5000);
    expect(positions[0].walletAddress).toBe(TEST_ADDRESS);
  });

  it('returns both lending and borrowing positions', async () => {
    const reserves = [
      {
        underlyingAsset: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        scaledATokenBalance: 5000000000n,
        scaledVariableDebt: 0n,
      },
      {
        underlyingAsset: '0x6b175474e89094c44da98b954eedeac495271d0f',
        scaledATokenBalance: 0n,
        scaledVariableDebt: 2000000000n,
      },
    ];
    const client = createMockClient(5000, 2000, 1.8, reserves);

    const positions = await fetchAavePositions(client, TEST_ADDRESS);

    expect(positions).toHaveLength(2);

    const lending = positions.find((p) => p.positionType === PositionType.Lending);
    expect(lending).toBeDefined();
    expect(lending!.usdValue).toBe(5000);

    const borrowing = positions.find((p) => p.positionType === PositionType.Borrowing);
    expect(borrowing).toBeDefined();
    expect(borrowing!.debtUsd).toBe(2000);
    expect(borrowing!.healthFactor).toBeCloseTo(1.8);
  });

  it('calculates risk score from health factor', async () => {
    const reserves = [
      {
        underlyingAsset: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        scaledATokenBalance: 0n,
        scaledVariableDebt: 1000000000n,
      },
    ];

    // HF = 1.1 → high risk
    const client = createMockClient(1100, 1000, 1.1, reserves);
    const positions = await fetchAavePositions(client, TEST_ADDRESS);

    const borrowing = positions.find((p) => p.positionType === PositionType.Borrowing);
    expect(borrowing!.riskScore).toBe(85); // 1.05 <= 1.1 < 1.2 → 85
  });

  it('includes APY from DeFi Llama', async () => {
    const reserves = [
      {
        underlyingAsset: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        scaledATokenBalance: 5000000000n,
        scaledVariableDebt: 0n,
      },
    ];
    const client = createMockClient(5000, 0, 0, reserves);

    const positions = await fetchAavePositions(client, TEST_ADDRESS);
    expect(positions[0].apy).toBe(3.5);
  });
});
