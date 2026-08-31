import { defineConfig, devices } from '@playwright/test';
import { config } from './config/environment';

export default defineConfig({
  testDir: './tests',
  timeout:30000,

  use: {
    baseURL: config.uiBaseURL,
    trace: 'on-first-retry',
    screenshot: 'on-first-failure',
    headless: true,
  },
  workers:2,
  retries: process.env.CI ? 1 : 0,
  forbidOnly: !!process.env.CI,
  reporter: [
  ['list'],
  ['html', { open: 'never' }],
  ],

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});