import type { ApiResult } from '../../api/eventsAPI';
import { EventsAPI } from '../../api/eventsAPI';
import { CurrentLoggedInUserResponse, RegisterUserResponse } from '../../api/schemas/auth.schema';
import { FetchEventsResponse } from '../../api/schemas/events.schemas';
import { expect, test } from '../../fixtures/apiFixtures';
import { EventsPage } from '../../pages/EventsPage';
import { generateUser } from '../../test-data/user-Data';
import { expectStatus } from '../../utils/assertions';


test('Register User', { tag: ['@api', '@smoke'] }, async ({ authAPI }) => {
    let payLoad = generateUser();

    let responseJson:ApiResult<RegisterUserResponse> = await authAPI.registerUser(payLoad);
    await expect(responseJson.raw_response.status(),'200'),
    expect(responseJson.custom_response.success).toBe(true);
    expect(responseJson.custom_response.user.id).toBeTruthy();
    expect(responseJson.custom_response.user.email).toBe(payLoad.email);

    let getUserResponseJson:ApiResult<CurrentLoggedInUserResponse> = await authAPI.getCurrentUser(responseJson.custom_response.token);
})

test('Register User -2', { tag: ['@api', '@smoke'] }, async ({ authAPI, authenticatedUser }) => {
    let getUserResponseJson:ApiResult<CurrentLoggedInUserResponse> = await authAPI.getCurrentUser(authenticatedUser.token);
})

test('Event Creation via UI and Verification via API', { tag: ['@api', '@regression'] }, async ({ loggedInUIUser, request, authenticatedUser }) => {
    let eventsAPI = new EventsAPI(request);
    let fetchEvent: ApiResult<FetchEventsResponse> | undefined;
    try {
        await loggedInUIUser.goto('/');
        let eventName = 'Test Event - 546'
        await loggedInUIUser.getByTestId('nav-events').click();
        let eventsPage = new EventsPage(loggedInUIUser);
        await eventsPage.addEventLink.click();
        await eventsPage.createEvent(eventName,
            "This is test event for worker scope fixtures test",
            "Hyderabad", 'H:No: 14-20-574/1 Rajeev Gandhi Nagar, Borabanda, Hyderabad - 18',
            "2028-08-22T14:30",
            "100",
            "100");
        await eventsPage.addEventButton.click();
        await expect(eventsPage.getEventRow(eventName)).toHaveCount(1);
        await eventsPage.page.goto('/');
        await eventsPage.page.locator('#event-card').filter({hasText:eventName}).locator('h3').click();
        await eventsPage.page.waitForURL(/\/events\/\d+/);
        let eventID:number = parseInt(eventsPage.page.url().split('/events/')[1]);
        //API verification
        let queryParams = new Map<string, string>([
            ['search', eventName],
            ['city', 'Hyderabad']
        ]);
        fetchEvent = await eventsAPI.fetchEvent(queryParams,eventID,authenticatedUser.token);
        expectStatus(fetchEvent.raw_response,200)
        expect(fetchEvent.custom_response.success).toBeTruthy();
        expect(fetchEvent.custom_response.data).toBeDefined();
        expect(fetchEvent.custom_response.data.title).toBe(eventName);
    }
    finally{
        console.log("Cleaning Up the event");
        if (fetchEvent?.custom_response?.data) {
            await eventsAPI.deleteEvent(fetchEvent.custom_response.data.id, authenticatedUser.token);
        }
    }
});
