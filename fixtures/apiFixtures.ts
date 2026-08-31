import type { Page } from '@playwright/test';
import { test as base } from '@playwright/test';
import { AuthAPI } from '../api/authAPI';
import { ApiResult } from '../api/types';
import type { RegisterUserResponse } from '../api/schemas/auth.schema';
import { AuthenticatedUser } from '../api/types/auth.types';
import { generateUser } from '../test-data/user-Data';



type ApiTestFixtures = {
  authAPI: AuthAPI;
};

type UiTestFixtures = {
  loggedInUIUser: Page
}

type ApiWorkerFixture = {
  authenticatedUser: AuthenticatedUser;
}

export const test = base.extend<ApiTestFixtures & UiTestFixtures, ApiWorkerFixture>({
  //API test(auth API) - test level
  authAPI: async ({ request }, use) => {
    const authAPI = new AuthAPI(request);

    await use(authAPI);
  },
  //Authenticated API - Worker level
  authenticatedUser: [async ({ playwright }, use) => {
    const payLoad = generateUser({ password: 'zakir@123' });
    const requestContext = await playwright.request.newContext();
    const authAPI = new AuthAPI(requestContext);
    const registration: ApiResult<RegisterUserResponse> = await authAPI.registerUser(payLoad)
    const authenticatedUser = {
      email: payLoad.email,
      password: payLoad.password,
      token: registration.custom_response.token,
      userId: registration.custom_response.user.id
    }
    try {
      await use(authenticatedUser);
    }
    finally {
      await requestContext.dispose();
    }
  }, { scope: 'worker' }],

  //Authenticated UI - test level
  loggedInUIUser: async ({ browser, authenticatedUser }, use) => {
    const context = await browser.newContext();

    await context.addInitScript((token) => {
      localStorage.setItem('eventhub_token', token);
    }, authenticatedUser.token);

    const page = await context.newPage();
    try {
      await use(page);
    }
    finally {
      await context.close();
    }
  },

});

export { expect } from '@playwright/test';

