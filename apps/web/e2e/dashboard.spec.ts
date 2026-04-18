import { test, expect } from '@playwright/test';
import { mockApiRoutes, connectWallet, mockData } from './helpers';

test.describe('Dashboard Page', () => {
  test('shows connect prompt when no wallet', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText('Connect a wallet to view your portfolio.')).toBeVisible();
  });

  test('displays portfolio data after wallet connection', async ({ page }) => {
    await mockApiRoutes(page);
    await connectWallet(page);

    // Total portfolio value
    await expect(page.getByText('Total Portfolio Value')).toBeVisible();
    await expect(page.getByText('$12,750.00')).toBeVisible();

    // Asset allocation section
    await expect(page.getByText('Asset Allocation')).toBeVisible();
    await expect(page.getByText('ETH')).toBeVisible();
    await expect(page.getByText('USDC')).toBeVisible();
    await expect(page.getByText('WBTC')).toBeVisible();
  });

  test('shows individual asset USD values', async ({ page }) => {
    await mockApiRoutes(page);
    await connectWallet(page);

    await expect(page.getByText('$8,000.00')).toBeVisible();
    await expect(page.getByText('$1,500.00')).toBeVisible();
    await expect(page.getByText('$3,250.00')).toBeVisible();
  });
});
