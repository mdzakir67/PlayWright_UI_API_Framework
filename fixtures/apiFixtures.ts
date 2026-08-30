import type { Page } from '@playwright/test';
import { test as base } from '@playwright/test';
import { AuthAPI } from '../api/authAPI';
import { AuthenticatedUser } from '../api/types/auth.types';
import { generateUser } from '../test-data/user-Data';
import { registerResponse } from '../api/schemas/auth.schema';



type ApiTestFixtures = {
  authAPI: AuthAPI;
};

type UiTestFixtures ={
  loggedInUIUser: Page
}

type ApiWorkerFixture = {
  authenticatedUser: AuthenticatedUser;
}

export const test = base.extend<ApiTestFixtures & UiTestFixtures,ApiWorkerFixture>({
  //API test(auth API) - test level
  authAPI: async ({ request }, use) => {
    const authAPI = new AuthAPI(request);

    await use(authAPI);
  },
  //Authenticated API - Worker level
  authenticatedUser: [async({playwright},use)=>{

    let user = generateUser({password:'zakir@123'})
    let payLoad = user;
    let requestContext = await playwright.request.newContext();
    let authAPI = new AuthAPI(requestContext);
    let registration:registerResponse = await authAPI.registerUser(payLoad)
    let authenticatedUser = {
      email: payLoad.email,
      password: payLoad.password,
      token: registration.token,
      userId: registration.user.id
    }
    await use(authenticatedUser);
    await requestContext.dispose();
  },{scope:'worker'}],

  //Authenticated UI - test level
  loggedInUIUser: async ({ browser, authenticatedUser }, use) => {
  const context = await browser.newContext();

  await context.addInitScript((token) => {
    localStorage.setItem('eventhub_token', token);
  }, authenticatedUser.token);

  const page = await context.newPage();

  await use(page);

  await context.close();
},

});

export { expect } from '@playwright/test';

