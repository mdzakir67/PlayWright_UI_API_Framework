import { APIRequestContext, APIResponse } from "@playwright/test";
import { CreateEventPayload} from "./types/events.types";
import { CreateEventResponseSchema, DeleteEventResponseSchema, FetchEventsResponseSchema, CreateEventResponse, DeleteEventResponse, FetchEventsResponse  } from "./schemas/events.schemas";


export type ApiResult<T> = {
  raw_response: APIResponse;
  custom_response: T;
};

export class EventsAPI {

    readonly baseURI = 'https://api.eventhub.rahulshettyacademy.com/api/'
    constructor(private request: APIRequestContext) { }

    async createEvent(token: string, eventPayload: CreateEventPayload): Promise<ApiResult<CreateEventResponse>> {
        let eventJsonResponse = await (await this.request.post(this.baseURI + 'events', {
            data: eventPayload, headers: {
                Authorization: `Bearer ${token}`,
            }
        }))

        return{
            raw_response: eventJsonResponse,
            custom_response: CreateEventResponseSchema.parse(await eventJsonResponse.json())
        }
    }

    async fetchEvent(queryParams: Map<string, string>, eventId: number, token: string): Promise<ApiResult<FetchEventsResponse>> {
        let fetchEventResponse = await (await this.request.get(this.baseURI + 'events/' + `${eventId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            params: Object.fromEntries(queryParams)
        }));

        return {
            raw_response: fetchEventResponse,
            custom_response: FetchEventsResponseSchema.parse(await fetchEventResponse.json())
        }
    }

    async deleteEvent(eventId: number, token: string): Promise<ApiResult<DeleteEventResponse>> {
        let deleteEventResponse = await (await this.request.delete(this.baseURI + 'events/' + `${eventId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }));
        console.log(deleteEventResponse);
        return {
            raw_response: deleteEventResponse,
            custom_response: DeleteEventResponseSchema.parse(await deleteEventResponse.json())
        }
    }
}