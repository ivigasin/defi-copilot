import { test, expect } from '@playwright/test';
import { mockApiRoutes, connectWallet } from './helpers';

test.describe('Recommendations Page', () => {
  test('shows connect prompt when no wallet', async ({ page }) => {
    await page.goto('/recommendations');
    await expect(page.getByText('Connect a wallet to view recommendations.')).toBeVisible();
  });

  test('displays recommendations after connection', async ({ page }) => {
    await mockApiRoutes(page);
    await connectWallet(page, '/recommendations');

    await expect(page.getByText('Unclaimed Aave Rewards')).toBeVisible();
    await expect(page.getByText('You have $65.00 in unclaimed rewards on Aave')).toBeVisible();
    await expect(page.getByText('90% confidence')).toBeVisible();
  });

  test('shows rationale items', async ({ page }) => {
    await mockApiRoutes(page);
    await connectWallet(page, '/recommendations');

    await expect(page.getByText('You have unclaimed rewards exceeding $50')).toBeVisible();
  });

  test('shows expected impact', async ({ page }) => {
    await mockApiRoutes(page);
    await connectWallet(page, '/recommendations');

    await expect(page.getByText('Potential impact: $65.00')).toBeVisible();
  });
});
