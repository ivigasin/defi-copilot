import { test, expect } from '@playwright/test';
import { mockApiRoutes, mockData, connectWallet } from './helpers';

const WALLET = mockData.walletAddress;

test.describe('Wallet Connection Flow', () => {
  test('shows Connect MetaMask button', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByRole('button', { name: /Connect MetaMask/i })).toBeVisible();
  });

  test('connects via mock MetaMask and shows connected state', async ({ page }) => {
    await mockApiRoutes(page);
    await page.goto('/dashboard');
    await connectWallet(page);

    await expect(page.getByText('Connected')).toBeVisible();
    await expect(page.getByText(WALLET.slice(0, 6))).toBeVisible();
  });

  test('disconnect resets wallet state', async ({ page }) => {
    await mockApiRoutes(page);
    await page.goto('/dashboard');
    await connectWallet(page);

    await expect(page.getByText('Connected')).toBeVisible();

    await page.getByRole('button', { name: 'Disconnect' }).click();

    await expect(page.getByText('Connect a wallet to view your portfolio.')).toBeVisible();
  });
});
