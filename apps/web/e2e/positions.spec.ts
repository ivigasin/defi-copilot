import { test, expect } from '@playwright/test';
import { mockApiRoutes, connectWallet } from './helpers';

test.describe('Positions Page', () => {
  test('shows connect prompt when no wallet', async ({ page }) => {
    await page.goto('/positions');
    await expect(page.getByText('Connect a wallet to view positions.')).toBeVisible();
  });

  test('displays protocol positions after connection', async ({ page }) => {
    await mockApiRoutes(page);
    await connectWallet(page, '/positions');

    // Aave lending position
    await expect(page.getByText('Aave').first()).toBeVisible();
    await expect(page.getByText('LENDING')).toBeVisible();
    await expect(page.getByText('APY: 3.20%')).toBeVisible();

    // Aave borrowing position
    await expect(page.getByText('BORROWING')).toBeVisible();
    await expect(page.getByText('Health Factor: 1.80')).toBeVisible();

    // Lido staking position
    await expect(page.getByText('Lido')).toBeVisible();
    await expect(page.getByText('STAKING')).toBeVisible();
  });

  test('shows rewards on positions that have them', async ({ page }) => {
    await mockApiRoutes(page);
    await connectWallet(page, '/positions');

    await expect(page.getByText('Rewards: $65.00')).toBeVisible();
  });

  test('shows debt on borrowing positions', async ({ page }) => {
    await mockApiRoutes(page);
    await connectWallet(page, '/positions');

    await expect(page.getByText('Debt: $2,000.00')).toBeVisible();
  });
});
