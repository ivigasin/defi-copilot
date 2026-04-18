import { test, expect } from '@playwright/test';
import { mockApiRoutes, mockData, connectWallet } from './helpers';

const WALLET = mockData.walletAddress;

test.describe('Wallet Connection Flow', () => {
  test('shows Connect wallet button and opens modal with options', async ({ page }) => {
    await page.goto('/dashboard');
    const connectBtn = page.getByRole('button', { name: /Connect wallet/i });
    await expect(connectBtn).toBeVisible();

    await connectBtn.click();
    await expect(page.getByText('Select a wallet to connect')).toBeVisible();
    await expect(page.getByRole('button', { name: /MetaMask/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /OKX Wallet/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Ledger Live/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Coinbase Wallet/i })).toBeVisible();
  });

  test('connects via mock MetaMask and shows connected state', async ({ page }) => {
    await mockApiRoutes(page);
    await connectWallet(page);

    await expect(page.getByText('Connected')).toBeVisible();
    await expect(page.getByText(WALLET.slice(0, 6))).toBeVisible();
  });

  test('disconnect resets wallet state', async ({ page }) => {
    await mockApiRoutes(page);
    await connectWallet(page);

    await expect(page.getByText('Connected')).toBeVisible();

    await page.getByRole('button', { name: 'Disconnect' }).click();

    await expect(page.getByText('Connect a wallet to view your portfolio.')).toBeVisible();
  });
});
