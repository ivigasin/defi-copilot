import { test, expect } from '@playwright/test';
import { mockApiRoutes, mockData } from './helpers';

const WALLET = mockData.walletAddress;

test.describe('Wallet Connection Flow', () => {
  test('shows connector buttons and manual entry toggle', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText('Enter address manually')).toBeVisible();
  });

  test('connects with manual address entry', async ({ page }) => {
    await mockApiRoutes(page);
    await page.goto('/dashboard');

    // Open manual entry
    await page.getByText('Enter address manually').click();
    await expect(page.getByPlaceholder('Enter EVM wallet address')).toBeVisible();

    // Enter address and connect
    await page.getByPlaceholder('Enter EVM wallet address').fill(WALLET);
    await page.getByRole('button', { name: 'Connect' }).click();

    // Verify connected state
    await expect(page.getByText('Connected:')).toBeVisible();
    await expect(page.getByText(`${WALLET.slice(0, 6)}...${WALLET.slice(-4)}`)).toBeVisible();
  });

  test('disconnect resets wallet state', async ({ page }) => {
    await mockApiRoutes(page);
    await page.goto('/dashboard');

    // Connect
    await page.getByText('Enter address manually').click();
    await page.getByPlaceholder('Enter EVM wallet address').fill(WALLET);
    await page.getByRole('button', { name: 'Connect' }).click();
    await expect(page.getByText('Connected:')).toBeVisible();

    // Disconnect
    await page.getByRole('button', { name: 'Disconnect' }).click();

    // Verify disconnected state
    await expect(page.getByText('Connect a wallet to view your portfolio.')).toBeVisible();
  });

  test('connect button disabled when input is empty', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByText('Enter address manually').click();
    await expect(page.getByRole('button', { name: 'Connect' })).toBeDisabled();
  });
});
