import { test, expect } from '@playwright/test';
import { mockApiRoutes, connectWallet } from './helpers';

test.describe('Alerts Page', () => {
  test('shows connect prompt when no wallet', async ({ page }) => {
    await page.goto('/alerts');
    await expect(page.getByText('Connect a wallet to view alerts.')).toBeVisible();
  });

  test('displays alert events after connection', async ({ page }) => {
    await mockApiRoutes(page);
    await connectWallet(page, '/alerts');

    await expect(page.getByText('Health factor dropped below 1.5')).toBeVisible();
    await expect(page.getByText('Portfolio value dropped by 12%')).toBeVisible();
  });

  test('shows severity badges', async ({ page }) => {
    await mockApiRoutes(page);
    await connectWallet(page, '/alerts');

    await expect(page.getByText('HIGH')).toBeVisible();
    await expect(page.getByText('MEDIUM')).toBeVisible();
  });
});
