import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('root redirects to /dashboard', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('nav bar renders all links', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText('DeFi Copilot')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Positions' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Recommendations' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Alerts' })).toBeVisible();
  });

  test('navigates between pages', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

    await page.getByRole('link', { name: 'Positions' }).click();
    await expect(page).toHaveURL(/\/positions/);
    await expect(page.getByRole('heading', { name: 'Protocol Positions' })).toBeVisible();

    await page.getByRole('link', { name: 'Recommendations' }).click();
    await expect(page).toHaveURL(/\/recommendations/);
    await expect(page.getByRole('heading', { name: 'Recommendations' })).toBeVisible();

    await page.getByRole('link', { name: 'Alerts' }).click();
    await expect(page).toHaveURL(/\/alerts/);
    await expect(page.getByRole('heading', { name: 'Alerts' })).toBeVisible();
  });
});
