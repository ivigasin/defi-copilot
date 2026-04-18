import { fetchLidoPositions } from './lido';
import { PositionType } from '@defi-copilot/domain';
import * as defiLlama from './defi-llama';

jest.mock('./defi-llama');
const mockedDefiLlama = defiLlama as jest.Mocked<typeof defiLlama>;

const TEST_ADDRESS = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';

const createMockClient = (stETHBalance: bigint) =>
  ({
    readContract: jest.fn().mockResolvedValue(stETHBalance),
  }) as unknown as Parameters<typeof fetchLidoPositions>[0];

beforeEach(() => {
  jest.clearAllMocks();
});

describe('fetchLidoPositions', () => {
  it('returns staking position when stETH balance > 0', async () => {
    const client = createMockClient(1200000000000000000n); // 1.2 stETH

    mockedDefiLlama.fetchTokenPrices.mockResolvedValue(
      new Map([['0xae7ab96520de3a18e5e111b5eaab095312d7fe84', 3200]]),
    );
    mockedDefiLlama.fetchPoolApys.mockResolvedValue(new Map([['steth', 3.8]]));

    const positions = await fetchLidoPositions(client, TEST_ADDRESS);

    expect(positions).toHaveLength(1);
    expect(positions[0].protocol).toBe('Lido');
    expect(positions[0].positionType).toBe(PositionType.Staking);
    expect(positions[0].assetSymbols).toEqual(['stETH']);
    expect(positions[0].usdValue).toBeCloseTo(3840);
    expect(positions[0].apy).toBe(3.8);
    expect(positions[0].walletAddress).toBe(TEST_ADDRESS);
  });

  it('returns empty array when stETH balance is 0', async () => {
    const client = createMockClient(0n);
    const positions = await fetchLidoPositions(client, TEST_ADDRESS);
    expect(positions).toHaveLength(0);
  });

  it('returns empty array when readContract fails', async () => {
    const client = {
      readContract: jest.fn().mockRejectedValue(new Error('revert')),
    } as unknown as Parameters<typeof fetchLidoPositions>[0];

    const positions = await fetchLidoPositions(client, TEST_ADDRESS);
    expect(positions).toHaveLength(0);
  });

  it('has valid UUID id', async () => {
    const client = createMockClient(1000000000000000000n);
    mockedDefiLlama.fetchTokenPrices.mockResolvedValue(
      new Map([['0xae7ab96520de3a18e5e111b5eaab095312d7fe84', 3200]]),
    );
    mockedDefiLlama.fetchPoolApys.mockResolvedValue(new Map());

    const positions = await fetchLidoPositions(client, TEST_ADDRESS);
    expect(positions[0].id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });
});
