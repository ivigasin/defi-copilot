import { test, expect } from '@playwright/test';
import { mockApiRoutes, mockData, connectWallet } from './helpers';

const WALLET = mockData.walletAddress;

test.describe('Wallet Connection Flow', () => {
  test('clicking MetaMask without extension does not show Provider not found error', async ({ page }) => {
    // Intentionally do NOT inject mock ethereum — MetaMask is absent in this scenario
    await page.goto('/dashboard');

    await page.getByRole('button', { name: /Connect wallet/i }).click();
    await expect(page.getByRole('dialog', { name: 'Connect Wallet' })).toBeVisible();

    await page.getByRole('button', { name: /MetaMask/i }).click();

    // Wait for wagmi to settle: either an error appears or the modal stays stable.
    // Use expect.poll to avoid a fixed sleep.
    const errorLocator = page.locator('p.text-rose-400');
    await expect
      .poll(async () => {
        const count = await errorLocator.count();
        if (count === 0) return 'no-error';
        return await errorLocator.first().textContent();
      }, { timeout: 3000 })
      .not.toContain('Provider not found');
  });

  test('shows Connect wallet button and opens modal with options', async ({ page }) => {
    await page.goto('/dashboard');
    const connectBtn = page.getByRole('button', { name: /Connect wallet/i });
    await expect(connectBtn).toBeVisible();

    await connectBtn.click();
    await expect(page.getByRole('dialog', { name: 'Connect Wallet' })).toBeVisible();
    await expect(page.getByText('Select a wallet to connect')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Close' })).toBeFocused();
    await expect(page.getByRole('button', { name: /MetaMask/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /OKX Wallet/i })).toBeVisible();
    if (process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID) {
      await expect(page.getByRole('button', { name: /Ledger Live/i })).toBeVisible();
    }
    await expect(page.getByRole('button', { name: /Coinbase Wallet/i })).toBeVisible();
  });

  test('connects via mock MetaMask and shows connected state', async ({ page }) => {
    await mockApiRoutes(page);
    await connectWallet(page);

    await expect(page.getByText(WALLET.slice(0, 6))).toBeVisible();
    await expect(page.getByRole('button', { name: 'Disconnect' })).toBeVisible();
  });

  test('disconnect resets wallet state', async ({ page }) => {
    await mockApiRoutes(page);
    await connectWallet(page);

    await expect(page.getByText(WALLET.slice(0, 6))).toBeVisible();

    await page.getByRole('button', { name: 'Disconnect' }).click();

    await expect(page.getByText('Connect a wallet to view your portfolio.')).toBeVisible();
  });
});
