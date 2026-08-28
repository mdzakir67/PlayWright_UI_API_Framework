import type { APIResponse } from '@playwright/test';
import { expect } from '@playwright/test';

export async function expectStatus(
  response: APIResponse,
  expectedStatus: number
): Promise<void> {
  expect(
    response.status(),
    `Expected HTTP ${expectedStatus}, but received ${response.status()}`
  ).toBe(expectedStatus);
}