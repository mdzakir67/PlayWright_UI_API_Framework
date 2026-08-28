import { ApiResult, EventsAPI } from '../../api/eventsAPI';
import type { CreateEventResponse } from '../../api/schemas/events.schemas';
import { CreateEventPayload } from '../../api/types/events.types';
import { expect, test } from '../../fixtures/apiFixtures';
import { LoginPage } from '../../pages/LoginPage';
import { generateEvent } from '../../test-data/user-Data';

test('Login test - 1',async({page,authenticatedUser})=>{
    const {email,password} = authenticatedUser;
    await page.goto('/');
    const loginPage = new LoginPage(page);
    await loginPage.login(email,password);
    await expect(loginPage.loginDisplay).toBeVisible();
    await expect(loginPage.loginDisplay).toHaveText(email);
});

test('Login test -2',async({page,authenticatedUser})=>{
    const {email,password} = authenticatedUser;
    await page.goto('/');
    const loginPage = new LoginPage(page);
    await loginPage.login(email,password);
    await expect(loginPage.loginDisplay).toBeVisible();
    await expect(loginPage.loginDisplay).toHaveText(email);
});

test('Event Creation via API and Verification and deletion via UI', async ({ loggedInUIUser,request, authenticatedUser }) => {
  console.log('Test A user:', authenticatedUser.email);
  const eventsAPI = new EventsAPI(request);
  let eventResponse: ApiResult<CreateEventResponse> | undefined;
  try{
  let event:CreateEventPayload = generateEvent({city:'Bangalore'})  
  eventResponse = await eventsAPI.createEvent(authenticatedUser.token,event);
  expect(eventResponse.custom_response.success).toBe(true);
  expect(eventResponse.custom_response.message).toBeDefined();
  expect(eventResponse.custom_response.message).toBe('Event created successfully');
  expect(eventResponse.custom_response.data).toBeDefined();
  let eventName = eventResponse.custom_response.data.title;
  await loggedInUIUser.goto('/');  
  await loggedInUIUser.getByTestId('nav-events').click();
  await loggedInUIUser.getByRole('link', { name: 'Add New Event' }).click();
  
  // 1. Target rows using a class or broad locator instead of a duplicate ID
  const eventRow = loggedInUIUser.locator('.event-table-row, tr').filter({ hasText: eventName });

  // 2. Set up a one-time dialog listener right before the trigger action
  loggedInUIUser.once('dialog', async dialog => {
    expect(dialog.message()).toContain('delete'); // Optional: assert it's the correct dialog
    await dialog.accept();
  });
  
  // 3. Trigger the deletion
  await eventRow.getByTestId('delete-event-btn').click();
  // 2. Locate the custom modal dialog wrapper
  const confirmModal = loggedInUIUser.getByRole('dialog');

  // 3. Make sure the modal actually shows up on the screen
  await expect(confirmModal).toBeVisible();
  await expect(confirmModal.locator('#modal-title')).toHaveText('Delete this event?');

  // 4. Click the "Delete event" button inside the modal using its test-id
  await confirmModal.getByTestId('confirm-dialog-yes').click();

  // 5. Strict Assertion: Ensure the table row is completely gone from the screen
  await expect(eventRow).toHaveCount(0);
  }
  finally{
    console.log("Cleaning Up the event");
    if (eventResponse) {
      await eventsAPI.deleteEvent(eventResponse.custom_response.data.id, authenticatedUser.token);
    }
  }
  
});
