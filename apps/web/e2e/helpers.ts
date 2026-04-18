import { Page } from '@playwright/test';

const API_BASE = 'http://localhost:4000';
const WALLET_ADDRESS = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';

export const mockData = {
  walletAddress: WALLET_ADDRESS,

  wallet: {
    address: WALLET_ADDRESS,
    label: null,
    createdAt: '2026-01-01T00:00:00.000Z',
  },

  portfolio: {
    id: 'snap-1',
    walletAddress: WALLET_ADDRESS,
    totalUsdValue: 12750,
    timestamp: '2026-01-15T12:00:00.000Z',
    balances: [
      { id: 'b1', walletAddress: WALLET_ADDRESS, chainId: 1, tokenSymbol: 'ETH', tokenAddress: null, amount: 2.5, usdValue: 8000 },
      { id: 'b2', walletAddress: WALLET_ADDRESS, chainId: 1, tokenSymbol: 'USDC', tokenAddress: '0xa0b8', amount: 1500, usdValue: 1500 },
      { id: 'b3', walletAddress: WALLET_ADDRESS, chainId: 1, tokenSymbol: 'WBTC', tokenAddress: '0x2260', amount: 0.05, usdValue: 3250 },
    ],
  },

  positions: [
    {
      id: 'pos-1',
      walletAddress: WALLET_ADDRESS,
      chainId: 1,
      protocol: 'Aave',
      positionType: 'LENDING',
      assetSymbols: ['USDC'],
      usdValue: 5000,
      debtUsd: null,
      apy: 3.2,
      rewardsUsd: 65,
      healthFactor: null,
      riskScore: null,
      updatedAt: '2026-01-15T12:00:00.000Z',
    },
    {
      id: 'pos-2',
      walletAddress: WALLET_ADDRESS,
      chainId: 1,
      protocol: 'Aave',
      positionType: 'BORROWING',
      assetSymbols: ['DAI'],
      usdValue: 2000,
      debtUsd: 2000,
      apy: null,
      rewardsUsd: null,
      healthFactor: 1.8,
      riskScore: null,
      updatedAt: '2026-01-15T12:00:00.000Z',
    },
    {
      id: 'pos-3',
      walletAddress: WALLET_ADDRESS,
      chainId: 1,
      protocol: 'Lido',
      positionType: 'STAKING',
      assetSymbols: ['stETH'],
      usdValue: 3840,
      debtUsd: null,
      apy: 3.8,
      rewardsUsd: null,
      healthFactor: null,
      riskScore: null,
      updatedAt: '2026-01-15T12:00:00.000Z',
    },
  ],

  recommendations: [
    {
      id: 'rec-1',
      walletAddress: WALLET_ADDRESS,
      type: 'UNCLAIMED_REWARDS',
      title: 'Unclaimed Aave Rewards',
      summary: 'You have $65.00 in unclaimed rewards on Aave',
      rationale: ['You have unclaimed rewards exceeding $50'],
      confidence: 0.9,
      expectedImpactUsd: 65,
      createdAt: '2026-01-15T12:00:00.000Z',
    },
  ],

  alerts: [
    {
      id: 'alert-1',
      walletAddress: WALLET_ADDRESS,
      ruleId: 'rule-1',
      message: 'Health factor dropped below 1.5',
      severity: 'HIGH',
      createdAt: '2026-01-15T12:00:00.000Z',
    },
    {
      id: 'alert-2',
      walletAddress: WALLET_ADDRESS,
      ruleId: 'rule-2',
      message: 'Portfolio value dropped by 12%',
      severity: 'MEDIUM',
      createdAt: '2026-01-14T08:00:00.000Z',
    },
  ],
};

export async function mockApiRoutes(page: Page) {
  // Mock POST /wallets (register)
  await page.route(`${API_BASE}/wallets`, (route) => {
    if (route.request().method() === 'POST') {
      return route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify(mockData.wallet) });
    }
    return route.continue();
  });

  // Mock GET portfolio
  await page.route(`${API_BASE}/wallets/*/portfolio`, (route) => {
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockData.portfolio) });
  });

  // Mock GET positions
  await page.route(`${API_BASE}/wallets/*/positions`, (route) => {
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockData.positions) });
  });

  // Mock GET recommendations
  await page.route(`${API_BASE}/wallets/*/recommendations`, (route) => {
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockData.recommendations) });
  });

  // Mock GET alerts
  await page.route(`${API_BASE}/wallets/*/alerts`, (route) => {
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockData.alerts) });
  });
}

export async function connectWallet(page: Page) {
  // Inject mock window.ethereum into the live page so connectMetaMask() resolves to the test address
  await page.evaluate((address) => {
    (window as unknown as Record<string, unknown>).ethereum = {
      isMetaMask: true,
      request: async ({ method }: { method: string }) => {
        if (method === 'eth_requestAccounts') return [address];
        return null;
      },
    };
  }, WALLET_ADDRESS);

  await page.getByRole('button', { name: /Connect MetaMask/i }).click();
  // Wait for connected state — address truncated with ellipsis character
  await page.getByText(WALLET_ADDRESS.slice(0, 6)).waitFor();
}
