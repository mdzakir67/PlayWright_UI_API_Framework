import { CreateEventPayload } from "../api/types/events.types";
import { CreateUserPayload } from "../api/types/auth.types";


export function generateUser(overrides: Partial<CreateUserPayload> = {}): CreateUserPayload {
    const user:CreateUserPayload = {
                email: `zakir${Date.now()}${Math.floor(Math.random() * 10000)}.hussain@gmail.com`, //Update number for unique user 
                password: "secret123"
            };

    return {
        ...user,
        ...overrides
    }
}

export function generateEvent(overrides:Partial<CreateEventPayload>={}):CreateEventPayload{

    const event:CreateEventPayload={
        title: `Test Event - ${Date.now()}`,
        description: 'This is a test event',
        category: 'Conference',
        venue: 'Test Venue',
        city: 'Hyderabad',
        eventDate: '2028-06-15T09:00:00.000Z',
        price: 100,
        totalSeats: 100,
        imageUrl: 'https://example.com/banner.jpg'
    }

    return {
        ...event,
        ...overrides
    }

}